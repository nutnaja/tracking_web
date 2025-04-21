"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,

} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import NavigationIcon from "@mui/icons-material/Navigation";

export default function HighlightsHome() {


  const featureItems = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 50 }} />,
      title: "ค้นหาสถานที่",
      description:
        "ค้นหาสถานที่ต่างๆ ได้อย่างรวดเร็วและแม่นยำด้วยระบบค้นหาขั้นสูง",
    },
    {
      icon: <TravelExploreIcon sx={{ fontSize: 50 }} />,
      title: "สำรวจพื้นที่โดยรอบ",
      description: "ค้นพบสถานที่น่าสนใจรอบตัวคุณที่อาจไม่เคยรู้จักมาก่อน",
    },
    {
      icon: <NavigationIcon sx={{ fontSize: 50 }} />,
      title: "เส้นทางการเดินทาง",
      description:
        "วางแผนเส้นทางการเดินทางที่ดีที่สุดไปยังจุดหมายปลายทางของคุณ",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          pt: 8,
          pb: 6,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(/api/placeholder/1200/400)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            ค้นหาโลกด้วย Map Explorer
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            ค้นพบสถานที่ใหม่ๆ วางแผนเส้นทางการเดินทาง และสำรวจโลกรอบตัวคุณ
            ด้วยแผนที่ที่ใช้งานง่ายและมีประสิทธิภาพ
          </Typography>
          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              variant="contained"
              size="large"
              component="a"
              href="/tracking/"
            >
              ไปที่แผนที่
            </Button>
            <Button variant="outlined" size="large">
              เรียนรู้เพิ่มเติม
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          บริการของเรา
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          ค้นพบคุณสมบัติและฟีเจอร์ที่จะช่วยให้การเดินทางของคุณสะดวกยิ่งขึ้น
        </Typography>

        <Grid container spacing={4}>
          {featureItems.map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                  <Box sx={{ color: "primary.main", mb: 2 }}>{item.icon}</Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {item.title}
                  </Typography>
                  <Typography>{item.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            พร้อมที่จะเริ่มการเดินทางของคุณแล้วหรือยัง?
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            ค้นพบสถานที่ใหม่ๆ และเริ่มการผจญภัยของคุณได้เลยวันนี้
          </Typography>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              component="a"
              href="/tracking"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
              }}
            >
              เปิดแผนที่เลย
            </Button>
          </Box>
        </Container>
      </Box>

    </>
  );
}
