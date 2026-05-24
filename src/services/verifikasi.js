import axios from "./axios";
import { ref } from "vue";

export function verifikasiService() {
  const verifikasi = ref([]);
  const meta = ref(null);

  async function getVerifikasi(page = 1) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `/change-requests?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      verifikasi.value = res.data.data;
      meta.value = res.data.meta;
    } catch (error) {
      console.log("Gagal ambil verifikasi:", error.response?.data || error);
    }
  }

  async function updateVerifikasi(id, status) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `/change-requests/${id}`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Berhasil update verifikasi:", res.data);

      return res.data;
    } catch (error) {
      console.log(
        "Gagal update verifikasi:",
        error.response?.data || error
      );

      throw error;
    }
  }

  async function getVerifikasiPending() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "/change-requests/info/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.data.total_pending;
    } catch (error) {
      console.log(
        "Gagal ambil verifikasi pending:",
        error.response?.data || error
      );

      return 0;
    }
  }

  async function getVerifikasiById(id) {
    const res = await axios.get("/change-requests");

    const data = res.data.data.find((item) => item.id === id);

    return data;
  }

  async function getLaporanMasuk() {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "/change-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data.meta.total;
    } catch (error) {
      console.log(
        "Gagal ambil laporan masuk:",
        error.response?.data || error
      );

      return 0;
    }
  }

  async function getVerifikasiTerbaru() {
    try {
      const res = await axios.get("/change-requests/info/newly");

      return res.data.data;
    } catch (error) {
      console.log("Gagal ambil verifikasi terbaru:", error);
      return [];
    }
  }

  async function getAllVerifikasi() {
    try {
      let allData = [];
      let page = 1;
      let lastPage = 1;

      do {
        const res = await axios.get(`/change-requests?page=${page}`);

        allData = [...allData, ...res.data.data];
        lastPage = res.data.meta.last_page;
        page++;
      } while (page <= lastPage);

      verifikasi.value = allData;

      return allData;
    } catch (error) {
      console.log("Gagal ambil semua verifikasi:", error.response?.data || error);
      verifikasi.value = [];
      return [];
    }
  }

  return {
    verifikasi,
    meta,
    getVerifikasi,
    updateVerifikasi,
    getVerifikasiPending,
    getVerifikasiById,
    getLaporanMasuk,
    getVerifikasiTerbaru,
    getAllVerifikasi
  };
}