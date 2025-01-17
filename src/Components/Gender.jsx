//Add new Athletes

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
} from "@mui/material";
import { FormControl, FormLabel } from "@mui/joy";

import { DataGrid } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote } from "@mui/icons-material";

function Gender() {
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [rows, setRows] = useState([]);
  const [genders, setGenders] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [dialog2Open, setDialog2Open] = useState(false);

  const [newData, setNewData] = useState({
    name: "",
    gender_id: 1,
  });

  useEffect(() => {
    const fetchAthleteData = async () => {
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

    fetchAthleteData();
  }, [paginationModel, sortModel, filterModel]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setNewData((prev) => ({ ...prev, [id]: value }));
  };
  // console.log(newData);

  async function handleNewEdit() {
    try {
      const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;

      const resp = await fetch(
        `http://127.0.0.1:8000/api/v1/genders?page=1&page_size=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      if (!resp.ok) {
        throw new Error("Failed to get GenderData");
      }

      const gData = await resp.json();
      setGenders(gData.data);
      // console.log(genders.data[0].id);

      setDialog2Open(true);
    } catch (error) {
      console.error("Error fetching gender data:", error);
    }
  }

  async function handleNewSave(data) {
    // console.log("my data", data);
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
          name: data.name,
          gender_id: data.gender_id,
        }),
      });
      if (!resp.ok) {
        throw new Error("Failed to update RowData");
      }

      setPaginationModel((prev) => ({ ...prev }));
      setDialog2Open(false);
    } catch (error) {
      console.error("Error saving RowData:", error);
    }
  }

  const handleDialogClose = () => {
    setDialog2Open(false);
    setNewData({ name: "", gender_id: "" });
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
          onClick={() => handleNewEdit(params.row)}
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
          onClick={() => handleNewEdit()}
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

      <Dialog open={dialog2Open} onClose={handleDialogClose}>
        <DialogTitle>Add Athlete</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>Name *</FormLabel>
            <Input
              sx={{ minWidth: 500, mb: 3 }}
              value={newData.name}
              id="name"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Gender *</FormLabel>
            <select
              style={{
                width: "40%",
                minHeight: 36,
                border: "none",
                minWidth: 500,
                marginBottom: 18,
              }}
              id="gender_id"
              // defaultValue={newData.gender}
              value={newData.gender_id.name}
              defaultValue={newData.gender_id.name}
              onChange={handleChange}
            >
              {genders?.data?.length > 0 ? (
                genders.data.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))
              ) : (
                <option disabled>Loading...</option>
              )}
            </select>
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
  );
}

export default Gender;

// Edit Athletes

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
// } from "@mui/material";
// import { FormControl, FormLabel } from "@mui/joy";
// import { DataGrid } from "@mui/x-data-grid";
// import React, { useEffect, useState } from "react";
// import { EditNote } from "@mui/icons-material";

// function Athletes() {
//   const [genders, setGenders] = useState([]);
//   const [rows, setRows] = useState([]);
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [rowCount, setRowCount] = useState(0);
//   const [sortModel, setSortModel] = useState([]);
//   const [filterModel, setFilterModel] = useState({ items: [] });
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [selectedRow, setSelectedRow] = useState({
//     name: null,
//     gender_id: null,
//   });

//   useEffect(() => {
//     const athleteData = async () => {
//       try {
//         const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
//         const response = await fetch(
//           `http://127.0.0.1:8000/api/v1/athletes?page=${paginationModel.page + 1}&page_size=${paginationModel.pageSize}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const result = await response.json();
//         const data = result.data;

//         setRowCount(data.total);
//         console.log(data.total);
//         setRows(
//           data.data.map((item) => ({
//             id: item.id,
//             name: item.name,
//             gender: item.gender.name,
//             gender_id: item.gender.id,
//           }))
//         );
//       } catch (error) {
//         console.error("Error fetching athletes data:", error);
//       }
//     };

//     athleteData();
//   }, [paginationModel, sortModel, filterModel]);

//   async function handleEdit(rowData) {
//     try {
//       const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;

//       const resp = await fetch(
//         `http://127.0.0.1:8000/api/v1/genders?page=1&page_size=10`,
//         {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         }
//       );
//       if (!resp.ok) {
//         throw new Error("Failed to get GenderData");
//       }

//       const gData = await resp.json();
//       setGenders(gData.data);
//       setSelectedRow({
//         id: rowData.id,
//         name: rowData.name,
//         gender_id: rowData.gender_id,
//       });
//       setDialogOpen(true);
//       console.log(gData.data.data);
//     } catch (error) {}
//   }

//   async function handleSave(row) {
//     console.log(row);
//     try {
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
//       if (!resp.ok) {
//         throw new Error("Failed to update RowData");
//       }

//       const rData = await resp.json();
//       console.log("RowData updated:", rData);

//       setDialogOpen(false);
//       setPaginationModel((prev) => ({ ...prev }));
//     } catch (error) {
//       console.error("Error saving RowData:", error);
//     }
//   }

//   const handleDialogClose = () => {
//     setDialogOpen(false);
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
//           onClick={() => handleEdit(params.row)}
//         >
//           <EditNote />
//         </Button>
//       ),
//     },
//   ];
//   console.log("Row Data", selectedRow);
//   return (
//     <Paper sx={{ pb: 1, m: 4 }}>
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
//         //   onClick={() => handleEdit()}
//           sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
//         >
//           + ADD NEW ATHLETE
//         </Button>
//       </Box>
//       <DataGrid
//         columns={columns}
//         rows={rows}
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
//                 <Input
//                   sx={{ minWidth: 500, mb: 3 }}
//                   defaultValue={selectedRow.name}
//                   onChange={(e) =>
//                     setSelectedRow((prev) => ({
//                       ...prev,
//                       name: e.target.value,
//                     }))
//                   }
//                 />
//               </FormControl>
//               <FormControl>
//                 <FormLabel>Gender *</FormLabel>
//                 <select
//                   fullWidth
//                   style={{
//                     width: "40%",
//                     minHeight: 36,
//                     border: "none",
//                     minWidth: 500,
//                     marginBottom: 18,
//                   }}
//                   value={selectedRow.gender_id}
//                   onChange={(e) =>
//                     setSelectedRow((prev) => ({
//                       ...prev,
//                       gender_id: e.target.value,
//                     }))
//                   }
//                 >
//                   {genders?.data?.length > 0 ? (
//                     genders.data.map((item) => (
//                       <option key={item.id} value={item.id}>
//                         {item.name}
//                       </option>
//                     ))
//                   ) : (
//                     <option disabled>Loading...</option>
//                   )}
//                 </select>
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
//             Save
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Paper>
//   );
// }

// export default Athletes;
