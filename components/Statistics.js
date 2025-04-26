"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Card } from "@mui/material";
import { People as PeopleIcon, Menu as MenuIcon } from "@mui/icons-material";

function Statistics() {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const generateRandomVisitorCount = () => {
      return Math.floor(100000 + Math.random() * 9900000);
    };
    setVisitorCount(generateRandomVisitorCount());
  }, []);

  return (
    <div>
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Card
          sx={{
            textAlign: "center",
            py: 2,
            backgroundColor: '#f5f5f5' , 
            borderRadius: 4,
          }}
        >
          <PeopleIcon sx={{ fontSize: 50, color: "secondary.primary", mb: 2 }} />
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "text.primary" }}
          >
            ขณะนี้มีผู้เข้าชมแล้ว
          </Typography>
          <Typography
            variant="h1"
            component="div"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "3rem", sm: "4rem", md: "4rem" },
              color: "secondary.primary",
            }}
          >
            {visitorCount.toLocaleString("th-TH")}
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, color: "text.primary" }}>
            คน
          </Typography>
        </Card>
      </Container>
    </div>
  );
}
export default Statistics;
