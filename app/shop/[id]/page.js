"use client";

import { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Link,
  Breadcrumbs,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";

export default function ShopDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ใช้ useRef แทน useState สำหรับตัวแปรที่ไม่ต้องการให้ trigger การ render
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // ดึงข้อมูลร้านค้าตาม ID
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        setError(null);

        const baseUrl =
          "https://v2k-dev.vallarismaps.com/core/api/features/1.1/collections/658cd4f88a4811f10a47cea7/items";
        const apiKey =
          "bLNytlxTHZINWGt1GIRQBUaIlqz9X45XykLD83UkzIoN6PFgqbH7M7EDbsdgKVwC";

        // สร้าง URL สำหรับดึงข้อมูลเฉพาะ ID
        const url = `${baseUrl}/${id}?api_key=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`ไม่พบข้อมูลร้านค้าที่มี ID: ${id}`);
          }
          throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
        }

        const data = await response.json();
        setShopData(data);
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลร้านค้า:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShopData();
    }
  }, [id]);

  // สร้างแผนที่เมื่อมีข้อมูลร้านค้า
  useEffect(() => {
    // เช็คว่ามีข้อมูลร้านค้าหรือไม่ และแผนที่ยังไม่ถูกสร้าง
    if (!shopData || mapRef.current) return;

    const coordinates = shopData.geometry?.coordinates;
    if (!coordinates || coordinates.length < 2) return;

    // คืนค่าเร็วๆ ถ้ายังไม่มี DOM element
    if (!mapContainerRef.current) return;

    // สร้างแผนที่
    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: coordinates,
      zoom: 15,
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    // สร้าง marker
    const marker = document.createElement("div");
    marker.className = "shop-location-marker";
    marker.style.width = "25px";
    marker.style.height = "25px";
    marker.style.borderRadius = "50%";
    marker.style.backgroundColor = "#e74c3c";
    marker.style.border = "3px solid white";
    marker.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

    new maplibregl.Marker(marker).setLngLat(coordinates).addTo(mapRef.current);

    // cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [shopData]); // shopData เท่านั้นเป็น dependency

  const handleBack = () => {
    router.back();
  };

  // แสดงข้อความกำลังโหลด
  if (loading) {
    return (
      <Container
        maxWidth="lg"
        sx={{
          mt: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>กำลังโหลดข้อมูลร้านค้า...</Typography>
      </Container>
    );
  }

  // แสดงข้อความเมื่อเกิดข้อผิดพลาด
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          กลับ
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  // แสดงข้อความเมื่อไม่พบข้อมูล
  if (!shopData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          กลับ
        </Button>
        <Alert severity="warning">ไม่พบข้อมูลร้านค้า ID: {id}</Alert>
      </Container>
    );
  }

  return (
    <div>
      <ResponsiveAppBar />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            แผนที่
          </Link>
          <Typography sx={{ color: "text.primary" }}>รายละเอียดร้านค้า</Typography>
        </Breadcrumbs>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            รายละเอียดร้านค้า
          </Typography>
          <Chip label={`ID: ${id}`} color="primary" sx={{ mb: 2 }} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                ข้อมูลทั่วไป
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 3 }}
              >
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        component="th"
                        sx={{ width: "40%", bgcolor: "grey.100" }}
                      >
                        ID
                      </TableCell>
                      <TableCell>{id}</TableCell>
                    </TableRow>

                    {shopData.properties &&
                      Object.entries(shopData.properties)
                        .filter(
                          ([key, value]) =>
                            value !== null && value !== undefined
                        )
                        .map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell
                              component="th"
                              sx={{ width: "40%", bgcolor: "grey.100" }}
                            >
                              {key}
                            </TableCell>
                            <TableCell>
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : value.toString()}
                            </TableCell>
                          </TableRow>
                        ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {shopData.geometry && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon color="error" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">พิกัด</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ pl: 4 }}>
                    ละติจูด: {shopData.geometry.coordinates[1]}
                  </Typography>
                  <Typography variant="body2" sx={{ pl: 4 }}>
                    ลองจิจูด: {shopData.geometry.coordinates[0]}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Typography variant="h6" sx={{ p: 2 }}>
                ตำแหน่งบนแผนที่
              </Typography>
              <Divider />
              <Box
                ref={mapContainerRef}
                sx={{
                  width: "100%",
                  height: 400,
                  border: "1px solid #eee",
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                ข้อมูล JSON
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  overflowX: "auto",
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(shopData, null, 2)}
                </pre>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
