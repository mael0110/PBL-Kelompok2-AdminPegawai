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

  async function getCourses() {
    try {
      const res = await axios.get("https://be.karlearn.site/api/mata-kuliah?page=1");
      console.log("Mata kuliah yang diambil:", res.data.data.items);
      return res.data.data?.items || res.data.data || [];
    } catch (error) {
      console.log("Gagal ambil mata kuliah:", error.response?.data || error);
      return [];
    }
  }

  async function getProdi() {
    try {
      const res = await axios.get("https://be.karlearn.site/api/prodi");
      return res.data.data || [];
    } catch (error) {
      console.log("Gagal ambil prodi:", error.response?.data || error);
      return [];
    }
  }

  async function getKelasByProdi(prodiName) {
    try {
      const res = await axios.get(`https://be.karlearn.site/api/kelas/prodi/${prodiName}?page=1`);
      return res.data.data?.items || res.data.data || [];
    } catch (error) {
      console.log("Gagal ambil kelas by prodi:", error.response?.data || error);
      return [];
    }
  }

  async function getPengampuByKelas(kelasId) {
    try {
      const res = await axios.get(`https://be.karlearn.site/api/pengampu/kelas/${kelasId}`);
      return res.data.data || [];
    } catch (error) {
      console.log("Gagal ambil pengampu kelas:", error.response?.data || error);
      return [];
    }
  }

  return {
    sesiKelas,
    generateSesi,
    getCourses,
    // getLecturers,
    // getClasses,
    getProdi,
    getKelasByProdi,
    getPengampuByKelas
  };
}