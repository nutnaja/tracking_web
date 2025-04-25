// Footer Component
import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        bgcolor: '#f5f5f5', 
        py: 2, 
        borderTop: '1px solid #e0e0e0' 
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            นายยศวริศ เอมพันธ์
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            อีเมล: yoswaris19@gmail.com
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            โทรศัพท์: 065-005-1949
          </Typography>
          
        </Box>
      </Container>
    </Box>
  );
}