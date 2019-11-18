import axios from "axios";
import cookie from "react-cookies";
import { SERVICE_URL, MOCK_URL } from "./Constants";

const headerConfig = {
  "Content-Type": "application/json"
};

const URL = SERVICE_URL;
const URL2 = MOCK_URL;

export const signUp = async signupData => {
  return await axios.post(`/sign_up`, signupData, headerConfig);
};

export const login = async loginData => {
  return await axios.post(`${URL}/sign_in`, loginData);
};

export const logout = async () => {
  await cookie.remove("accessToken", { path: "/" });
};

export const post = async (data, basePath) => {
  return await axios.post(`/${basePath}`, data, headerConfig);
};

export const put = async (data, basePath) => {
  return await axios.put(`/${basePath}`, data, headerConfig);
};

export const mockPost = async (data, basePath) => {
  return await axios.post(`${URL2}/${basePath}`, data, headerConfig);
};

export const get = async (basePath, data) => {
  return await axios.get(`/${basePath}`, { params: data ? data : {} });
};

export const mockGet = async basePath => {
  return await axios.get(`${URL2}/${basePath}`);
};
