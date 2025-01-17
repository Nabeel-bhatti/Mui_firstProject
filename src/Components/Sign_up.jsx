// import React, { useState } from "react";
// import { sign_up_validations } from "../validations/sign_up_validations";
// import { NavLink } from "react-router-dom";
// import {
//   Card,
//   CardContent,
//   TextField,
//   Button,
//   Typography,
//   Paper,
//   Container,
// } from "@mui/material";
// import Grid from "@mui/material/Grid2";

// function SignUp() {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     password_confirmation: "",
//   });

//   const [fieldErrors, setFieldErrors] = useState("");
//   const handleChange = (e) => {
//     const { id, value } = e.target;
//     setFormData((prev) => ({ ...prev, [id]: value }));

//     setFieldErrors((prev) => ({ ...prev, [id]: "" }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const errors = {};
//     if (!formData.name) errors.name = "Name is required.";
//     if (!formData.email) errors.email = "E-mail is required.";
//     if (!formData.password) errors.password = "Password is required.";
//     else if (formData.password.length < 6)
//       errors.password = "The password must be at least 6 characters.";
//     // else if (!/[a-zA-Z]/.test(formData.password)) {
//     //   errors.password = "The password must contain at least one alphabet.";
//     // }
//     if (formData.password !== formData.password_confirmation) {
//       errors.password_confirmation = "Passwords do not match.";
//     }

//     if (Object.keys(errors).length > 0) {
//       setFieldErrors(errors);
//       return;
//     }

//     const fdata = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     };

//     try {
//       const resp = await fetch("http://127.0.0.1:8000/api/v1/register", fdata);

//       if (resp.status === 422) {
//         const data = await resp.json();
//         const backendErrors = {};
//         for (const field in data.errors) {
//           backendErrors[field] = data.errors[field].join(", ");
//         }
//         setFieldErrors(backendErrors);
//         return;
//       }
//       if (resp.status === 200) {
//         alert((await resp.json()).message);
//         setFormData({
//           name: "",
//           email: "",
//           password: "",
//           password_confirmation: "",
//         });
//         return;
//       } else if (
//         [400, 401, 403, 404, 429, 504, 500, 503].includes(resp.status)
//       ) {
//         alert((await resp.json()).message);
//         return;
//       }

//       if (!resp.ok) {
//         throw new Error(`HTTP error! status: ${resp.status}`);
//       }

//       const json = await resp.json();
//       console.log(json);
//     } catch (err) {
//       console.error("Error:", err);
//     }
//   };

//   return (
//     <Container
//       container
//       sx={{
//         alignContent: "center",
//         justifyContent: "center",
//         height: "100vh",
//       }}
//     >
//       <Paper elevation={3} sx={{ padding: 1.5 }}>
//         <Grid container spacing={2}>
//           <Grid item size={{ xs: 12, lg: 5 }}>
//             <Card
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 boxShadow: 0,
//               }}
//               component="form"
//               noValidate
//               autoComplete="on"
//               onSubmit={handleSubmit}
//             >
//               <CardContent
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "center",
//                   alignItems: "center",
//                   gap: 1.5,
//                 }}
//               >
//                 <Typography variant="h5" component="div">
//                   SignUp
//                 </Typography>
//                 <TextField
//                   required
//                   id="name"
//                   label="Name"
//                   size="small"
//                   error={!!fieldErrors.name}
//                   helperText={fieldErrors.name}
//                   value={formData.name}
//                   onChange={handleChange}
//                 />

//                 <TextField
//                   required
//                   id="email"
//                   label="E-mail"
//                   size="small"
//                   type="email"
//                   error={!!fieldErrors.email}
//                   helperText={fieldErrors.email}
//                   value={formData.email}
//                   onChange={handleChange}
//                 />

//                 <TextField
//                   required
//                   id="password"
//                   label="Password"
//                   type="password"
//                   size="small"
//                   autoComplete="current-password"
//                   error={!!fieldErrors.password}
//                   helperText={fieldErrors.password}
//                   value={formData.password}
//                   onChange={handleChange}
//                 />

//                 <TextField
//                   required
//                   id="password_confirmation"
//                   label="Confirm Password"
//                   type="password"
//                   size="small"
//                   autoComplete="current-password"
//                   error={!!fieldErrors.password_confirmation}
//                   helperText={fieldErrors.password_confirmation}
//                   value={formData.password_confirmation}
//                   onChange={handleChange}
//                 />
//               </CardContent>
//               <Button
//                 type="submit"
//                 variant="contained"
//                 sx={{ m: 1, padding: "6px 60px" }}
//               >
//                 GET STARTED
//               </Button>
//               <Typography sx={{ padding: "16px" }}>
//                 Already have an account?{" "}
//                 <NavLink className="navbar-brand" to="/Login">
//                   LogIn
//                 </NavLink>
//               </Typography>
//             </Card>
//           </Grid>
//           <Grid
//             item
//             size={7}
//             sx={{
//               background: "#a472fd",
//               borderRadius: 1.5,
//             }}
//           ></Grid>
//         </Grid>
//       </Paper>
//     </Container>
//   );
// }

// export default SignUp;

import React, { useState } from "react";
import * as yup from "yup";
import { NavLink } from "react-router-dom";
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

function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [fieldErrors, setFieldErrors] = useState("");

  const sign_up_validations = yup.object().shape({
    name: yup.string().min(2).max(25).required(),
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
    password_confirmation: yup
      .string()
      .required()
      .oneOf([yup.ref("password"), null]),
  });
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setFieldErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fdata = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    };
    try {
      await sign_up_validations.validate(formData, { abortEarly: false });
      setFieldErrors({});
      const resp = await fetch("http://127.0.0.1:8000/api/v1/register", fdata);

      if (resp.status === 422) {
        const data = await resp.json();
        const backendErrors = {};

        for (const field in data.errors) {
          backendErrors[field] = data.errors[field].join("\n");
        }
        console.log(backendErrors);
        setFieldErrors(backendErrors);
      }
      if (resp.status === 200) {
        alert((await resp.json()).message);
        setFormData({
          name: "",
          email: "",
          password: "",
          password_confirmation: "",
        });
        return;
      } else if (
        [400, 401, 403, 404, 429, 504, 500, 503].includes(resp.status)
      ) {
        alert((await resp.json()).message);
        return;
      }

      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }

      const json = await resp.json();
      console.log(json);
    } catch (err) {
      if (err.name === "ValidationError") {
        const yupErrors = {};
        err.inner.forEach((validationError) => {
          yupErrors[validationError.path] = validationError.message;
        });
        setFieldErrors(yupErrors);
      } else {
        console.error("Error:", err);
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
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Typography variant="h5" component="div">
                  SignUp
                </Typography>
                <TextField
                  required
                  id="name"
                  label="Name"
                  size="small"
                  value={formData.name}
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
                  onChange={handleChange}
                />

                <TextField
                  required
                  id="email"
                  label="E-mail"
                  size="small"
                  type="email"
                  value={formData.email}
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
                  style={{ whiteSpace: "pre-line" }}
                  autoComplete="current-password"
                  value={formData.password}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  onChange={handleChange}
                />

                <TextField
                  required
                  id="password_confirmation"
                  label="Confirm Password"
                  type="password"
                  size="small"
                  autoComplete="current-password"
                  value={formData.password_confirmation}
                  error={!!fieldErrors.password_confirmation}
                  helperText={fieldErrors.password_confirmation}
                  onChange={handleChange}
                />
              </CardContent>
              <Button
                type="submit"
                variant="contained"
                sx={{ m: 1, padding: "6px 60px" }}
              >
                GET STARTED
              </Button>
              <Typography sx={{ padding: "16px" }}>
                Already have an account?{" "}
                <NavLink className="navbar-brand" to="/Login">
                  LogIn
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

export default SignUp;
