import axios from "./axios";
import { ref } from "vue";

export function verifikasiService() {
  const verifikasi = ref([]);
  const meta = ref(null);

  // FIX: Menambahkan parameter search dan status agar dikirim ke API backend
  async function getVerifikasi(page = 1, search = "", status = "") {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`/change-requests`, {
        // Mengirimkan parameter sesuai requirement API
        params: { 
          page, 
          search: search || undefined, // Jika kosong, tidak akan dikirim ke API
          status: status || undefined  // Jika kosong, tidak akan dikirim ke API
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Mengambil verifikasi page:", page, "| Search:", search, "| Status:", status);
      console.log("Response meta:", res.data.meta);

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
          status
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
    try {
      const token = localStorage.getItem("token");
      let allData = [];
      let page = 1;
      let lastPage = 1;

      do {
        const res = await axios.get(`/change-requests?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        allData = [...allData, ...res.data.data];
        lastPage = res.data.meta.last_page;
        page++;
      } while (page <= lastPage);

      const data = allData.find((item) => item.id === id);
      return data;
    } catch (error) {
      console.log("Gagal ambil verifikasi by id:", error.response?.data || error);
      return null;
    }
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
      const token = localStorage.getItem("token");
      const res = await axios.get("/change-requests/info/newly", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data.data;
    } catch (error) {
      console.log("Gagal ambil verifikasi terbaru:", error);
      return [];
    }
  }

  async function getAllVerifikasi() {
    try {
      const token = localStorage.getItem("token");
      let allData = [];
      let page = 1;
      let lastPage = 1;

      do {
        const res = await axios.get(`/change-requests?page=${page}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

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