// import {
//   Box,
//   Paper,
//   Input,
//   Typography,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   FormControl,
//   FormLabel,
//   TextField,
//   Autocomplete,
//   Stack,
//   Snackbar,
//   Slide,
//   Alert,
// } from "@mui/material";
// import * as yup from "yup";
// import { useNavigate } from "react-router-dom";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import React, { useEffect, useState } from "react";
// import { EditNote, Warning, DoneAll } from "@mui/icons-material";

// function Athletes() {
//   const [genders, setGenders] = useState([]);
//   const [inputValue, setInputValue] = useState("");
//   const [debounceValue, setDebounceValue] = useState("");

//   const [rows, setRows] = useState([]);
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 5,
//   });

//   const [rowCount, setRowCount] = useState(0);
//   const [sortModel, setSortModel] = useState([]);
//   const [filterModel, setFilterModel] = useState({ items: [] });
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [dialog2Open, setDialog2Open] = useState(false);
//   const [snackOpen, setSnackOpen] = useState(false);
//   const [fieldErrors, setFieldErrors] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [severity, setSeverity] = useState("");
//   const [newData, setNewData] = useState({
//     name: "",
//     gender_id: "",
//   });

//   const [selectedRow, setSelectedRow] = useState({
//     name: null,
//     gender_id: null,
//     gender: null,
//   });

//   const athletes_validation = yup.object().shape({
//     name: yup.string().required(),
//     gender_id: yup.string().required(),
//   });

//   let navigate = useNavigate();

//   function SlideTransition(props) {
//     return <Slide {...props} direction="left" />;
//   }

//   const handleSuccess = (message) => {
//     // setLoading(false);
//     setSeverity("success");
//     setMessage(message);
//     setTimeout(() => setSnackOpen(true), 2000);
//   };
//   const handleError = (message) => {
//     setSeverity("error");
//     setMessage(message);
//     setTimeout(() => setSnackOpen(true), 2000);
//   };

//   useEffect(() => {
//     const athleteData = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
//         const payloads = new URLSearchParams({
//           page: paginationModel.page + 1,
//           page_size: paginationModel.pageSize,
//         });

//         filterModel.items.forEach((filter, index) => {
//           if (filter.field && filter.operator && filter.value) {
//             payloads.append(`filter[${index}][field]`, filter.field);
//             payloads.append(`filter[${index}][operator]`, filter.operator);
//             payloads.append(`filter[${index}][value]`, filter.value);
//           }
//         });

//         sortModel.forEach((sort, index) => {
//           if (sort.field && sort.sort) {
//             payloads.append(`sort[${index}][field]`, sort.field);
//             payloads.append(`sort[${index}][sort]`, sort.sort);
//           }
//         });

//         const resp = await fetch(
//           `http://127.0.0.1:8000/api/v1/athletes?${payloads.toString()}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//           }
//         );

//         if (resp.status === 101) {
//           handleSuccess((await resp.json()).message);
//         } else if (resp.status === 200) {
//           setLoading(true);
//         } else if ([401, 405].includes(resp.status)) {
//           alert((await resp.json()).message);
//           navigate("/login");
//         } else if ([400, 403, 404, 414, 422, 500, 503].includes(resp.status)) {
//           handleError((await resp.json()).message);
//         }

//         const result = await resp.json();
//         const data = result.data;
//         setRowCount(data.total);
//         handleSuccess(result.message);

//         setRows(
//           data.data.map((item) => ({
//             id: item.id,
//             name: item.name,
//             gender: item.gender.name,
//             gender_id: item.gender.id,
//           }))
//         );
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching athletes data:", error);
//       }
//     };

//     athleteData();
//   }, [paginationModel, sortModel, filterModel, navigate]);

//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setNewData((prev) => ({ ...prev, [id]: value }));
//     setFieldErrors((prev) => ({ ...prev, [id]: "" }));
//   };

//   useEffect(() => {
//     const delay = setTimeout(() => setDebounceValue(inputValue), 300);
//     return () => clearTimeout(delay);
//   }, [inputValue]);

//   useEffect(() => {
//     if (!debounceValue) {
//       setGenders([]);
//       return;
//     }

//     const fetchgenders = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
//         const resp = await fetch(
//           `http://127.0.0.1:8000/api/v1/genders?name=${debounceValue}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (resp.status === 405 || resp.status === 401) {
//           alert((await resp.json()).message);
//           navigate("/login");
//           return;
//         } else if ([404, 400, 500, 503].includes(resp.status)) {
//           alert((await resp.json()).message);
//           return;
//         }
//         if (!resp.ok) {
//           throw new Error("Failed to fetch genders data");
//         }

//         const data = await resp.json();

//         setGenders(data?.data?.data || []);
//       } catch (error) {
//         console.error("Error fetching genders:", error);
//         setGenders([]);
//       }
//     };

//     fetchgenders();
//   }, [debounceValue, navigate]);

//   const handleNewSave = async (data) => {
//     console.log("my data", data);
//     try {
//       await athletes_validation.validate(newData, { abortEarly: false });
//       setFieldErrors({});
//       const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
//       const resp = await fetch(`http://127.0.0.1:8000/api/v1/athletes`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//         body: JSON.stringify({
//           name: data.name,
//           gender_id: data.gender_id,
//         }),
//       });

//       if (resp.status === 422) {
//         const data = await resp.json();
//         const backendErrors = {};
//         for (const field in data.errors) {
//           backendErrors[field] = data.errors[field].join("\n");
//         }
//         handleError(data.message);
//         setFieldErrors(backendErrors);
//         return;
//       }
//       if ([500 || 503].includes(resp.status)) {
//         alert((await resp.json()).message);
//         return;
//       } else if (resp.status === 400) {
//         handleError((await resp.json()).message);
//       }

//       if (!resp.ok) {
//         throw new Error("Failed to update RowData");
//       }

//       const createNew = await resp.json();
//       handleSuccess(createNew.message);

//       setPaginationModel((prev) => ({ ...prev }));
//       setGenders([]);
//       setInputValue("");
//       setDebounceValue("");
//       setNewData({ name: "", gender_id: "" });
//       setDialog2Open(false);
//     } catch (error) {
//       if (error instanceof yup.ValidationError) {
//         const errors = {};
//         error.inner.forEach((err) => {
//           errors[err.path] = err.message;
//         });
//         setFieldErrors(errors);
//       } else {
//         console.error("Error saving RowData:", error);
//       }
//     }
//     return;
//   };

//   const handleSave = async (row) => {
//     try {
//       await athletes_validation.validate(row, { abortEarly: false });
//       setFieldErrors({});
//       const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
//       const resp = await fetch(
//         `http://127.0.0.1:8000/api/v1/athletes/${row.id}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           body: JSON.stringify({
//             name: row.name,
//             gender_id: row.gender_id,
//           }),
//         }
//       );
//       if (resp.status === 401) {
//         alert((await resp.json()).message);
//         navigate("/login");
//         return;
//       }
//       if (resp.status === 422) {
//         const data = await resp.json();
//         const backendErrors = {};
//         for (const field in data.errors) {
//           backendErrors[field] = data.errors[field].join("\n");
//         }
//         handleError(data.message);
//         setFieldErrors(backendErrors);
//         return;
//       }
//       if ([500 || 503].includes(resp.status)) {
//         alert((await resp.json()).message);
//         return;
//       }

//       if (!resp.ok) {
//         throw new Error("Failed to update RowData");
//       }
//       const updateAthlete = await resp.json();
//       handleSuccess(updateAthlete.message);

//       setPaginationModel((prev) => ({ ...prev }));
//       setGenders([]);
//       setInputValue("");
//       setDebounceValue("");
//       setDialogOpen(false);
//     } catch (error) {
//       if (error instanceof yup.ValidationError) {
//         const errors = {};
//         error.inner.forEach((err) => {
//           errors[err.path] = err.message;
//         });
//         setFieldErrors(errors);
//       } else {
//         console.error("Error saving RowData:", error);
//       }
//     }
//     return;
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//     setDialog2Open(false);
//     setGenders([]);
//     setInputValue("");
//     setDebounceValue("");
//     setDialogOpen(false);
//     setNewData({ name: "", gender_id: "" });
//   };

//   const handleNewAutocompleteChange = (e, val) => {
//     const selectedGender = genders.find((g) => g.name === val);
//     setNewData((prev) => ({
//       ...prev,
//       gender_id: selectedGender ? selectedGender.id : "",
//     }));
//   };

//   const handleEditAutocompleteChange = (e, val) => {
//     const selectedGender = genders.find((g) => g.name === val);
//     if (selectedGender) {
//       setSelectedRow((prev) => ({
//         ...prev,
//         gender_id: selectedGender.id,
//         gender: selectedGender.name,
//       }));
//     } else {
//       setSelectedRow((prev) => ({
//         ...prev,
//         gender_id: null,
//       }));
//     }
//   };

//   const columns = [
//     { field: "id", headerName: "Sr#", width: 150 },
//     { field: "name", headerName: "Athlete Name", width: 300 },
//     {
//       field: "gender",
//       headerName: "Gender",
//       width: 300,
//     },
//     {
//       field: "action",
//       headerName: "Action",
//       width: 300,
//       renderCell: (params) => (
//         <Button
//           sx={{ backgroundColor: "#6e39cb", textAlign: "center" }}
//           variant="contained"
//           onClick={() => {
//             setSelectedRow(params.row);
//             setDialogOpen(true);
//           }}
//         >
//           <EditNote />
//         </Button>
//       ),
//     },
//   ];

//   return (

//     <Paper
//       sx={{
//         pb: 1,
//         m: 4,
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           p: 3,
//         }}
//       >
//         <Typography variant="h5" sx={{ color: "#6e39cb" }}>
//           Athlete Data
//         </Typography>
//         <Button
//           onClick={() => setDialog2Open(true)}
//           sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
//         >
//           + ADD NEW ATHLETE
//         </Button>
//       </Box>

//       <DataGrid
//         slots={{ toolbar: GridToolbar }}
//         columns={columns}
//         rows={rows}
//         loading={loading}
//         rowCount={rowCount}
//         pagination
//         paginationMode="server"
//         sortingMode="server"
//         filterMode="server"
//         pageSizeOptions={[3, 5, 10]}
//         paginationModel={paginationModel}
//         onPaginationModelChange={setPaginationModel}
//         onSortModelChange={setSortModel}
//         onFilterModelChange={setFilterModel}
//       />

//       <Dialog open={dialogOpen} onClose={handleDialogClose}>
//         <DialogTitle component={"h4"}>Update Athlete</DialogTitle>
//         <DialogContent>
//           {selectedRow ? (
//             <div>
//               <FormControl>
//                 <FormLabel>Name *</FormLabel>
//                 <TextField
//                   sx={{ minWidth: 500, mb: 3 }}
//                   defaultValue={selectedRow.name}
//                   onChange={(e) =>
//                     setSelectedRow((prev) => ({
//                       ...prev,
//                       name: e.target.value,
//                     }))
//                   }
//                   error={!!fieldErrors.name}
//                   helperText={fieldErrors.name}
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel>Gender *</FormLabel>
//                 <Stack>
//                   <Autocomplete
//                     sx={{ minWidth: 500 }}
//                     freeSolo
//                     onInputChange={(e, val) => setInputValue(val)}
//                     onChange={handleEditAutocompleteChange}
//                     options={
//                       Array.isArray(genders) ? genders.map((g) => g.name) : []
//                     }
//                     renderInput={(params) => (
//                       <TextField
//                         {...params}
//                         variant="standard"
//                         placeholder={selectedRow.gender || "Select Gender"}
//                         error={!!fieldErrors.gender_id}
//                         helperText={fieldErrors.gender_id}
//                       />
//                     )}
//                   />
//                 </Stack>
//               </FormControl>
//             </div>
//           ) : (
//             <Input>No data selected</Input>
//           )}
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={handleDialogClose} color="primary">
//             Cancel
//           </Button>
//           <Button onClick={() => handleSave(selectedRow)} color="primary">
//             Update
//           </Button>
//         </DialogActions>
//       </Dialog>
//       <Dialog open={dialog2Open} onClose={handleDialogClose}>
//         <DialogTitle>Add Athlete</DialogTitle>
//         <DialogContent>
//           <FormControl>
//             <FormLabel>Name *</FormLabel>
//             <TextField
//               sx={{ minWidth: 500, mb: 3 }}
//               value={newData.name}
//               id="name"
//               error={!!fieldErrors.name}
//               helperText={fieldErrors.name}
//               onChange={handleChange}
//             />
//           </FormControl>
//           <FormControl>
//             <FormLabel>Gender *</FormLabel>
//             <Stack>
//               <Autocomplete
//                 sx={{ minWidth: 500 }}
//                 freeSolo
//                 inputValue={inputValue}
//                 onInputChange={(e, val) => setInputValue(val)}
//                 onChange={handleNewAutocompleteChange}
//                 options={
//                   Array.isArray(genders) ? genders.map((g) => g.name) : []
//                 }
//                 renderInput={(params) => (
//                   <TextField
//                     {...params}
//                     variant="standard"
//                     error={!!fieldErrors.gender_id}
//                     helperText={fieldErrors.gender_id}
//                   />
//                 )}
//               />
//             </Stack>
//           </FormControl>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDialogClose} color="primary">
//             Cancel
//           </Button>
//           <Button color="primary" onClick={() => handleNewSave(newData)}>
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Snackbar
//         open={snackOpen}
//         anchorOrigin={{ vertical: "top", horizontal: "right" }}
//         TransitionComponent={SlideTransition}
//         key="slide-transition"
//         autoHideDuration={3000}
//         onClose={() => setSnackOpen(false)}
//       >
//         <Alert
//           severity={severity}
//           variant="filled"
//           sx={{
//             width: "100%",
//             backgroundColor: severity === "success" ? "#f1f1f1" : "#fff",
//             color: severity === "success" ? "#28a745" : "GrayText",
//           }}
//           icon={
//             severity === "success" ? (
//               <span style={{ color: "#28a745" }}>
//                 <DoneAll />
//               </span>
//             ) : (
//               <span style={{ color: "#f1c40f" }}>
//                 <Warning />
//               </span>
//             )
//           }
//         >
//           {message}
//         </Alert>
//       </Snackbar>
//     </Paper>
//   );
// }

// export default Athletes;

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
  Snackbar,
  Slide,
  Alert,
} from "@mui/material";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote, Warning, DoneAll } from "@mui/icons-material";
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
  const [snackOpen, setSnackOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [severity, setSeverity] = useState("");
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

  function SlideTransition(props) {
    return <Slide {...props} direction="left" />;
  }

  const handleSuccess = (message) => {
    // setLoading(false);
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
        // handleSuccess(result.message);
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
          handleSuccess(result.message);
        }
        if (resp.status === 200) {
          //   handleSuccess(result.message);
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
          handleSuccess(result.message);
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
      await athletes_validation.validate(newData, { abortEarly: false });
      setFieldErrors({});

      const resp = await createAthlete(data);
      const result = resp.data;

      handleSuccess(result.message);

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
        handleError(errorMessage);
        setFieldErrors(backendErrors);
        return;
      }

      if ([500 || 503].includes(status)) {
        alert(errorMessage);
        return;
      } else if (status === 400) {
        handleError(errorMessage);
      } else if (status instanceof yup.ValidationError) {
        const errors = {};
        status.inner.forEach((err) => {
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
    //   await athletes_validation.validate(row, { abortEarly: false });
    //   setFieldErrors({});

      const resp = await editAthlete(row);
      const result = resp.data;

      handleSuccess(result.message);

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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setDialog2Open(false);
    setGenders([]);
    setInputValue("");
    setDebounceValue("");
    setDialogOpen(false);
    setNewData({ name: "", gender_id: "" });
  };

  const handleNewAutocompleteChange = (e, val) => {
    const selectedGender = genders.find((g) => g.name === val);
    setNewData((prev) => ({
      ...prev,
      gender_id: selectedGender ? selectedGender.id : "",
    }));
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
                />
              </FormControl>
              <FormControl>
                <FormLabel>Gender *</FormLabel>
                <Stack>
                  <Autocomplete
                    sx={{ minWidth: 500 }}
                    freeSolo
                    onInputChange={(e, val) => setInputValue(val)}
                    onChange={handleEditAutocompleteChange}
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
                freeSolo
                inputValue={inputValue}
                onInputChange={(e, val) => setInputValue(val)}
                onChange={handleNewAutocompleteChange}
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

export default Athletes;
