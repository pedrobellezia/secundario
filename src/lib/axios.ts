import axios from "axios";

const api = axios.create({
  baseURL: process.env.CND_API_URL,
});

const deepseek = axios.create({
  baseURL: "https://api.deepseek.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    "Content-Type": "application/json",
  },
  timeout: 60_000,
});

export { deepseek };
export default api;
