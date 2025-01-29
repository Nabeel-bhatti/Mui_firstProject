import React from "react";
import { Box, Button, styled } from "@mui/material";

import { LightModeOutlined, ChevronLeftOutlined } from "@mui/icons-material";
import { NavLink } from "react-router-dom";

function AdvanceSearch({ child }) {
  const P = styled(NavLink)`
    text-decoration: none;
    text-underline-offset: 5px;
    display: flex;
    text-align: left;
    align-items: center;
    font-size: 14px;
    color: #fff;
    &.active {
      background-color: #6e39cb;
    }
  `;
  return (
    <div>
      <Box
        px={3}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#6e39cb",
          alignItems: "center",
          textAlign: "center",
          minHeight: 64,
        }}
      >
        <Box>
          <P
            sx={{
              fontSize: "20px",
              fontWeight: 500,
            }}
          >
            Athlete Stats
          </P>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            columnGap: 2,
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <P
            style={({ isActive }) => {
              return {
                textDecoration: isActive ? "underline" : "",
              };
            }}
            to="/athlete"
          >
            ATHLETE
          </P>
          <P
            style={({ isActive }) => {
              return {
                textDecoration: isActive ? "underline" : "",
              };
            }}
            to="/event"
          >
            EVENT
          </P>
          <P
            style={({ isActive }) => {
              return {
                textDecoration: isActive ? "underline" : "",
              };
            }}
            to="/performance"
          >
            PERFORMANCE
          </P>
          <P
            style={({ isActive }) => {
              return {
                textDecoration: isActive ? "underline" : "",
              };
            }}
            to="/task"
          >
            TASK
          </P>
          <P
            style={({ isActive }) => {
              return {
                textDecoration: isActive ? "underline" : "",
              };
            }}
            to="/time"
          >
            TIME
          </P>
          <Button
            startIcon={<LightModeOutlined />}
            variant="text"
            sx={{ color: "#fff" }}
          >
            Light
          </Button>
          <Button
            LinkComponent={NavLink}
            className="navbar-brand"
            to="/"
            startIcon={<ChevronLeftOutlined />}
            sx={{ color: "#fff", backgroundColor: "#8b61d5" }}
            variant="contained"
          >
            BACK TO DASHBOARD
          </Button>
        </Box>
      </Box>
      {child}
    </div>
  );
}

export default AdvanceSearch;
