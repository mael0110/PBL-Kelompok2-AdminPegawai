import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "../services/axios";
export const usePages = defineStore("page", () => {
  const page = ref(1);
  const data = ref([]);
  const meta = ref(null);

  async function getVerifikasi(page = 1) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`/change-requests`, {
        params: { page },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Mengambil verifikasi page:", page);
      console.log("Response meta:", res.data.meta);

      data.value = res.data.data;
      meta.value = res.data.meta;
    } catch (error) {
      console.log("Gagal ambil verifikasi:", error.response?.data || error);
    }
  }

  return { page, data, meta, getVerifikasi };
});
