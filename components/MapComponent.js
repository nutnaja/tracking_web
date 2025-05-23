// components/MapComponent.jsx
"use client";

import { LinearProgress, Container, Button , Typography } from "@mui/material";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  async function fetchAllData() {
    let allFeatures = [];
    let page = 1;
    const limit = 10000; // ดึงที่ละ 10000 ข้อมูล
    let hasMoreData = true;
    while (hasMoreData) {
      const offset = (page - 1) * limit;
      const response = await fetch(
        `https://v2k-dev.vallarismaps.com/core/api/features/1.1/collections/658cd4f88a4811f10a47cea7/items?limit=${limit}&offset=${offset}&api_key=bLNytlxTHZINWGt1GIRQBUaIlqz9X45XykLD83UkzIoN6PFgqbH7M7EDbsdgKVwC`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        allFeatures = [...allFeatures, ...data.features];
        page++;
      } else {
        hasMoreData = false;
      }

      if (data.features.length < limit) {
        hasMoreData = false;
      }
    }

    return {
      type: "FeatureCollection",
      features: allFeatures,
    };
  }

  useEffect(() => {
    if (map.current) return;

    // สร้างแผนที่เมื่อถูกโหลด
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json", // style URL สาธารณะ
      center: [100.5018, 13.7563], // ตั้งค่าเริ่มต้นที่กรุงเทพฯ
      zoom: 7,
      pitch: 45,
      bearing: 0,
    });

    // เพิ่ม navigation control
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // โหลดข้อมูลเมื่อแผนที่โหลดเสร็จ
    map.current.on("load", async () => {
      try {
        // เรียกใช้ฟังก์ชันดึงข้อมูลทั้งหมด
        const geoJsonData = await fetchAllData();
        // console.log("GeoJSON data:", geoJsonData);
        // console.log(
        //   "Feature count:",
        //   geoJsonData.features ? geoJsonData.features.length : 0
        // );

        // ตรวจสอบว่ามีข้อมูล features หรือไม่
        if (!geoJsonData.features || geoJsonData.features.length === 0) {
          console.error("No features found in the GeoJSON data");
          setError("ไม่พบข้อมูลจุดพิกัด");
          setLoading(false);
          return;
        }

        const countryGroups = {};
        geoJsonData.features.forEach((feature) => {
          const country = feature.properties.ct_en || "Unknown";
          const coords = feature.geometry.coordinates;

          if (!countryGroups[country]) {
            countryGroups[country] = [];
          }
          countryGroups[country].push(coords);
        });

        // สร้าง bounds สำหรับแต่ละประเทศ
        const countryData = Object.entries(countryGroups).map(
          ([country, coords]) => {
            const bounds = new maplibregl.LngLatBounds();
            coords.forEach((coord) => bounds.extend(coord));
            return {
              name: country,
              bounds,
            };
          }
        );

        setCountries(countryData);

        // เพิ่ม geojson source พร้อมเปิดใช้ clustering
        map.current.addSource("points", {
          type: "geojson",
          data: geoJsonData,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        //เอาไว้ทดสอบเวลา mark ไม่ออกนะ
        // map.current.addSource('points', {
        //     type: 'geojson',
        //     data: geoJsonData,
        //     cluster: false
        //   });

        // Layer สำหรับแสดงกลุ่ม (clusters)
        map.current.addLayer({
          id: "clusters",
          type: "circle",
          source: "points",
          filter: ["has", "point_count"],
          paint: {
            // ขนาดของวงกลมตามจำนวนจุดในกลุ่ม
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20, // ขนาด 20px สำหรับจุด 1-99
              100, // ถ้ามีจุด 100 ขึ้นไป
              30, // ขนาด 30px
              1000, // ถ้ามีจุด 1000 ขึ้นไป
              40, // ขนาด 40px
            ],
            // สีของวงกลมตามจำนวนจุดในกลุ่ม
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#66BB6A", // สีสำหรับจุด 1-99
              100,
              "#FFA726", // สีสำหรับจุด 100-999
              1000,
              "#E53935", // สีสำหรับจุด 1000 ขึ้นไป
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // Layer สำหรับแสดงจำนวนจุดในแต่ละกลุ่ม
        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "points",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["Noto Sans Regular"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Layer สำหรับแสดงจุดเดี่ยวที่ไม่ได้อยู่ในกลุ่ม
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "points",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#9E9E9E",
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // คลิกที่กลุ่มเพื่อซูมเข้า
        map.current.on("click", "clusters", (e) => {
          const features = map.current.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });
          const clusterId = features[0].properties.cluster_id;

          // ดึงจุดทั้งหมดในกลุ่มนี้และซูมเข้า
          map.current
            .getSource("points")
            .getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err) return;

              map.current.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom,
              });
            });
        });

        // เพิ่ม popup เมื่อคลิกที่จุดเดี่ยว
        map.current.on("click", "unclustered-point", (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const properties = e.features[0].properties;

          // สร้าง content สำหรับ popup
          let popupContent = "<div>";
          for (const key in properties) {
            popupContent += `<strong>${key}:</strong> ${properties[key]}<br/>`;
          }
          popupContent += "</div>";

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map.current);
        });

        // เปลี่ยน cursor เมื่อ hover บนกลุ่ม
        map.current.on("mouseenter", "clusters", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "clusters", () => {
          map.current.getCanvas().style.cursor = "";
        });

        // เปลี่ยน cursor เมื่อ hover บนจุดเดี่ยว
        map.current.on("mouseenter", "unclustered-point", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "unclustered-point", () => {
          map.current.getCanvas().style.cursor = "";
        });

        // อาจจะมีการ fit bounds ไปที่พื้นที่ที่มีข้อมูล
        if (geoJsonData.features && geoJsonData.features.length > 0) {
          // สร้าง bounds จากข้อมูลทั้งหมด
          const bounds = new maplibregl.LngLatBounds();

          geoJsonData.features.forEach((feature) => {
            if (feature.geometry && feature.geometry.coordinates) {
              bounds.extend(feature.geometry.coordinates);
            }
          });

          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div>
      <Container fixed>
        <Typography variant="h4" sx={{ mt: 1, color: "text.primary" }}>
          ร้านค้าสะดวกซื้อที่ท่านตามหา มีกี่สาขา ที่ไหนกันบ้างนะ ? 
        </Typography>
        { loading ? (
           <div className="pb-2">
           <h1>กำลังโหลดข้อมูล โปรดรอสักครู่.......</h1>
         </div>
        ) : (
         <div className="pb-2">
         <h1>ท่านสามารถเลือกประเทศเพื่อซูมเข้าไปที่ประเทศนั้นได้</h1>
       </div>
       )}
       
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {countries.map((country) => (
            <Button
              key={country.name}
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => {
                map.current.fitBounds(country.bounds, {
                  padding: 50,
                  maxZoom: 10,
                });
              }}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              {country.name}
            </Button>
          ))}
        </div>
        <div
          ref={mapContainer}
          style={{ width: "100%", height: "600px", borderRadius: "8px" }}
        />
        {loading && <LinearProgress color="secondary" />}
        {error && <p className="error">เกิดข้อผิดพลาด: {error}</p>}
      </Container>
    </div>
  );
}
