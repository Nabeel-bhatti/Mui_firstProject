import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { Box, Container, styled, List, Collapse } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  QueryStats,
  DirectionsRun,
  CalendarMonthOutlined,
  TuneOutlined,
  ExpandLess,
  ExpandMore,
  AccountCircle,
  Logout,
  UploadFile,
} from "@mui/icons-material";

function Sidebar({ child }) {
  const [user, setUser] = useState(null);
  let navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("Bdata");
    if (!storedData) {
      alert("Your session has Expired! Please login again");
      navigate("/login");
      return;
    }
    const parsedData = JSON.parse(storedData);
    setUser(parsedData?.data?.name);
  }, [navigate]);

  // console.log("User name:", user);

  const [open, setOpen] = useState(true);
  const handleClick = () => {
    setOpen(!open);
  };

  function handleLogout() {
    localStorage.clear();
  }

  const Items = styled(NavLink)({
    padding: 5,
    paddingLeft: 30,
    borderRadius: 18,
    marginBottom: 10,
    textDecoration: "none",
    display: "flex",
    textAlign: "left",
    alignItems: "center",
    fontSize: "16px",
    color: "#000",
    "&:hover": {
      backgroundColor: "#d3bbfe",
    },
  });

  const P = styled(NavLink)({
    color: "#000",
    padding: 5,
    borderRadius: 18,
    marginBottom: 10,
    textDecoration: "none",
    display: "flex",
    textAlign: "left",
    alignItems: "center",
    columnGap: 10,
    fontSize: "16px",
    "&:hover": {
      backgroundColor: "#d3bbfe",
    },
  });
  const PMain = styled(Link)({
    color: "#000",
    textDecoration: "none",
    display: "flex",
    textAlign: "left",
    alignItems: "center",
    columnGap: 10,
    marginBottom: 10,
    fontSize: "16px",
  });
  return (
    <Grid container>
      <Grid
        item
        size={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          height: "100vh",
        }}
      >
        <Container
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "89vh",
            overscrollBehaviorY: "auto",
            overflowY: "scroll",
          }}
        >
          <PMain
            sx={{
              fontSize: "24px",
              display: "flex",
              textAlign: "center",
              alignItems: "center",
              justifyContent: "center",
              color: "#000",
              py: 3,
              mb: 1,
            }}
            onClick={() => navigate("/")}
          >
            Athlete Stats
          </PMain>
          <Box>
            <P className="navbar-brand" to="/advance">
              <QueryStats /> Advance Search
            </P>
            <P className="navbar-brand" to="/athletes">
              <DirectionsRun /> Athletes
            </P>
            <P className="navbar-brand" to="/events">
              <CalendarMonthOutlined /> Events
            </P>
            <List component="nav" aria-labelledby="nested-list-subheader">
              <PMain onClick={handleClick}>
                <TuneOutlined /> Managment Center
                {open ? <ExpandLess /> : <ExpandMore />}
              </PMain>
              <Collapse in={!open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <Items className="navbar-brand" to="/gender">
                    Gender
                  </Items>
                  <Items className="navbar-brand" to="/timeranges">
                    Time Range
                  </Items>
                  <Items className="navbar-brand" to="/results">
                    Results
                  </Items>
                  <Items className="navbar-brand" to="/eventtasks">
                    Event Tasks
                  </Items>
                  <Items className="navbar-brand" to="/competition">
                    Competition
                  </Items>
                </List>
              </Collapse>
            </List>
            <P className="navbar-brand" to="/upload">
              <UploadFile /> Upload CSV
            </P>
          </Box>
        </Container>
        <Container>
          <P
            className="navbar-brand"
            to="/login"
            onClick={handleLogout}
            sx={{
              backgroundColor: "#6e39cb",
              color: "#fff",
              borderRadius: 2,
              padding: 1,
              position: "fixed",
              maxWidth: 180,
              bottom: 0,
              left: 15,
            }}
          >
            <AccountCircle color="#bdbdbd" fontSize="large" /> {user}
            <Logout />
          </P>
        </Container>
      </Grid>
      <Grid
        item
        size={10}
        sx={{
          height: "100vh",
        }}
      >
        {child}
      </Grid>
    </Grid>
  );
}

export default Sidebar;
