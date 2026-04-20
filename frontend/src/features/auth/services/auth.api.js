import { api, extractApiData } from "../../../lib/api.js";

const getErrorMessage = (err) => err?.response?.data?.message || err?.message || "Request failed";

export async function register({ fullname, username, email, password, confirmPassword }) {
  try {
    const response = await api.post("/api/v1/auth/register", {
      fullname,
      username,
      email,
      password,
      confirmPassword,
    });

    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/v1/auth/login", {
      email,
      password,
    });

    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}

export async function logout() {
  try {
    const response = await api.post("/api/v1/auth/logout");
    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/v1/auth/me");
    return extractApiData(response);
  } catch (err) {
    throw new Error(getErrorMessage(err));
  }
}
