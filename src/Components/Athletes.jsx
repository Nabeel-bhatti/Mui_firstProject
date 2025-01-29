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
  Container,
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote } from "@mui/icons-material";
import SnackbarComp from "./Snackbar_handler";
import {
  createAthlete,
  editAthlete,
  getAthletes,
  getGenders,
} from "../Services/GetServices";

function Athletes() {
  const [genders, setGenders] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [debounceValue, setDebounceValue] = useState("");

  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialog2Open, setDialog2Open] = useState(false);
  const [fieldErrors, setFieldErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [newData, setNewData] = useState({
    name: "",
    gender_id: "",
  });
  const [selectedRow, setSelectedRow] = useState({
    name: null,
    gender_id: null,
    gender: null,
  });

  const athletes_validation = yup.object().shape({
    name: yup.string().required(),
    gender_id: yup.string().required(),
  });

  let navigate = useNavigate();

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  useEffect(() => {
    const athleteData = async () => {
      try {
        const payloads = new URLSearchParams({
          page: paginationModel.page + 1,
          page_size: paginationModel.pageSize,
        });

        filterModel.items.forEach((filter, index) => {
          if (filter.field && filter.operator && filter.value) {
            payloads.append(`filter[${index}][field]`, filter.field);
            payloads.append(`filter[${index}][operator]`, filter.operator);
            payloads.append(`filter[${index}][value]`, filter.value);
          }
        });

        sortModel.forEach((sort, index) => {
          if (sort.field && sort.sort) {
            payloads.append(`sort[${index}][field]`, sort.field);
            payloads.append(`sort[${index}][sort]`, sort.sort);
          }
        });
        const resp = await getAthletes(payloads.toString());
        const result = resp.data;

        setRowCount(result.data.total);
        // showSnack(result.message);
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            gender: item.gender.name,
            gender_id: item.gender.id,
          }))
        );
        console.log(result.message);

        if (resp.status === 101) {
          showSnack(result.message, "success");
        }
        if (resp.status === 200) {
          //   showSnack(result.message,"success");
          setLoading(true);
        }
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          showSnack(errorMessage, "error");
        } else {
          console.error("Error fetching athletes data:", error);
          alert("An error occurred while fetching data.");
        }
      } finally {
        setLoading(false);
      }
    };

    athleteData();
  }, [paginationModel, sortModel, filterModel, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  useEffect(() => {
    const delay = setTimeout(() => setDebounceValue(inputValue), 500);
    return () => clearTimeout(delay);
  }, [inputValue]);

  useEffect(() => {
    if (!debounceValue) {
      setGenders([]);
      return;
    }

    const fetchgenders = async () => {
      try {
        const resp = await getGenders(debounceValue);
        const result = resp.data;
        console.log("Genders", result?.data?.data);
        setGenders(result?.data?.data || []);

        if (resp.status === 200) {
          showSnack(result.message);
        }
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          showSnack(errorMessage, "error");
        } else {
          console.error("Error fetching genders:", error);
          alert("Failed to fetch genders data");
        }
      }
    };

    fetchgenders();
  }, [debounceValue, navigate]);

  console.log("setGenders", genders);

  const handleNewSave = async (data) => {
    console.log("my data", data);
    try {
      // await athletes_validation.validate(newData, { abortEarly: false });
      // setFieldErrors({});

      const resp = await createAthlete(data);
      const result = resp.data;

      showSnack(result.message);

      setPaginationModel((prev) => ({ ...prev }));
      setGenders([]);
      setInputValue("");
      setDebounceValue("");
      setNewData({ name: "", gender_id: "" });
      setDialog2Open(false);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;
      const errorDetails = error.response?.data?.errors;

      if (status === 422) {
        const backendErrors = {};
        for (const field in errorDetails) {
          backendErrors[field] = errorDetails[field].join("\n");
        }
        showSnack(errorMessage, "error");
        setFieldErrors(backendErrors);
        return;
      }

      if ([500 || 503].includes(status)) {
        alert(errorMessage);
        return;
      } else if (status === 400) {
        showSnack(errorMessage, "error");
      } else if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("Error saving RowData:", error);
      }
    }
    return;
  };

  const handleSave = async (row) => {
    try {
      await athletes_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editAthlete(row);
      const result = resp.data;

      showSnack(result.message, "success");

      setPaginationModel((prev) => ({ ...prev }));
      setGenders([]);
      setInputValue("");
      setDebounceValue("");
      setDialogOpen(false);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;
      const errorDetails = error.response?.data?.errors;

      if (status === 401) {
        alert(errorMessage);
        navigate("/login");
        return;
      }
      if (status === 422) {
        const backendErrors = {};
        for (const field in errorDetails) {
          backendErrors[field] = errorDetails[field].join("\n");
        }
        showSnack(errorMessage, "error");
        setFieldErrors(backendErrors);
        return;
      }
      if ([500 || 503].includes(status)) {
        alert(errorMessage);
        return;
      }

      if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("Error updating RowData:", error);
      }
    }
    return;
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialog2Open(false);
    setFieldErrors("");
    setGenders([]);
    setInputValue("");
    setDebounceValue("");
    setDialogOpen(false);
    setNewData({ name: "", gender_id: "" });
  };

  const handleAutocompleteChange = (e, val, type) => {
    const selectedGender = genders.find((g) => g.name === val);

    if (type === "new") {
      setNewData((prev) => ({
        ...prev,
        gender_id: selectedGender ? selectedGender.id : "",
      }));
    } else if (type === "edit") {
      setSelectedRow((prev) => ({
        ...prev,
        gender_id: selectedGender ? selectedGender.id : null,
        gender: selectedGender ? selectedGender.name : null,
      }));
    }
  };

  const columns = [
    { field: "id", headerName: "Sr#", flex: 1, filterable: false },
    { field: "name", headerName: "Athlete Name", flex: 1 },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
      filterable: false,
    },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      filterable: false,
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

  return (
    <Container
      sx={{ backgroundColor: "#f4f5f9", minHeight: "100vh", padding: 0 }}
    >
      <Typography variant="h4" sx={{ color: "#6e39cb", py: 2 }}>
        Athletes
      </Typography>
      <Paper
        elevation={4}
        sx={{
          p: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: "#6e39cb" }}>
            Athletes Data
          </Typography>
          <Button
            onClick={() => setDialog2Open(true)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            + ADD NEW ATHLETE
          </Button>
        </Box>

        <DataGrid
          slots={{ toolbar: GridToolbar }}
          columns={columns}
          rows={rows}
          loading={loading}
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
          sx={{ border: "1px solid #e0e0e0", mt: 1, maxHeight: 380 }}
        />

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle component={"h4"}>Update Athlete</DialogTitle>
          <DialogContent>
            {selectedRow ? (
              <div>
                <FormControl>
                  <FormLabel>Name *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.name}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.name}
                    helperText={fieldErrors.name}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Gender *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500 }}
                      onInputChange={(e, val) => setInputValue(val)}
                      onChange={(e, val) =>
                        handleAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(genders) ? genders.map((g) => g.name) : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          placeholder={selectedRow.gender || "Select Gender"}
                          error={!!fieldErrors.gender_id}
                          helperText={fieldErrors.gender_id}
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
              Update
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={dialog2Open} onClose={handleDialogClose}>
          <DialogTitle>Add Athlete</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Name *</FormLabel>
              <TextField
                variant="standard"
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.name}
                id="name"
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Gender *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={inputValue}
                  onInputChange={(e, val) => setInputValue(val)}
                  onChange={(e, val) => handleAutocompleteChange(e, val, "new")}
                  options={
                    Array.isArray(genders) ? genders.map((g) => g.name) : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      error={!!fieldErrors.gender_id}
                      helperText={fieldErrors.gender_id}
                    />
                  )}
                />
              </Stack>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleNewSave(newData)}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <SnackbarComp snackbarProps={{ ...snack, handleClose: handleClose }} />
    </Container>
  );
}

export default Athletes;
