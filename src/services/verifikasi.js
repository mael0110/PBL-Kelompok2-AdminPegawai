import axios from "axios";
import { ref } from "vue";

export function verifikasiService() {
  const verifikasi = ref([]);
  const meta = ref(null);

  async function getVerifikasi(page = 1) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        `https://api-pegawai-4a.akufarish.my.id:1234/api/change-requests?page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Data verifikasi:", res.data);

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
      `https://api-pegawai-4a.akufarish.my.id:1234/api/change-requests/${id}`,
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

  return {
    verifikasi,
    meta,
    getVerifikasi,
    updateVerifikasi,
  };
}