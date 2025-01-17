// Edit Athletes

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
  FormControl,
  FormLabel,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import React, { useEffect, useState } from "react";
import { EditNote } from "@mui/icons-material";

function Time() {
  const [genders, setGenders] = useState([]);
  const [rows, setRows] = useState([]);
  const [editInputValue, setEditInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState({
    name: null,
    gender_id: null,
    gender: null,
  });

  useEffect(() => {
    const athleteData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/athletes?page=${paginationModel.page + 1}&page_size=${paginationModel.pageSize}`,
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

        setRowCount(data.total);
        console.log(data.total);
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
      }
    };

    athleteData();
  }, [paginationModel, sortModel, filterModel]);
  useEffect(() => {
    const delay = setTimeout(() => setDebounceValue(editInputValue), 300);
    return () => clearTimeout(delay);
  }, [editInputValue]);

  useEffect(() => {
    if (!debounceValue) {
      setGenders([]);
      return;
    }

    const fetchgenders = async () => {
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

    fetchgenders();
  }, [debounceValue]);

  async function handleSave(row) {
    try {
      const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
      const resp = await fetch(
        `http://127.0.0.1:8000/api/v1/athletes/${row.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: row.name,
            gender_id: row.gender_id,
          }),
        }
      );
      if (!resp.ok) {
        throw new Error("Failed to update RowData");
      }

      setDialogOpen(false);
      setPaginationModel((prev) => ({ ...prev }));
      setGenders([]);
    } catch (error) {
      console.error("Error saving RowData:", error);
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleEditAutocompleteChange = (e, val) => {
    const selectedGender = genders.find((g) => g.name === val);
    if (selectedGender) {
      setSelectedRow((prev) => ({
        ...prev,
        gender_id: selectedGender.id,
        gender: selectedGender.name,
      }));
    } else {
      setSelectedRow((prev) => ({
        ...prev,
        gender_id: null,
      }));
    }
  };

  const columns = [
    { field: "id", headerName: "Sr#", width: 150 },
    { field: "name", headerName: "Athlete Name", width: 300 },
    {
      field: "gender",
      headerName: "Gender",
      width: 300,
    },
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => (
        <Button
          sx={{ backgroundColor: "#6e39cb", textAlign: "center" }}
          variant="contained"
          onClick={() => {
            setSelectedRow(params.row);
            setDialogOpen(true);
          }}
        >
          <EditNote />
        </Button>
      ),
    },
  ];
  console.log("Row Data", selectedRow);
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
          // onClick={() => setDialogOpen(true)}
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
        filterMode="server"
        pageSizeOptions={[3, 5, 10]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        onSortModelChange={setSortModel}
        onFilterModelChange={setFilterModel}
      />

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle component={"h4"}>Update Athlete</DialogTitle>
        <DialogContent>
          {selectedRow ? (
            <div>
              <FormControl>
                <FormLabel>Name *</FormLabel>
                <Input
                  sx={{ minWidth: 500, mb: 3 }}
                  defaultValue={selectedRow.name}
                  onChange={(e) =>
                    setSelectedRow((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gender *</FormLabel>
                <Stack>
                  <Autocomplete
                    sx={{ minWidth: 500 }}
                    freeSolo
                    onInputChange={(e, val) => setEditInputValue(val)}
                    onChange={handleEditAutocompleteChange}
                    options={
                      Array.isArray(genders) ? genders.map((g) => g.name) : []
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder={selectedRow.gender || "Select Gender"}
                      />
                    )}
                  />
                </Stack>
              </FormControl>
            </div>
          ) : (
            <Input>No data selected</Input>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => handleSave(selectedRow)} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default Time;
