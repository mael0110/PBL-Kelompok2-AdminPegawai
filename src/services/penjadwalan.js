import axios from "./axios";
import { ref } from "vue";

export function penjadwalanService() {
  const sesiKelas = ref([]);
  const meta = ref(null);

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

  async function getLecturers() {
    try {
      let allEmployees = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const res = await axios.get(`https://api-pegawai-4a.akufarish.my.id:1234/api/employees?page=${currentPage}`);
        
        // Ambil data array dari halaman aktif saat ini
        const pageData = res.data.data || [];
        allEmployees = [...allEmployees, ...pageData];

        // Ambil info pagination meta
        const meta = res.data.meta;
        if (meta && currentPage < meta.last_page) {
          currentPage++; // Jika masih ada halaman selanjutnya, lanjut looping
        } else {
          hasMorePages = false; // Jika sudah mencapai halaman terakhir, stop looping
        }
      }

      console.log(`Berhasil memuat total ${allEmployees.length} data dosen.`);
      return allEmployees;
    } catch (error) {
      console.log("Gagal ambil seluruh data dosen/employees:", error.response?.data || error);
      return [];
    }
  }

  async function getClasses() {
    try {
      const res = await axios.get("https://be.karlearn.site/api/kelas");
      return res.data.data?.items || res.data.data || [];
    } catch (error) {
      console.log("Gagal ambil seluruh master kelas:", error.response?.data || error);
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

 async function getJadwal(page = 1) {
  try {
    const res = await axios.get(`/class-sessions?page=${page}`);
    console.log("Response jadwal:", res.data);

    sesiKelas.value = res.data.data || [];
    meta.value = res.data.meta; 

    return res.data.data || [];
  } catch (error) {
    console.log("Gagal ambil jadwal:", error.response?.data || error);
    sesiKelas.value = [];
    meta.value = null;
    return [];
  }
}

  async function getJadwalById(classSessionId) {
    try {
      const res = await axios.get(`/class-sessions/${classSessionId}`);
      return res.data.data;
    } catch (error) {
      console.log("Gagal ambil detail jadwal:", error.response?.data || error);
      return null;
    }
  }

  async function updateJadwal(classSessionId, payload) {
    try {
      const res = await axios.put(`/class-sessions/${classSessionId}`, payload);
      return res.data;
    } catch (error) {
      console.log("Gagal update jadwal:", error.response?.data || error);
      throw error;
    }
  }

  async function deleteSesiKelas(uuids = []) {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/class-sessions/delete",
        { uuids },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Berhasil hapus sesi kelas:", res.data);
      return res.data;
    } catch (error) {
      console.log("Gagal hapus sesi kelas:", error.response?.data || error);
      throw error;
    }
  }

  async function createPengampu(payload) {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.post(
      "https://be.karlearn.site/api/pengampu",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Pengampu berhasil dibuat:", res.data);
    return res.data;

  } catch (error) {
    console.error("❌ Gagal create pengampu:", error.response?.data || error);

    // OPTIONAL: tampilkan pesan backend
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    }

    throw error;
  }
}


  return {
    sesiKelas,
    meta,
    generateSesi,
    getCourses,
    getLecturers, // Di-export agar Vue bisa memanggil API pegawai baru ini
    getClasses, 
    getProdi,
    getKelasByProdi,
    getPengampuByKelas,
    getJadwal,
    getJadwalById,
    updateJadwal,
    deleteSesiKelas,
    createPengampu
  };
}