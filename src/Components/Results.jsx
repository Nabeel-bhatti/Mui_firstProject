import {
  Box,
  Paper,
  Input,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { FormControl, FormLabel } from "@mui/joy";

import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote } from "@mui/icons-material";

function Results() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [newInputValue, setNewInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [genders, setGenders] = useState([]);
  const [dialog2Open, setDialog2Open] = useState(false);

  const [newData, setNewData] = useState({
    name: "",
    gender_id: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAthleteData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/athletes?page=${
            paginationModel.page + 1
          }&page_size=${paginationModel.pageSize}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data;

        setRowCount(data.total || 0);
        setRows(
          data.data.map((item) => ({
            id: item.id,
            name: item.name,
            gender: item.gender.name,
            gender_id: item.gender.id,
          }))
        );
      } catch (error) {
        console.error("Error fetching athletes data:", error);
        setRows([]);
      }
    };

    fetchAthleteData();
  }, [paginationModel, sortModel]);

  useEffect(() => {
    const delay = setTimeout(() => setDebounceValue(newInputValue), 300);
    return () => clearTimeout(delay);
  }, [newInputValue]);

  useEffect(() => {
    if (!debounceValue) {
      setGenders([]);
      return;
    }

    const fetchGenders = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/genders?name=${debounceValue}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch genders data");
        }

        const data = await res.json();

        console.log("Genders Data :", data);
        setGenders(data?.data?.data || []);
      } catch (error) {
        console.error("Error fetching genders:", error);
        setGenders([]);
      }
    };

    fetchGenders();
  }, [debounceValue]);

  const handleNewSave = async () => {
    if (!newData.name || !newData.gender_id) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    try {
      const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
      const resp = await fetch(`http://127.0.0.1:8000/api/v1/athletes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: newData.name,
          gender_id: newData.gender_id,
        }),
      });

      if (!resp.ok) {
        throw new Error("Failed to add new athlete.");
      }

      setPaginationModel((prev) => ({ ...prev }));
      setDialog2Open(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Error saving new athlete:", error);
      setErrorMessage("Failed to save new athlete. Please try again.");
    }
  };

  const handleDialogClose = () => {
    setDialog2Open(false);
    setNewData({ name: "", gender_id: "" });
    setErrorMessage("");
  };

  const handleNewAutocompleteChange = (e, val) => {
    const selectedGender = genders.find((g) => g.name === val);
    setNewData((prev) => ({
      ...prev,
      gender_id: selectedGender ? selectedGender.id : "",
    }));
  };

  const columns = [
    { field: "id", headerName: "Sr#", width: 150 },
    { field: "name", headerName: "Athlete Name", width: 300 },
    { field: "gender", headerName: "Gender", width: 300 },
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => (
        <Button
          sx={{ backgroundColor: "#6e39cb", textAlign: "center" }}
          variant="contained"
        >
          <EditNote />
        </Button>
      ),
    },
  ];

  return (
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
          Athlete Data
        </Typography>
        <Button
          onClick={() => setDialog2Open(true)}
          sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
        >
          + ADD NEW ATHLETE
        </Button>
      </Box>
      <DataGrid
        columns={columns}
        rows={rows}
        rowCount={rowCount}
        pagination
        paginationMode="server"
        sortingMode="server"
        pageSizeOptions={[3, 5, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
      />
      <Dialog open={dialog2Open} onClose={handleDialogClose}>
        <DialogTitle>Add Athlete</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>Name *</FormLabel>
            <Input
              sx={{ minWidth: 500, mb: 3 }}
              value={newData.name}
              id="name"
              onChange={(e) =>
                setNewData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Gender *</FormLabel>
            <Stack>
              <Autocomplete
                sx={{ minWidth: 200 }}
                freeSolo
                inputValue={newInputValue}
                onInputChange={(e, val) => setNewInputValue(val)}
                onChange={handleNewAutocompleteChange}
                options={
                  Array.isArray(genders) ? genders.map((g) => g.name) : []
                }
                renderInput={(params) => (
                  <TextField {...params} variant="standard" />
                )}
              />
            </Stack>
          </FormControl>
          {errorMessage && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" onClick={handleNewSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Results;
