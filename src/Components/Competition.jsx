import {
  Box,
  Paper,
  Input,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  Container,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  TextField,
  Autocomplete,
  Stack,
  ButtonGroup,
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote, Delete } from "@mui/icons-material";
import {
  getCompetitions,
  createCompetition,
  editCompetition,
  deleteCompetition,
  getGenders,
  getEvents,
} from "../Services/GetServices";
import SnackbarComp from "./Snackbar_handler";

function Competition() {
  const [rows, setRows] = useState([]);
  const [g_input, setG_input] = useState("");
  const [g_Debounce, setG_Debounce] = useState("");
  const [gender, setGender] = useState([]);
  const [e_input, setE_input] = useState("");
  const [e_Debounce, setE_Debounce] = useState("");
  const [event, setEvent] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialog2Open, setDialog2Open] = useState(false);
  const [fieldErrors, setFieldErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [snack, setSnack] = useState({
    open: true,
    message: "",
    severity: "",
  });
  const [newData, setNewData] = useState({
    name: "",
    gender_id: "",
    event_id: "",
    win_score: "",
    avg_score: "",
    year: "",
  });
  const [selectedRow, setSelectedRow] = useState({
    name: null,
    gender_id: null,
    event_id: null,
    win_score: null,
    avg_score: null,
    year: null,
  });

  const competition_validation = yup.object().shape({
    name: yup.string().required(),
    gender_id: yup.string().required(),
    event_id: yup.string().required(),
    win_score: yup.string().required(),
    avg_score: yup.string().required(),
    year: yup.string().required(),
  });

  let navigate = useNavigate();

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  useEffect(() => {
    const competitionData = async () => {
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
        const resp = await getCompetitions(payloads.toString());
        const result = resp.data;
        console.log("all Data", result);

        setRowCount(result.data.total);
        // showSnack(result.message,"success");
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            win_score: item.win_score,
            avg_score: item.avg_score,
            year: item.year,
            gender: item.gender.name,
            gender_id: item.gender.id,
            event: item.event.name,
            event_id: item.event.id,
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
          console.error("Error fetching competition data:", error);
          alert("An error occurred while fetching data.");
        }
      } finally {
        setLoading(false);
      }
    };

    competitionData();
  }, [paginationModel, sortModel, filterModel, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleNewSave = async (data) => {
    console.log("my data", data);
    try {
      await competition_validation.validate(newData, { abortEarly: false });
      setFieldErrors({});

      const resp = await createCompetition(data);
      const result = resp.data;

      showSnack(result.message, "success");
      console.log("create result", result.message);

      setPaginationModel((prev) => ({ ...prev }));

      setNewData({
        id: "",
        name: "",
        gender_id: "",
        event_id: "",
        win_score: "",
        avg_score: "",
        year: "",
      });
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
      }
      if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("Error in saving New Competition:", error);
      }
    }
    return;
  };

  const handleEdit = async (row) => {
    try {
      await competition_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editCompetition(row);
      const result = resp.data;

      showSnack(result.message, "success");

      setPaginationModel((prev) => ({ ...prev }));

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
  const handleDelete = async (row) => {
    try {
      const resp = await deleteCompetition(row);
      const result = resp.data;

      showSnack(result.message, "success");

      setPaginationModel((prev) => ({ ...prev }));
      setDialogOpen(false);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;
      // const errorDetails = error.response?.data?.errors;

      if (status === 401) {
        alert(errorMessage);
        navigate("/login");
        return;
      }
      if ([500, 503, 422].includes(status)) {
        alert(errorMessage);
        return;
      } else {
        console.error("Error occur in Deleting Competition:", error);
      }
    }
    return;
  };

  useEffect(() => {
    const delay = setTimeout(() => setG_Debounce(g_input), 500);
    return () => clearTimeout(delay);
  }, [g_input]);

  useEffect(() => {
    if (!g_Debounce) {
      setGender([]);
      return;
    }

    const fetchP_gender = async () => {
      try {
        const resp = await getGenders(g_Debounce);
        const result = resp.data;
        console.log("Gender", result?.data?.data);
        setGender(result?.data?.data || []);

        if (resp.status === 200) {
          showSnack(result.message, "success");
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
          console.error("Error fetching Gender Data:", error);
          alert("Failed to fetch GenderData");
        }
      }
    };

    fetchP_gender();
  }, [g_Debounce, navigate]);

  console.log("GenderData", gender);

  const genderAutocompleteChange = (e, val, type) => {
    const selectedGender = gender.find((a) => a.name === val);

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
  useEffect(() => {
    const delay = setTimeout(() => setE_Debounce(e_input), 500);
    return () => clearTimeout(delay);
  }, [e_input]);

  useEffect(() => {
    if (!e_Debounce) {
      setEvent([]);
      return;
    }

    const fetchP_event = async () => {
      try {
        const resp = await getEvents(e_Debounce);
        const result = resp.data;
        console.log(result);
        console.log("Events", result?.data);
        setEvent(result?.data || []);

        if (resp.status === 200) {
          // showSnack(result.message,"success");
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
          console.error("Error fetching Event Data:", error);
          alert("Failed to fetch Event Data");
        }
      }
    };

    fetchP_event();
  }, [e_Debounce, navigate]);

  console.log("EventData", gender);

  const eventAutocompleteChange = (e, val, type) => {
    const selectedEvent = event.find((a) => a.name === val);

    if (type === "new") {
      setNewData((prev) => ({
        ...prev,
        event_id: selectedEvent ? selectedEvent.id : "",
      }));
    } else if (type === "edit") {
      setSelectedRow((prev) => ({
        ...prev,
        event_id: selectedEvent ? selectedEvent.id : null,
        event: selectedEvent ? selectedEvent.name : null,
      }));
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialog2Open(false);
    setFieldErrors({});
    setDialogOpen(false);
    setNewData({
      name: "",
      gender_id: "",
      event_id: "",
      win_score: "",
      avg_score: "",
      year: "",
    });
  };

  const columns = [
    { field: "id", headerName: "Sr#", flex: 1, filterable: false },
    { field: "name", headerName: "Competition Name", flex: 1 },
    {
      field: "win_score",
      headerName: "Win Score",
      flex: 1,
    },
    {
      field: "avg_score",
      headerName: "Avg Score",
      flex: 1,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 1,
    },
    {
      field: "gender",
      headerName: "Gender",
      flex: 1,
    },
    {
      field: "event",
      headerName: "Event",
      flex: 1,
    },

    {
      field: "actions",
      headerName: "Actions",
      filterable: false,
      flex: 1,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <ButtonGroup>
            <Button
              sx={{ backgroundColor: "#e2726e", textAlign: "center" }}
              variant="contained"
              onClick={() => {
                handleDelete(params.row);
              }}
            >
              <Delete />
            </Button>
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
          </ButtonGroup>
        </div>
      ),
    },
  ];

  return (
    <Container
      sx={{ backgroundColor: "#f4f5f9", minHeight: "100vh", padding: 0 }}
    >
      <Typography variant="h4" sx={{ color: "#6e39cb", py: 2 }}>
        Competition
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
            Competition Data
          </Typography>
          <Button
            onClick={() => setDialog2Open(true)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            + ADD NEW COMPETITION
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
          <DialogTitle component={"h4"}>Update Record</DialogTitle>
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
                  <FormLabel>Win Score *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.win_score}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        win_score: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.win_score}
                    helperText={fieldErrors.win_score}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Avg Score *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.avg_score}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        avg_score: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.avg_score}
                    helperText={fieldErrors.avg_score}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Year *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.year}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.year}
                    helperText={fieldErrors.year}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Gender *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500, mb: 3 }}
                      value={selectedRow.gender}
                      onInputChange={(e, val) => setG_input(val)}
                      onChange={(e, val) =>
                        genderAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(gender) ? gender.map((g) => g.name) : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldErrors.gender_id}
                          helperText={fieldErrors.gender_id}
                          variant="standard"
                        />
                      )}
                    />
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Event *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500, mb: 3 }}
                      value={selectedRow.event}
                      onInputChange={(e, val) => setE_input(val)}
                      onChange={(e, val) =>
                        eventAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(event) ? event.map((e) => e.name) : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldErrors.event_id}
                          helperText={fieldErrors.event_id}
                          variant="standard"
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
            <Button onClick={() => handleEdit(selectedRow)} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={dialog2Open} onClose={handleDialogClose}>
          <DialogTitle>Add new Competition</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Name *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.name}
                id="name"
                variant="standard"
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Win Score *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.win_score}
                id="win_score"
                variant="standard"
                error={!!fieldErrors.win_score}
                helperText={fieldErrors.win_score}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Avg Score *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.avg_score}
                id="avg_score"
                variant="standard"
                error={!!fieldErrors.avg_score}
                helperText={fieldErrors.avg_score}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Year *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.year}
                id="year"
                variant="standard"
                error={!!fieldErrors.year}
                helperText={fieldErrors.year}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Gender *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={g_input}
                  onInputChange={(e, val) => setG_input(val)}
                  onChange={(e, val) => genderAutocompleteChange(e, val, "new")}
                  options={
                    Array.isArray(gender) ? gender.map((g) => g.name) : []
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
            <FormControl>
              <FormLabel>Event *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={e_input}
                  onInputChange={(e, val) => setE_input(val)}
                  onChange={(e, val) => eventAutocompleteChange(e, val, "new")}
                  options={Array.isArray(event) ? event.map((e) => e.name) : []}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      error={!!fieldErrors.event_id}
                      helperText={fieldErrors.event_id}
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

export default Competition;
