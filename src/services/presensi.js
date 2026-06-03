import axios from "./axios";
import { ref } from "vue";

export function presensiService() {
  const presensi = ref([]);

  async function getPresensi(filter = {}) {
    try {
      const res = await axios.get("https://be.karlearn.site/api/presensi/pegawai", {
        params: filter,
      });

      console.log("Response presensi:", res.data);

      presensi.value = res.data.data?.pegawai || [];

      return res.data;
    } catch (error) {
      console.log("Error get presensi:", error.response?.data || error);
      presensi.value = [];
      return null;
    }
  }

  return {
    presensi,
    getPresensi,
  };
}