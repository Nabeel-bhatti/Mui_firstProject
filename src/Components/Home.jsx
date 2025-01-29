import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Card,
  Box,
  Typography,
  CardContent,
  Button,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DirectionsRun,
  CalendarMonthOutlined,
  ScoreboardOutlined,
  SportsScoreOutlined,
} from "@mui/icons-material";
import {
  getAthletes,
  getResults,
  getCompetitions,
  getAllEvents,
} from "../Services/GetServices";

const StyledBox = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
  p: 3,
});
const StyledCard = styled(Card)({
  minWidth: 250,
  textAlign: "center",
  borderRadius: "8px",
});
const StyledCardContent = styled(CardContent)({
  display: "flex",
  justifyContent: "space-between",
  textAlign: "center",
  alignItems: "center",
});
const StyledButton = styled(Button)({
  backgroundColor: "none",
  width: "90%",
  color: "#6e39cb",
  border: "1px solid #DBDCDE",
  borderRadius: "8px",
  boxShadow: "0px 0px 4px 1px rgba(0, 0, 0, 0.25)",
});

function Home() {
  const [totalAthletes, setTotalAthletes] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [totalCompetitions, setTotalCompetitions] = useState(0);
  let navigate = useNavigate();

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const resp = await getAthletes();
        const result = resp?.data?.data;
        setTotalAthletes(result.total);
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          alert(errorMessage);
        } else {
          console.error("Error fetching data:", error);
          alert("An error occurred while fetching data.");
        }
      }
    };

    fetchCount();
  }, [navigate]);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const resp = await getResults();
        const result = resp?.data?.data;
        setTotalResults(result.total);
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          alert(errorMessage);
        } else {
          console.error("Error fetching data:", error);
          alert("An error occurred while fetching data.");
        }
      }
    };

    fetchCount();
  }, [navigate]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const resp = await getCompetitions();
        const result = resp?.data?.data;
        setTotalCompetitions(result.total);
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          alert(errorMessage);
        } else {
          console.error("Error fetching data:", error);
          alert("An error occurred while fetching data.");
        }
      }
    };

    fetchCount();
  }, [navigate]);
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const resp = await getAllEvents();
        const result = resp?.data?.data;
        setTotalEvents(result.total);
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          alert(errorMessage);
        } else {
          console.error("Error fetching data:", error);
          alert("An error occurred while fetching data.");
        }
      }
    };

    fetchCount();
  }, [navigate]);

  return (
    <Container
      sx={{ backgroundColor: "#f4f5f9", minHeight: "100vh", padding: 0 }}
    >
      <Typography variant="h4" sx={{ color: "#6e39cb", py: 2 }}>
        Home
      </Typography>
      <Paper
        elevation={4}
        sx={{
          p: 2,
        }}
      >
        <StyledBox>
          <Typography variant="h5" sx={{ color: "#6e39cb", pb: 2 }}>
            Statistics
          </Typography>
        </StyledBox>
        <StyledBox>
          <StyledCard elevation={4}>
            <StyledCardContent>
              <Typography sx={{ fontSize: "20px" }}>Toatal Athelets</Typography>
              <DirectionsRun />
            </StyledCardContent>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontSize: "50px", color: "#6e39cb" }}
              >
                {totalAthletes}
              </Typography>
            </CardContent>

            <CardContent>
              <StyledButton elevation={3} size="large" href="athletes">
                DETAILS
              </StyledButton>
            </CardContent>
          </StyledCard>
          <StyledCard elevation={4}>
            <StyledCardContent>
              <Typography sx={{ fontSize: "20px" }}>Toatal Events</Typography>
              <CalendarMonthOutlined />
            </StyledCardContent>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontSize: "50px", color: "#6e39cb" }}
              >
                {totalEvents}
              </Typography>
            </CardContent>

            <CardContent>
              <StyledButton elevation={3} size="large" href="events">
                DETAILS
              </StyledButton>
            </CardContent>
          </StyledCard>
          <StyledCard elevation={4}>
            <StyledCardContent>
              <Typography sx={{ fontSize: "20px" }}>Result Data</Typography>
              <ScoreboardOutlined />
            </StyledCardContent>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontSize: "50px", color: "#6e39cb" }}
              >
                {totalResults}
              </Typography>
            </CardContent>

            <CardContent>
              <StyledButton elevation={3} size="large" href="results">
                DETAILS
              </StyledButton>
            </CardContent>
          </StyledCard>
          <StyledCard elevation={4}>
            <StyledCardContent>
              <Typography sx={{ fontSize: "20px" }}>
                Competition Data
              </Typography>
              <SportsScoreOutlined />
            </StyledCardContent>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontSize: "50px", color: "#6e39cb" }}
              >
                {totalCompetitions}
              </Typography>
            </CardContent>

            <CardContent>
              <StyledButton elevation={3} size="large" href="competition">
                DETAILS
              </StyledButton>
            </CardContent>
          </StyledCard>
        </StyledBox>
      </Paper>
    </Container>
  );
}

export default Home;
