import React, { useState } from "react";
import {
  Paper,
  Typography,
  Container,
  Button,
  Box,
  LinearProgress,
} from "@mui/material";
import { uploadCsv } from "../Services/GetServices";
import { useNavigate } from "react-router-dom";
import { ClearOutlined } from "@mui/icons-material";
import axios from "axios";
import SnackbarComp from "./Snackbar_handler";

function Upload() {
  const [file, setFile] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "",
  });
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const [cancelTokenSource, setCancelTokenSource] = useState(null);

  const showSnack = (message, severity) => {
    setSnack({ open: true, message, severity });
  };
  const handleClose = () => {
    setSnack((...prev) => ({ ...prev, open: false, severity: "" }));
  };

  const handleSelect = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      console.log(e.target.files[0]);
    }
  };

  console.log(file);

  const handleUpload = async (file) => {
    if (!file) {
      showSnack("Please select a file first.", "error");
      return;
    }

    const cancelTokenSource = axios.CancelToken.source();
    setCancelTokenSource(cancelTokenSource);

    try {
      const resp = await uploadCsv(
        file,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
        cancelTokenSource.token
      );
      const upData = resp.data;
      console.log("FileData: ", upData);
      showSnack("File uploaded successfully!", "success");
      setProgress(0);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message;
      if (status === 401 || status === 405) {
        showSnack(errorMessage, "error");
        navigate("/login");
      } else if ([400, 403, 404, 414, 422, 500, 503].includes(status)) {
        showSnack(errorMessage, "error");
      }

      if (axios.isCancel(error)) {
        console.log("Upload canceled:", error.message);
        showSnack("Upload canceled.", "error");
      } else {
        console.error(
          "An Error occurred while Uploading the File:",
          errorMessage
        );
        showSnack("Something went Wrong ! Please try again Later.", "error");
      }
      setProgress(0);
    }
  };

  return (
    <Container
      sx={{ backgroundColor: "#f4f5f9", minHeight: "100vh", padding: 0 }}
    >
      <Typography variant="h4" sx={{ color: "#6e39cb", py: 2 }}>
        Upload
      </Typography>
      <Paper
        elevation={4}
        sx={{
          p: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: "#6e39cb" }}>
          Upload CSV
        </Typography>
        <Box
          sx={{
            display: "flex",
            columnGap: 5,
            alignItems: "center",
            py: 3,
          }}
        >
          <label
            htmlFor="fileInput"
            style={{
              cursor: "pointer",
              color: "#fff",
              backgroundColor: "#6e39cb",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            SELECT FILE
          </label>
          <input
            type="file"
            id="fileInput"
            style={{ display: "none" }}
            onChange={handleSelect}
          />
          <Button
            onClick={() => handleUpload(file)}
            sx={{ backgroundColor: "#6e39cb", color: "#fff" }}
          >
            UPLOAD
          </Button>
        </Box>
        <Box>
          {file ? (
            <Typography>
              Selected File: {file.name}
              <ClearOutlined
                onClick={() => {
                  setFile(null);
                }}
                sx={{
                  color: "red",
                  cursor: "pointer",
                }}
              />
            </Typography>
          ) : (
            <Typography>No File Selected</Typography>
          )}
        </Box>
        {progress > 0 && (
          <Box sx={{ py: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography align="center">{progress}%</Typography>
            <Container sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                onClick={() => {
                  cancelTokenSource.cancel("User canceled the upload.");
                  setProgress(0);
                }}
                sx={{
                  backgroundColor: "#f44336",
                  color: "#fff",
                  mt: 2,
                }}
              >
                Cancel Upload
              </Button>
            </Container>
          </Box>
        )}
      </Paper>
      <SnackbarComp snackbarProps={{ ...snack, handleClose: handleClose }} />
    </Container>
  );
}

export default Upload;
