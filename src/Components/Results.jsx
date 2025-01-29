import {
  Box,
  Paper,
  Input,
  Typography,
  Button,
  Dialog,
  Container,
  DialogTitle,
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
import SnackbarComp from "./Snackbar_handler";
import { EditNote, Delete } from "@mui/icons-material";
import {
  createResult,
  editResult,
  getResults,
  deleteResult,
  getAthlete,
  getCompetition,
  getScoreType,
} from "../Services/GetServices";

function Results() {
  const [rows, setRows] = useState([]);
  const [a_input, setA_input] = useState("");
  const [a_Debounce, setA_Debounce] = useState("");
  const [athlete, setAthlete] = useState([]);
  const [c_input, setC_input] = useState("");
  const [c_Debounce, setC_Debounce] = useState("");
  const [competition, setCompetition] = useState([]);
  const [s_input, setS_input] = useState("");
  const [s_Debounce, setS_Debounce] = useState("");
  const [scoreType, setScoreType] = useState([]);

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialog2Open, setDialog2Open] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [fieldErrors, setFieldErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [newData, setNewData] = useState({
    athlete_id: "",
    competition_id: "",
    score_type_id: "",
    place: "",
    score: "",
    margin: "",
    percentile: "",
  });

  const [selectedRow, setSelectedRow] = useState({
    athlete: null,
    athlete_id: null,
    competition: null,
    competition_id: null,
    place: null,
    score_type: null,
    score_type_id: null,
    score: null,
    margin: null,
    percentile: null,
  });

  const results_validation = yup.object().shape({
    athlete_id: yup.string().required(),
    competition_id: yup.string().required(),
    score_type_id: yup.string().required(),
    place: yup.string().required(),
    score: yup.string().required(),
    margin: yup.string().required(),
    percentile: yup.string().required(),
  });

  let navigate = useNavigate();

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  useEffect(() => {
    const resultsData = async () => {
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
        const resp = await getResults(payloads.toString());
        const result = resp.data;
        console.log("all Data", result);

        setRowCount(result.data.total);
        // showSnack(result.message, "success");
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            athlete: item.athlete.name,
            athlete_id: item.athlete.id,
            competition: item.competition.name,
            competition_id: item.competition.id,
            year: item.competition.year,
            event: item.competition.event.name,
            place: item.place,
            score_type: item.score_type.name,
            score_type_id: item.score_type.id,
            score: item.score,
            margin: item.margin,
            percentile: item.percentile,
          }))
        );
        console.log(result.message);

        if (resp.status === 101) {
          showSnack(result.message, "success");
        }
        if (resp.status === 200) {
          //   showSnack(result.message, "success");
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

    resultsData();
  }, [paginationModel, sortModel, filterModel, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleNewSave = async (data) => {
    console.log("my data", data);
    try {
      await results_validation.validate(newData, { abortEarly: false });
      setFieldErrors({});

      const resp = await createResult(data);
      const result = resp.data;

      showSnack(result.message, "success");
      console.log("create result", result.message);

      setPaginationModel((prev) => ({ ...prev }));

      setNewData({
        id: "",
        athlete_id: "",
        competition_id: "",
        score_type_id: "",
        place: "",
        margin: "",
        percentile: "",
        score: "",
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
        console.error("Error in saving New TimeRange:", error);
      }
    }
    return;
  };

  const handleEdit = async (row) => {
    try {
      await results_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editResult(row);
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
      const resp = await deleteResult(row);
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
        console.error("Error occur in Deleting Result:", error);
      }
    }
    return;
  };

  useEffect(() => {
    const delay = setTimeout(() => setA_Debounce(a_input), 500);
    return () => clearTimeout(delay);
  }, [a_input]);

  useEffect(() => {
    if (!a_Debounce) {
      setAthlete([]);
      return;
    }

    const fetchP_athletes = async () => {
      try {
        const resp = await getAthlete(a_Debounce);
        const result = resp.data;
        console.log(result);
        console.log("pAthlete", result?.data);
        setAthlete(result?.data || []);

        if (resp.status === 200) {
          // showSnack(result.message, "success");
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
          console.error("Error fetching AthleteData:", error);
          alert("Failed to fetch AthleteData");
        }
      }
    };

    fetchP_athletes();
  }, [a_Debounce, navigate]);

  console.log("AthleteData", athlete);

  const athleteAutocompleteChange = (e, val, type) => {
    const selectedAthlete = athlete.find((a) => a.name === val);

    if (type === "new") {
      setNewData((prev) => ({
        ...prev,
        athlete_id: selectedAthlete ? selectedAthlete.id : "",
      }));
    } else if (type === "edit") {
      setSelectedRow((prev) => ({
        ...prev,
        athlete_id: selectedAthlete ? selectedAthlete.id : null,
        name: selectedAthlete ? selectedAthlete.name : null,
      }));
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => setC_Debounce(c_input), 500);
    return () => clearTimeout(delay);
  }, [c_input]);

  useEffect(() => {
    if (!c_Debounce) {
      setCompetition([]);
      return;
    }

    const fetchP_competition = async () => {
      try {
        const resp = await getCompetition(c_Debounce);
        const result = resp.data;
        console.log(result);
        console.log("Competition", result?.data);
        setCompetition(result?.data || []);

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
          console.error("Error fetching Competition Data:", error);
          alert("Failed to fetch CompetitionData");
        }
      }
    };

    fetchP_competition();
  }, [c_Debounce, navigate]);

  console.log("CompetitionData", competition);

  const competitionAutocompleteChange = (e, val, type) => {
    const selectedCompetition = competition.find((a) => a.name === val);

    if (type === "new") {
      setNewData((prev) => ({
        ...prev,
        competition_id: selectedCompetition ? selectedCompetition.id : "",
      }));
    } else if (type === "edit") {
      setSelectedRow((prev) => ({
        ...prev,
        competition_id: selectedCompetition ? selectedCompetition.id : null,
        competition: selectedCompetition ? selectedCompetition.name : null,
      }));
    }
  };
  useEffect(() => {
    const delay = setTimeout(() => setS_Debounce(s_input), 500);
    return () => clearTimeout(delay);
  }, [s_input]);

  useEffect(() => {
    if (!s_Debounce) {
      setScoreType([]);
      return;
    }

    const fetchP_scoreType = async () => {
      try {
        const resp = await getScoreType(s_Debounce);
        const result = resp.data;
        console.log(result);
        console.log("ScoreTypes", result?.data);
        setScoreType(result?.data || []);

        if (resp.status === 200) {
          // showSnack(result.message, "success");
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
          console.error("Error fetching ScoreType Data:", error);
          alert("Failed to fetch ScoreType Data");
        }
      }
    };

    fetchP_scoreType();
  }, [s_Debounce, navigate]);

  console.log("ScoreTypeData", competition);

  const scoreTypeAutocompleteChange = (e, val, type) => {
    const selectedScoreType = scoreType.find((a) => a.name === val);

    if (type === "new") {
      setNewData((prev) => ({
        ...prev,
        score_type_id: selectedScoreType ? selectedScoreType.id : "",
      }));
    } else if (type === "edit") {
      setSelectedRow((prev) => ({
        ...prev,
        score_type_id: selectedScoreType ? selectedScoreType.id : null,
        score_type: selectedScoreType ? selectedScoreType.name : null,
      }));
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialog2Open(false);
    setFieldErrors({});
    setDialogOpen(false);
    setNewData({
      id: "",
      athlete_id: "",
      competition_id: "",
      score_type_id: "",
      place: "",
      margin: "",
      percentile: "",
      score: "",
    });
  };

  const columns = [
    { field: "id", headerName: "Sr#", flex: 0.5, filterable: false },
    { field: "athlete", headerName: "Athlete Name", flex: 1 },
    {
      field: "competition",
      headerName: "Competition",
      flex: 1,
    },
    {
      field: "year",
      headerName: "Year",
      flex: 1,
    },
    {
      field: "event",
      headerName: "Event",
      flex: 1,
    },
    {
      field: "place",
      headerName: "Place",
      flex: 1,
    },
    {
      field: "score_type",
      headerName: "Score Type",
      flex: 1,
    },
    {
      field: "score",
      headerName: "Score",
      flex: 1,
    },
    {
      field: "margin",
      headerName: "Margin",
      flex: 1,
    },
    {
      field: "percentile",
      headerName: "Percentile",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      filterable: false,
      flex: 2,
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
        Results
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
            Results Data
          </Typography>
          <Button
            onClick={() => setDialog2Open(true)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            + ADD NEW RESULT
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
                  <FormLabel>Athlete *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500, mb: 3 }}
                      value={selectedRow.athlete}
                      onInputChange={(e, val) => setA_input(val)}
                      onChange={(e, val) =>
                        athleteAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(athlete) ? athlete.map((a) => a.name) : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldErrors.athlete_id}
                          helperText={fieldErrors.athlete_id}
                          variant="standard"
                        />
                      )}
                    />
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Competition *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500, mb: 3 }}
                      value={selectedRow.competition}
                      onInputChange={(e, val) => setC_input(val)}
                      onChange={(e, val) =>
                        competitionAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(competition)
                          ? competition.map((c) => c.name)
                          : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldErrors.competition_id}
                          helperText={fieldErrors.competition_id}
                          variant="standard"
                        />
                      )}
                    />
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Score Type *</FormLabel>
                  <Stack>
                    <Autocomplete
                      sx={{ minWidth: 500, mb: 3 }}
                      value={selectedRow.score_type}
                      onInputChange={(e, val) => setS_input(val)}
                      onChange={(e, val) =>
                        scoreTypeAutocompleteChange(e, val, "edit")
                      }
                      options={
                        Array.isArray(scoreType)
                          ? scoreType.map((s) => s.name)
                          : []
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={!!fieldErrors.score_type_id}
                          helperText={fieldErrors.score_type_id}
                          variant="standard"
                        />
                      )}
                    />
                  </Stack>
                </FormControl>
                <FormControl>
                  <FormLabel>Place *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.place}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        place: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.place}
                    helperText={fieldErrors.place}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Score *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.score}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        score: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.score}
                    helperText={fieldErrors.score}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>margin *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.margin}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        margin: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.margin}
                    helperText={fieldErrors.margin}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Percentile *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.percentile}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        percentile: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.percentile}
                    helperText={fieldErrors.percentile}
                    variant="standard"
                  />
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
          <DialogTitle>Add new Result</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Athlete *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={a_input}
                  onInputChange={(e, val) => setA_input(val)}
                  onChange={(e, val) =>
                    athleteAutocompleteChange(e, val, "new")
                  }
                  options={
                    Array.isArray(athlete) ? athlete.map((a) => a.name) : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      error={!!fieldErrors.athlete_id}
                      helperText={fieldErrors.athlete_id}
                    />
                  )}
                />
              </Stack>
            </FormControl>
            <FormControl>
              <FormLabel>Competition *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={c_input}
                  onInputChange={(e, val) => setC_input(val)}
                  onChange={(e, val) =>
                    competitionAutocompleteChange(e, val, "new")
                  }
                  options={
                    Array.isArray(competition)
                      ? competition.map((c) => c.name)
                      : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      error={!!fieldErrors.competition_id}
                      helperText={fieldErrors.competition_id}
                    />
                  )}
                />
              </Stack>
            </FormControl>
            <FormControl>
              <FormLabel>Score Type *</FormLabel>
              <Stack>
                <Autocomplete
                  sx={{ minWidth: 500 }}
                  inputValue={s_input}
                  onInputChange={(e, val) => setS_input(val)}
                  onChange={(e, val) =>
                    scoreTypeAutocompleteChange(e, val, "new")
                  }
                  options={
                    Array.isArray(scoreType) ? scoreType.map((c) => c.name) : []
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      error={!!fieldErrors.score_type_id}
                      helperText={fieldErrors.score_type_id}
                    />
                  )}
                />
              </Stack>
            </FormControl>
            <FormControl>
              <FormLabel>Place *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.place}
                id="place"
                variant="standard"
                error={!!fieldErrors.place}
                helperText={fieldErrors.place}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>score *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.score}
                id="score"
                variant="standard"
                error={!!fieldErrors.score}
                helperText={fieldErrors.score}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>margin *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.margin}
                id="margin"
                variant="standard"
                error={!!fieldErrors.margin}
                helperText={fieldErrors.margin}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Percentile *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.percentile}
                id="percentile"
                variant="standard"
                error={!!fieldErrors.percentile}
                helperText={fieldErrors.percentile}
                onChange={handleChange}
              />
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

export default Results;
