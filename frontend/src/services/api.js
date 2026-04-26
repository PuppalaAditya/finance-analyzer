import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 600000
});

export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const chatWithDocument = async (file, question) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("question", question);
  const { data } = await api.post("/chat", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const compareReports = async (companyA, fileA, companyB, fileB) => {
  const formData = new FormData();
  formData.append("company_a", companyA);
  formData.append("company_b", companyB);
  formData.append("file_a", fileA);
  formData.append("file_b", fileB);
  const { data } = await api.post("/compare", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
};

export const fetchDashboard = async () => {
  const { data } = await api.get("/dashboard");
  return data;
};

export default api;
