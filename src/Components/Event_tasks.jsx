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
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote, Delete } from "@mui/icons-material";
import {
  getE_TasksData,
  createE_Task,
  editE_Task,
  deleteE_Task,
} from "../Services/GetServices";
import SnackbarComp from "./Snackbar_handler";

function EventTasks() {
  const [rows, setRows] = useState([]);

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
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });
  const [selectedRow, setSelectedRow] = useState({
    name: null,
  });
  const event_tasks_validation = yup.object().shape({
    name: yup.string().required(),
  });

  let navigate = useNavigate();

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  useEffect(() => {
    const gendersData = async () => {
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
        const resp = await getE_TasksData(payloads.toString());
        const result = resp.data;
        console.log(result.data.data);

        setRowCount(result.data.total);
        // showSnack(result.message,"success");
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
        console.log(result.message);

        if (resp.status === 101) {
          showSnack(result.message, "success");
        }
        if (resp.status === 200) {
          // showSnack(result.message,"success");
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
          console.error("Error fetching  data:", error);
          alert("An error occurred while fetching data.");
        }
      } finally {
        setLoading(false);
      }
    };

    gendersData();
  }, [paginationModel, sortModel, filterModel, navigate]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleNewSave = async (data) => {
    console.log("my data", data);
    try {
      await event_tasks_validation.validate(data, { abortEarly: false });
      setFieldErrors({});

      const resp = await createE_Task(data);
      const result = resp.data;

      showSnack(result.message, "success");

      setPaginationModel((prev) => ({ ...prev }));
      setNewData({ name: "" });
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
      }
      if (status === 400) {
        showSnack(errorMessage, "error");
      }
      if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("Error saving New Event_Task:", error);
      }
    }
    return;
  };

  const handleEdit = async (row) => {
    try {
      await event_tasks_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editE_Task(row);
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
      const resp = await deleteE_Task(row);
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
        console.error("Error occur in Deleting Event Task:", error);
      }
    }
    return;
  };

  const handleDialogClose = () => {
    setDialog2Open(false);
    setDialogOpen(false);
    setFieldErrors({});
    setNewData({ name: "" });
    setSelectedRow({ name: null });
  };

  const columns = [
    { field: "id", headerName: "Sr#", flex: 1, filterable: false },
    { field: "name", headerName: "Task Name", flex: 1 },

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
        Tasks
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
            Tasks Data
          </Typography>
          <Button
            onClick={() => setDialog2Open(true)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            + ADD NEW Task
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
                    defaultValue={selectedRow.name || ""}
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
              <Button onClick={() => handleEdit(selectedRow)} color="primary">
                Update
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
        <Dialog open={dialog2Open} onClose={handleDialogClose}>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <FormControl>
              <FormLabel>Name *</FormLabel>
              <TextField
                sx={{ minWidth: 500, mb: 3 }}
                value={newData.name}
                id="name"
                error={!!fieldErrors.name}
                helperText={fieldErrors.name}
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

export default EventTasks;
