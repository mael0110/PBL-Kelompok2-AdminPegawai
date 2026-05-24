import axios from "./axios";
import { ref } from "vue";

export function penjadwalanService() {
  const sesiKelas = ref([]);

  async function generateSesi(payload) {
    try {
      const res = await axios.post("/class-sessions/generate", payload);

      sesiKelas.value = res.data.data;
      return res.data;
    } catch (error) {
      console.log("Gagal generate sesi:", error.response?.data || error);
      throw error;
    }
  }

  return {
    sesiKelas,
    generateSesi,
  };
}