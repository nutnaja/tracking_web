"use client";
import React, {  useState } from "react";
import {
  Box,
  Container,
} from "@mui/material";


function HighlightsHome() {

  const cards = [
    {
      id: 1,
      title: "สาขาเยอะที่สุด ?",
      description: "เรามีสาขาที่เยอะที่สุด หาง่ายที่สุด และอยู่ในจุดที่หาง่ายที่สุด",
    },
    {
      id: 2,
      title: "ทำไมต้อง Yoswaris Shop",
      description: "สะดวก ของขายเยอะ สาขาเพียบ หาง่าย",
    },
    {
      id: 3,
      title: "Yoswaris Shop Promotions",
      description: "เร็ว ๆ นี้",
    },
  ];
  
  return (
    <div>
      <Container fixed>
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
            gap: 2,
          }}
        >
          {cards.map((item, index) => (
      <div 
        key={item.id} 
        style={{ 
          border: "1px solid #ddd", 
          borderRadius: "8px",
        }}
      >
        <div 
          style={{ 
            padding: "16px", 
            height: "100%", 
          }}
        >
          <h3>{item.title}</h3>
          <p style={{ color: "#666" }}>{item.description}</p>
        </div>
      </div>
    ))}
        </Box>
      </Container>
    </div>
  );
}
export default HighlightsHome;
