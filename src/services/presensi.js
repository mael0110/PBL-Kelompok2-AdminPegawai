import axios from "./axios";
import { ref } from "vue";

export function presensiService() {
  const presensi = ref([]);
  const meta = ref(null);

  async function getPresensi( page = 1, search = "") {
    try {
      const res = await axios.get("https://be.karlearn.site/api/presensi/pegawai", {
        params: {
          // ...filter,
          page,
          search
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response presensi:", res.data);

      // Ambil semua items
      presensi.value = res.data.data?.items || [];

      return presensi.value;
    } catch (error) {
      console.log("Error get presensi:", error.response?.data || error);
      presensi.value = [];
      return null;
    }
  }

  return {
    presensi,
    getPresensi,
    meta
  };
}