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

function Tasks() {
  const [taskData, setTaskData] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [taskNames, setTaskNames] = useState([]);
  const [debounceValue, setdebounceValue] = useState("");
  const paginationModel = { page: 0, pageSize: 10 };

  const columns = [
    { field: "id", headerName: "Sr#", width: 80 },
    { field: "event_name", headerName: "Event Name", width: 180 },
    { field: "gender", headerName: "Gender", width: 130 },
    { field: "year", headerName: "Year", width: 100 },
    { field: "competition_name", headerName: "Competition", width: 130 },
    { field: "timeRange", headerName: "Time Range", width: 100 },
    { field: "win_score", headerName: "Win Score", width: 100 },
    { field: "avg_score", headerName: "Avg Score", width: 100 },
    { field: "tasks", headerName: "Tasks", width: 280 },
  ];

  useEffect(() => {
    const delay = setTimeout(() => {
      setdebounceValue(inputValue);
    }, 500);

    return () => {
      clearTimeout(delay);
    };
  }, [inputValue]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!debounceValue) {
        setTaskNames([]);
        setTaskData([]);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/publicData/tasks?name=${debounceValue}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch dropdown data");

        const data = await response.json();
        const rData = data.data;

        const getNames = rData.map((item) => ({
          name: item.name,
          id: item.id,
        }));
        setTaskNames(getNames);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, [debounceValue]);

  const fetchTaskData = async (selectedTaskId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/search/task?page=1&page_size=10&tasks[]=${selectedTaskId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch task data");

      const data = await response.json();
      const cData = data.data.data;

      const formattedData = cData.map((item, index) => ({
        id: index + 1,
        event_name: item.event_name,
        gender: item.gender,
        year: item.year,
        competition_name: item.competition_name,
        timeRange: item.timeRange,
        win_score: item.win_score,
        avg_score: item.avg_score,
        tasks: item.tasks,
      }));

      setTaskData(formattedData);
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  return (
    <div>
      <Paper sx={{ pb: 1, m: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: "#6e39cb" }}>
            Task Data
          </Typography>
          <Stack>
            <Autocomplete
              sx={{ minWidth: 200 }}
              freeSolo
              inputValue={inputValue}
              onInputChange={(event, newValue) => setInputValue(newValue)}
              onChange={(event, newValue) => {
                const selectedTask = taskNames.find(
                  (task) => task.name === newValue
                );
                if (selectedTask) {
                  fetchTaskData(selectedTask.id);
                }
              }}
              options={taskNames.map((task) => task.name)}
              filterOptions={(options, { inputValue }) => {
                const filtered = options.filter((option) =>
                  option.toLowerCase().includes(inputValue.toLocaleLowerCase())
                );
                return filtered.length > 0 ? filtered : ["No options"];
              }}
              getOptionDisabled={(option) => option === "No options"}
              renderInput={(params) => (
                <TextField {...params} label="Search Task" variant="standard" />
              )}
            />
          </Stack>
        </Box>
        <DataGrid
          columns={columns}
          rows={taskData}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[3, 5, 10, 20, 30]}
          sx={{ border: "1px solid #e0e0e0", m: 4, minHeight: 300 }}
        />
      </Paper>
    </div>
  );
}

export default Tasks;
