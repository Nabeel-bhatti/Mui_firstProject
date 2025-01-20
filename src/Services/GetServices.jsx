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

// For Athletes page
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

// For Genders page
export const getGendersData = (queryParams) => {
  return api.get(`genders/?${queryParams}`);
};

export const createGender = (data) => {
  return api.post("genders/", {
    name: data.name,
  });
};

export const editGender = (row) => {
  return api.patch(`genders/${row.id}`, {
    name: row.name,
  });
};
export const deleteGender = (row) => {
  return api.delete(`genders/${row.id}`);
};

// For Time Ranges page

export const gettimeRanges = (queryParams) => {
  return api.get(`timeRanges/?${queryParams}`);
};

export const createTimeRange = (data) => {
  return api.post("timeRanges/", {
    start_time: data.start_time,
    end_time: data.end_time,
  });
};

export const editTimeRange = (row) => {
  return api.patch(`timeRanges/${row.id}`, {
    start_time: row.start_time,
    end_time: row.end_time,
  });
};

export const deleteTask = (row) => {
  return api.delete(`timeRanges/${row.id}`);
};
