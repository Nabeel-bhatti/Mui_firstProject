import React from 'react'

function Events() {
  return (
    <div>Events</div>
  )
}

export default Events

// import { Box, Paper, Typography } from "@mui/material";
// import { DataGrid } from "@mui/x-data-grid";
// import React, { useEffect, useState } from "react";

// function Athletes() {
//   const [rows, setRows] = useState([]);
//   const [paginationModel, setPaginationModel] = useState({
//     page: 0,
//     pageSize: 10,
//   });
//   const [rowCount, setRowCount] = useState(0);
//   const [sortModel, setSortModel] = useState([]);
//   const [filterModel, setFilterModel] = useState({ items: [] });

//   const columns = [
//     { field: "id", headerName: "Sr#", width: 80 },
//     { field: "name", headerName: "Athlete Name", width: 200 },
//     {
//       field: "gender.name",
//       headerName: "Gender",
//       width: 150,
//       valueGetter: (params) => params.row.gender?.name || "",
//     },
//   ];

//   useEffect(() => {
//     const fetcher = async () => {
//       try {
//         const response = await fetch(
//           `http://127.0.0.1:8000/api/v1/athletes?page=${paginationModel.page + 1}&page_size=${paginationModel.pageSize}`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }

//         const result = await response.json();
//         setRows(result.data.data);
//         setRowCount(result.data.total);
//         console.log("Result data: ", result);
//       } catch (error) {
//         console.error("Error fetching athletes data:", error);
//       }
//     };

//     fetcher();
//   }, [paginationModel, sortModel, filterModel]);

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
//           Athletes Data
//         </Typography>
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
//     </Paper>
//   );
// }

// export default Athletes;
