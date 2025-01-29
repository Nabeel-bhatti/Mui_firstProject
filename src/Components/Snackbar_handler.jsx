import React from "react";
import { Snackbar, Alert, Slide } from "@mui/material";

function SlideTransition(props) {
  return <Slide {...props} direction="left" />;
}

const SnackbarComp = ({ snackbarProps }) => {
  const { open, message, severity, handleClose } = snackbarProps;

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      TransitionComponent={SlideTransition}
      autoHideDuration={3000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          backgroundColor: "#fff",
          color: "GrayText",
          "& .MuiAlert-icon": {
            color: severity === "success" ? "#28a745" : "#f1c40f",
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComp;
