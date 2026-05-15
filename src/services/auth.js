import axios from "axios";

export function authService() {
  async function login(payload) {
    const res = await axios.post("https://be.karlearn.site/api/auth/login", payload);

    console.log("Response login:", res.data);

    // sesuaikan nama token kalau backend beda
    const token = res.data.data.access_token;

    if (token) {
      localStorage.setItem("token", token);
    }

    return res.data;
  }

  return {
    login,
  };
}