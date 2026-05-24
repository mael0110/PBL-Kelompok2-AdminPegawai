import axios from "axios";
import { ref } from "vue";

export function presensiService() {
  const presensi = ref([]);
  const sesiId = ref("");

  async function getPresensi(date, sesi_id) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("https://be.karlearn.site/api/presensi", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        params: {
          date,
          sesi_id,
        },
      });

      presensi.value = res.data.data?.pegawai || [];
      sesiId.value = res.data.data?.sesi_id || "";

      return res.data;
    } catch (error) {
      console.log("Error get presensi:", error.response?.data || error);
      presensi.value = [];
      return null;
    }
  }

  return {
    presensi,
    sesiId,
    getPresensi,
  };
}