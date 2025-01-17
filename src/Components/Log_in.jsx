import React, { useState } from "react";
import * as yup from "yup";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

function LogIn() {
  let navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState("");

  const sign_in_validations = yup.object().shape({
    email: yup.string().email().required().label("Email"),
    password: yup.string().required().label("Password"),
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setData((prev) => ({ ...prev, [id]: value }));

    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await sign_in_validations.validate(data, { abortEarly: false });
      setFieldErrors({});
      const resp = await fetch("http://127.0.0.1:8000/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if ([400, 401, 403, 404, 429, 504, 500, 503].includes(resp.status)) {
        alert((await resp.json()).message);
        return;
      }

      let result = await resp.json();

      if (result.data?.token) {
        localStorage.setItem("Bdata", JSON.stringify(result));
        alert(result.message);
        return navigate("/");
      }
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
      } else {
        console.error("An error occurred:", error);
        alert("Invalid credentials.");
      }
    }
  };
  return (
    <Container
      container
      sx={{
        alignContent: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      <Paper elevation={3} sx={{ padding: 1.5 }}>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, lg: 5 }}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: 0,
              }}
              component="form"
              noValidate
              autoComplete="on"
              onSubmit={handleSubmit}
            >
              <CardContent
                sx={{
                  width: "full",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Typography variant="h5" component="div">
                  LogIn
                </Typography>

                <TextField
                  required
                  id="email"
                  label="E-mail"
                  size="small"
                  type="email"
                  value={data.email}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                  onChange={handleChange}
                />

                <TextField
                  required
                  id="password"
                  label="Password"
                  type="password"
                  size="small"
                  autoComplete="current-password"
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  value={data.password}
                  onChange={handleChange}
                />
              </CardContent>
              <Button
                type="submit"
                variant="contained"
                sx={{ m: 1, padding: "6px 90px" }}
              >
                LOGIN
              </Button>
              <Typography sx={{ padding: "16px" }}>
                Don't have an account?{" "}
                <NavLink className="navbar-brand" to="/signup">
                  SignUp
                </NavLink>
              </Typography>
            </Card>
          </Grid>
          <Grid
            item
            size={7}
            sx={{
              background: "#a472fd",
              borderRadius: 1.5,
            }}
          ></Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default LogIn;
