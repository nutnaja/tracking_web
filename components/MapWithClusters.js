'use client'
import  { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";

const MapWithClusters = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const superclusterRef = useRef(null);
  const [features, setFeatures] = useState([]);
  const [bounds, setBounds] = useState([]);
  const [zoom, setZoom] = useState(4);

  // ดึงข้อมูล API
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(
        "https://v2k-dev.vallarismaps.com/core/api/features/1.1/collections/658cd4f88a4811f10a47cea7/items?api_key=bLNytlxTHZINWGt1GIRQBUaIlqz9X45XykLD83UkzIoN6PFgqbH7M7EDbsdgKVwC"
      );
      const data = await res.json();

      const formatted = data.features
        .filter((f) => f.properties.latitude && f.properties.longitude)
        .map((f) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(f.properties.longitude),
              parseFloat(f.properties.latitude),
            ],
          },
          properties: {
            cluster: false,
            country: f.properties.ct_en || "Unknown",
          },
        }));

      setFeatures(formatted);
    };

    fetchData();
  }, []);

  // สร้าง supercluster
  useEffect(() => {
    if (features.length > 0) {
      superclusterRef.current = new Supercluster({
        radius: 60,
        maxZoom: 16,
      });
      superclusterRef.current.load(features);
    }
  }, [features]);

  // สร้างแผนที่
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [100.5, 13.7],
      zoom: zoom,
    });

    mapRef.current = map;

    map.on("moveend", () => {
      const b = map.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
      setZoom(map.getZoom());
    });

    map.on("load", () => {
      const b = map.getBounds();
      setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    });

    return () => map.remove();
  }, []);

  // แสดง marker และ cluster
  useEffect(() => {
    if (!mapRef.current || !superclusterRef.current) return;
    const map = mapRef.current;

    // ลบ marker เก่า
    const markers = document.getElementsByClassName("marker");
    while (markers.length > 0) {
      markers[0].parentNode?.removeChild(markers[0]);
    }

    const clusters = superclusterRef.current.getClusters(bounds, Math.round(zoom));

    clusters.forEach((cluster) => {
      const { geometry, properties } = cluster;
      const [lng, lat] = geometry.coordinates;
      const isCluster = properties.cluster;

      const el = document.createElement("div");
      el.className = "marker";
      el.style.background = isCluster ? "#1976d2" : "#e91e63";
      el.style.color = "white";
      el.style.borderRadius = "50%";
      el.style.padding = "6px 8px";
      el.style.fontSize = "12px";
      el.style.fontWeight = "bold";
      el.style.cursor = "pointer";
      el.style.boxShadow = "0 0 4px rgba(0,0,0,0.4)";

      if (isCluster) {
        const label = `${(properties.country || "XX").slice(0, 2).toUpperCase()}${properties.point_count}`;
        el.innerText = label;

        el.onclick = () => {
          const expansionZoom = superclusterRef.current.getClusterExpansionZoom(properties.cluster_id);
          map.easeTo({ center: [lng, lat], zoom: expansionZoom });
        };
      } else {
        el.innerText = (properties.country || "XX").slice(0, 2).toUpperCase() + "1";
      }

      new maplibregl.Marker(el).setLngLat([lng, lat]).addTo(map);
    });
  }, [bounds, zoom]);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "600px" }} />;
};

export default MapWithClusters;
