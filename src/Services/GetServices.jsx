import axios from "axios";

const api = axios.create({
  baseURL: `http://127.0.0.1:8000/api/v1/`,
});

api.interceptors.request.use((config) => {
  const token = JSON.parse(localStorage.getItem("Bdata"))?.data?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const getAthletes = (queryParams) => {
  return api.get(`athletes/?${queryParams}`);
};

export const getGenders = (queryParams) => {
  return api.get(`genders?name=${queryParams}`);
};

export const createAthlete = (data) => {
  return api.post("athletes/", {
    name: data.name,
    gender_id: data.gender_id,
  });
};
export const editAthlete = (row) => {
  return api.patch(`athletes/${row.id}`, {
    name: row.name,
    gender_id: row.gender_id,
  });
};
