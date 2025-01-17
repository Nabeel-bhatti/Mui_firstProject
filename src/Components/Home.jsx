// import React from "react";
// import Box from '@mui/material/Box';
// function Home() {
//   return (
//     <Box
//       sx={{
//         // py: 4,
//         // display: "flex",
//         // flexDirection: "column",
//         // alignItems: "center",
//         // textAlign: "center",
//       }}
//     >
//       <h1>Home</h1>
//     </Box>
//   );
// }

// export default Home;

import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { EditNote } from "@mui/icons-material";
import { getAthletes } from "../Services/GetServices";

function Athletes() {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [rowCount, setRowCount] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();

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
        setRows(
          result.data.data.map((item) => ({
            id: item.id,
            name: item.name,
            gender: item.gender.name,
            gender_id: item.gender.id,
          }))
        );

        if (resp.status === 200) {
          alert(result.message);
        }
      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message;
        // const errorDetails = error.response?.data?.errors;

        if (status === 401 || status === 405) {
          alert(errorMessage);
          navigate("/login");
        } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
          alert(errorMessage);
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
        <Button sx={{ backgroundColor: "#6e39cb", color: "#fff" }}>
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
    </Paper>
  );
}

export default Athletes;
