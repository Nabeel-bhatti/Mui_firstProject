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

// For Events Page
export const getAllEvents = (queryParams) => {
  return api.get(`events/?${queryParams}`);
};
export const getEventTimeRanges = (queryParams) => {
  return api.get(`publicData/timeRange?name=${queryParams}`);
};
export const createEvent = (data) => {
  return api.post("events/", {
    name: data.name,
    time_range_id: data.time_range_id,
  });
};
export const editEvent = (row) => {
  return api.patch(`events/${row.id}`, {
    name: row.name,
    time_range_id: row.time_range_id,
  });
};

export const deleteEvent = (row) => {
  return api.delete(`events/${row.id}`);
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

// For Results Page

export const getResults = (queryParams) => {
  return api.get(`results/?${queryParams}`);
};
export const createResult = (data) => {
  return api.post("results", {
    athlete_id: data.athlete_id,
    competition_id: data.competition_id,
    score_type_id: data.score_type_id,
    place: data.place,
    margin: data.margin,
    percentile: data.percentile,
    score: data.score,
  });
};

export const editResult = (row) => {
  return api.patch(`results/${row.id}`, {
    athlete_id: row.athlete_id,
    competition_id: row.competition_id,
    score_type_id: row.score_type_id,
    place: row.place,
    margin: row.margin,
    percentile: row.percentile,
    score: row.score,
  });
};
export const deleteResult = (row) => {
  return api.delete(`results/${row.id}`);
};
export const getAthlete = (queryParams) => {
  return api.get(`publicData/athlete?name=${queryParams}`);
};
export const getCompetition = (queryParams) => {
  return api.get(`publicData/competition?name=${queryParams}`);
};
export const getScoreType = (queryParams) => {
  return api.get(`publicData/scoreTypes?name=${queryParams}`);
};

// For Event_Tasks page
export const getE_TasksData = (queryParams) => {
  return api.get(`tasks/?${queryParams}`);
};

export const createE_Task = (data) => {
  return api.post("tasks/", {
    name: data.name,
  });
};

export const editE_Task = (row) => {
  return api.patch(`tasks/${row.id}`, {
    name: row.name,
  });
};
export const deleteE_Task = (row) => {
  return api.delete(`tasks/${row.id}`);
};

// For Competitions page

export const getCompetitions = (queryParams) => {
  return api.get(`competitions/?${queryParams}`);
};
export const createCompetition = (data) => {
  return api.post("competitions/", {
    name: data.name,
    gender_id: data.gender_id,
    event_id: data.event_id,
    win_score: data.win_score,
    avg_score: data.avg_score,
    year: data.year,
  });
};
export const editCompetition = (row) => {
  return api.patch(`competitions/${row.id}`, {
    name: row.name,
    gender_id: row.gender_id,
    event_id: row.event_id,
    win_score: row.win_score,
    avg_score: row.avg_score,
    year: row.year,
  });
};

export const deleteCompetition = (row) => {
  return api.delete(`competitions/${row.id}`);
};
export const getEvents = (queryParams) => {
  return api.get(`publicData/events?name=${queryParams}`);
};
// Upload CSV/Txt Files
export const uploadCsv = (file, onUploadProgress, cancelToken) => {
  const formData = new FormData();
  formData.append("csvFile", file);

  return api.post("upload", formData, {
    onUploadProgress,
    cancelToken,
  });
};
