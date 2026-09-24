import axios from "axios";

const BASE_API_URL = "http://192.168.0.184:3000/api";

const BASE_CONFIG = {
    baseURL: BASE_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
};

export const publicAPI = axios.create(BASE_CONFIG);

export const privateAPI = axios.create(BASE_CONFIG);
