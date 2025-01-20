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
  // Autocomplete,
  // Stack,
  Snackbar,
  Slide,
  Alert,
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote, Warning, DoneAll, Delete } from "@mui/icons-material";
import {
  createGender,
  editGender,
  getGendersData,
  deleteGender,
} from "../Services/GetServices";

function Genders() {
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
  const [snackOpen, setSnackOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("");
  const [newData, setNewData] = useState({
    name: "",
  });

  const [selectedRow, setSelectedRow] = useState({
    name: null,
  });

  const genders_validation = yup.object().shape({
    name: yup.string().required(),
  });

  let navigate = useNavigate();

  function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
  }

  const handleSuccess = (message) => {
    setSeverity("success");
    setMessage(message);
    setTimeout(() => setSnackOpen(true), 2000);
  };
  const handleError = (message) => {
    setSeverity("error");
    setMessage(message);
    setTimeout(() => setSnackOpen(true), 2000);
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
        const resp = await getGendersData(payloads.toString());
        const result = resp.data;
        console.log(result.data.data);

        setRowCount(result.data.total);
        // handleSuccess(result.message);
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            name: item.name,
          }))
        );
        console.log(result.message);

        if (resp.status === 101) {
          handleSuccess(result.message);
        }
        if (resp.status === 200) {
          handleSuccess(result.message);
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
          handleError(errorMessage);
        } else {
          console.error("Error fetching genders data:", error);
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
      await genders_validation.validate(data, { abortEarly: false });
      setFieldErrors({});

      const resp = await createGender(data);
      const result = resp.data;

      handleSuccess(result.message);

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
        handleError(errorMessage);
        setFieldErrors(backendErrors);
        return;
      }

      if ([500 || 503].includes(status)) {
        alert(errorMessage);
        return;
      }
      if (status === 400) {
        handleError(errorMessage);
      }
      if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("Error saving NewGender:", error);
      }
    }
    return;
  };

  const handleSave = async (row) => {
    try {
      await genders_validation.validate(row, { abortEarly: false });
      setFieldErrors({});

      const resp = await editGender(row);
      const result = resp.data;

      handleSuccess(result.message);

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
        handleError(errorMessage);
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
      const resp = await deleteGender(row);
      const result = resp.data;

      handleSuccess(result.message);

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
        console.error("Error occur in Deleting Gender:", error);
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
    { field: "id", headerName: "Sr#", width: 150 },
    { field: "name", headerName: "Gender", width: 300 },

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

  return (
    <Paper
      sx={{
        pb: 1,
        m: 4,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
        }}
      >
        <Typography variant="h5" sx={{ color: "#6e39cb" }}>
          Gender Data
        </Typography>
        <Button
          onClick={() => setDialog2Open(true)}
          sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
        >
          + ADD NEW GENDER
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
        <DialogTitle>Add Gender</DialogTitle>
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

      <Snackbar
        open={snackOpen}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={SlideTransition}
        key="slide-transition"
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
      >
        <Alert
          severity={severity}
          variant="filled"
          sx={{
            width: "100%",
            backgroundColor: severity === "success" ? "#f1f1f1" : "#fff",
            color: severity === "success" ? "#28a745" : "GrayText",
          }}
          icon={
            severity === "success" ? (
              <span style={{ color: "#28a745" }}>
                <DoneAll />
              </span>
            ) : (
              <span style={{ color: "#f1c40f" }}>
                <Warning />
              </span>
            )
          }
        >
          {message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default Genders;
