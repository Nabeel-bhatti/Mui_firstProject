import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Typography,
  Paper,
  Box,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";

function Athlete() {
  const [athleteData, setAthleteData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [athleteNames, setAthleteNames] = useState([]);
  const [debounceValue, setDebounceValue] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 3,
  });

  const columns = [
    { field: "id", headerName: "Sr#", flex: 1},
    { field: "athlete", headerName: "Athlete Name", flex: 1 },
    { field: "year", headerName: "Year", flex: 1 },
    { field: "competition", headerName: "Competition", flex: 1 },
    { field: "eventname", headerName: "Event Name", flex: 1 },
    { field: "win_score", headerName: "Win Score", flex: 1 },
    { field: "avg_score", headerName: "Avg Score", flex: 1 },
    { field: "place", headerName: "Place", flex: 1 },
    { field: "score", headerName: "Score", flex: 1 },
    { field: "margin", headerName: "Margin", flex: 1 },
    { field: "percentile", headerName: "Percentile", flex: 1 },
  ];

  useEffect(() => {
    const delay = setTimeout(() => setDebounceValue(inputValue), 500);
    return () => clearTimeout(delay);
  }, [inputValue]);

  useEffect(() => {
    if (!debounceValue) {
      setAthleteNames([]);
      setSelectedAthleteId(null);
      setAthleteData([]);
      setPaginationModel({ page: 0, pageSize: 3 });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/publicData/athlete?name=${debounceValue}`
        );
        if (!res.ok) throw new Error("Failed to fetch dropdown data");
        const data = await res.json();
        setAthleteNames(data.data.map(({ name, id }) => ({ name, id })));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [debounceValue]);

  useEffect(() => {
    if (!selectedAthleteId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/search/athlete?page=${paginationModel.page + 1}&page_size=${paginationModel.pageSize}&athlete=${selectedAthleteId}`
        );
        if (!res.ok) throw new Error("Failed to fetch athlete data");
        const { data } = await res.json();

        setTotalPage(data.meta.total);

        setAthleteData(
          data.data.map((item, index) => ({
            id: index + 1 + paginationModel.page * paginationModel.pageSize,
            athlete: item.athlete,
            year: item.year,
            competition: item.competition,
            eventname: item.event,
            win_score: item.win_score,
            avg_score: item.avg_score,
            place: item.place,
            score: item.score,
            margin: item.margin,
            percentile: item.percentile,
          }))
        );
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    })();
  }, [paginationModel, selectedAthleteId]);

  return (
    <Paper elevation={4} sx={{ pb: 1, m: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
        }}
      >
        <Typography variant="h5" sx={{ color: "#6e39cb" }}>
          Athlete Data
        </Typography>
        <Stack>
          <Autocomplete
            sx={{ minWidth: 250 }}
            inputValue={inputValue}
            onInputChange={(e, val) => setInputValue(val)}
            onChange={(e, val) => {
              const athlete = athleteNames.find((a) => a.name === val);
              if (athlete) setSelectedAthleteId(athlete.id);
            }}
            options={athleteNames.map((a) => a.name)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Athlete"
                variant="standard"
              />
            )}
          />
        </Stack>
      </Box>
      <DataGrid
        columns={columns}
        rows={athleteData}
        rowCount={totalPage}
        loading={loading}
        pagination
        pageSizeOptions={[3, 5, 10, 20, 30]}
        paginationModel={paginationModel}
        paginationMode="server"
        onPaginationModelChange={setPaginationModel}
        sx={{ border: "1px solid #e0e0e0", m: 4, mt: 1, maxHeight: 350 }}
      />
    </Paper>
  );
}

export default Athlete;
