import {
  Box,
  Paper,
  Input,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  TextField,
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote, Delete } from "@mui/icons-material";
import {
  createTimeRange,
  editTimeRange,
  gettimeRanges,
  deleteTask,
} from "../Services/GetServices";
import SnackbarComp from "./Snackbar_handler";

function TimeRange() {
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
    start_time: "",
    end_time: "",
  });

  const [selectedRow, setSelectedRow] = useState({
    start_time: null,
    end_time: null,
  });

  const timeRange_validation = yup.object().shape({
    start_time: yup.string().required(),
    end_time: yup.string().required(),
  });

  let navigate = useNavigate();

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  useEffect(() => {
    const timeRangeData = async () => {
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
        const resp = await gettimeRanges(payloads.toString());
        const result = resp.data;

        setRowCount(result.data.total);
        // showSnack(result.message,"success");
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            start_time: item.start_time,
            end_time: item.end_time,
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

    timeRangeData();
  }, [paginationModel, sortModel, filterModel, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleNewSave = async (data) => {
    console.log("my data", data);
    try {
      await timeRange_validation.validate(newData, { abortEarly: false });
      setFieldErrors({});

      const resp = await createTimeRange(data);
      const result = resp.data;

      showSnack(result.message, "success");
      console.log("create time", result.message);

      setPaginationModel((prev) => ({ ...prev }));

      setNewData({ start_time: "", end_time: "" });
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

  const handleSave = async (row) => {
    try {
      await timeRange_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editTimeRange(row);
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
      const resp = await deleteTask(row);
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
        console.error("Error occur in Deleting Task:", error);
      }
    }
    return;
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialog2Open(false);
    setFieldErrors({});
    setDialogOpen(false);
    setNewData({ start_time: "", end_time: "" });
  };

  const columns = [
    { field: "id", headerName: "Sr#", flex: 1, filterable: false },
    { field: "start_time", headerName: "Start Time", flex: 1 },
    {
      field: "end_time",
      headerName: "End Time",
      flex: 1,
    },
    {
      field: "action",
      headerName: "Action",
      filterable: false,
      flex: 1,
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
        Timerange
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
            Time Range Data
          </Typography>
          <Button
            onClick={() => setDialog2Open(true)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            + ADD NEW TIME RANGE
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
                  <FormLabel>Start_time *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.start_time}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        start_time: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.start_time}
                    helperText={fieldErrors.start_time}
                    variant="standard"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>End_time *</FormLabel>
                  <TextField
                    sx={{ minWidth: 500, mb: 3 }}
                    defaultValue={selectedRow.end_time}
                    onChange={(e) =>
                      setSelectedRow((prev) => ({
                        ...prev,
                        end_time: e.target.value,
                      }))
                    }
                    error={!!fieldErrors.end_time}
                    helperText={fieldErrors.end_time}
                    variant="standard"
                  />
                </FormControl>
              </div>
            ) : (
              <Input>No data selected</Input>
            )}
          </DialogContent>

          <DialogActions
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Button
              onClick={() => handleDelete(selectedRow)}
              color="error"
              startIcon={<Delete />}
            >
              Delete
            </Button>

            <Box>
              <Button onClick={handleDialogClose} color="primary">
                Cancel
              </Button>
              <Button onClick={() => handleSave(selectedRow)} color="primary">
                Update
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
        <Dialog open={dialog2Open} onClose={handleDialogClose}>
          <DialogTitle>Add new Time Range</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Start_time *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.start_time}
                id="start_time"
                error={!!fieldErrors.start_time}
                helperText={fieldErrors.start_time}
                onChange={handleChange}
                variant="standard"
              />
            </FormControl>
            <FormControl>
              <FormLabel>End_time *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.end_time}
                id="end_time"
                error={!!fieldErrors.end_time}
                helperText={fieldErrors.end_time}
                onChange={handleChange}
                variant="standard"
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

export default TimeRange;
