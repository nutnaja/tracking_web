"use client";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
} from "@mui/material";

import Link from "next/link";

function ResponsiveAppBar() {
    return (
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar variant="dense">
            <Typography variant="h6" color="inherit" component="div">
            <Link href="/">Tracking Shop</Link>
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
    );
}
export default ResponsiveAppBar;
