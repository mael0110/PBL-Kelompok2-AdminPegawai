import axios from "./axios";
import { ref } from "vue";

let cachedEmployees = [];
let isEmployeeLoaded = false;

export function presensiService() {
  const presensi = ref([]);
  const meta = ref(null);

  // Helper untuk mendapatkan token & headers secara konsisten
  const getHeaders = () => {
    return {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    };
  };

  // 1. GET STATUS PRESENSI WORKERS (BARU)
  async function checkStatusPresensiHariIni() {
    try {
      const response = await axios.get(
        "https://be.karlearn.site/api/workers/presensi/status",
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error Get Status Presensi Workers:", error.response?.data || error);
      throw error;
    }
  }

  // 2. POST START PRESENSI WORKERS (BARU)
  async function postPresensiStart() {
    try {
      const response = await axios.post(
        "https://be.karlearn.site/api/workers/presensi/start",
        {},
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error Post Start Presensi Workers:", error.response?.data || error);
      throw error;
    }
  }

  // 3. POST STOP PRESENSI WORKERS (BARU)
  async function postPresensiStop() {
    try {
      const response = await axios.post(
        "https://be.karlearn.site/api/workers/presensi/stop",
        {},
        getHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("Error Post Stop Presensi Workers:", error.response?.data || error);
      throw error;
    }
  }

  async function getPresensi(page = 1, search = "") {
    try {
      const resPresensi = await axios.get("https://be.karlearn.site/api/presensi/pegawai", {
        params: { page, search },
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const itemsPresensi = resPresensi.data.data?.items || [];
      meta.value = resPresensi.data.data?.pagination || null;

      if (!isEmployeeLoaded || cachedEmployees.length === 0) {
        try {
          console.log("Mengambil master data pegawai Kelompok 2 secara sekuensial (Anti-429)...");
          let tempEmployees = [];
          
          const page1Res = await axios.get("https://api-pegawai-4a.akufarish.my.id:1234/api/employees?page=1", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });

          const data1 = page1Res.data?.data || [];
          if (Array.isArray(data1)) tempEmployees = [...data1];

          const info = page1Res.data?.meta || page1Res.data?.pagination || page1Res.data;
          let maxPage = info?.last_page || info?.total_pages || 1;

          if (maxPage === 1 && info?.total && info?.per_page) {
            maxPage = Math.ceil(info.total / info.per_page);
          }
          
          if (maxPage === 1) maxPage = 15;

          for (let p = 2; p <= maxPage; p++) {
            try {
              const nextRes = await axios.get(`https://api-pegawai-4a.akufarish.my.id:1234/api/employees?page=${p}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              });
              const dataNext = nextRes.data?.data || nextRes.data?.data?.items || [];
              if (Array.isArray(dataNext)) {
                tempEmployees = [...tempEmployees, ...dataNext];
              }
              
              await new Promise(resolve => setTimeout(resolve, 50));
            } catch (errPage) {
              console.warn(`Gagal mengambil data pegawai di page ${p}:`, errPage.message);
              if (errPage.response?.status === 429) break;
            }
          }

          if (tempEmployees.length > 0) {
            cachedEmployees = tempEmployees;
            isEmployeeLoaded = true;
          }
        } catch (errEmp) {
          console.error("Gagal total inisialisasi awal master data pegawai:", errEmp);
        }
      }

      console.log(`Menggunakan ${cachedEmployees.length} data pegawai dari cache frontend.`);

      const dataGabungan = itemsPresensi.map(sesi => {
        if (sesi.pegawai && Array.isArray(sesi.pegawai)) {
          const pegawaiDenganNip = sesi.pegawai.map(p => {
            
            const idK1 = p.detail_id ? String(p.detail_id).toLowerCase().trim() : "";
            const namaK1 = p.name ? String(p.name).toLowerCase().trim() : "";

            const matchEmployee = cachedEmployees.find(emp => {
              const idK2 = emp.id ? String(emp.id).toLowerCase().trim() : "";
              const namaK2 = emp.employee_name ? String(emp.employee_name).toLowerCase().trim() : "";

              const cocokID = (idK1 !== "" && idK1 === idK2);
              const cocokNama = (namaK1 !== "" && namaK1 === namaK2);

              return cocokID || cocokNama;
            });

            return {
              ...p,
              nip: matchEmployee ? matchEmployee.nip : "-"
            };
          });

          return {
            ...sesi,
            pegawai: pegawaiDenganNip
          };
        }
        return sesi;
      });

      presensi.value = dataGabungan;
      return presensi.value;

    } catch (error) {
      console.error("Error global get presensi:", error.response?.data || error);
      presensi.value = [];
      return null;
    }
  }

  async function presensiDosen(payload) {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `https://be.karlearn.site/api/presensi/pegawai`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response presensi:", res.data);
      return res.data;

    } catch (error) {
      console.log("Gagal presensi API:", error.response?.data || error);
      throw error;
    }
  }

  return {
    presensi,
    getPresensi,
    presensiDosen,
    checkStatusPresensiHariIni, 
    postPresensiStart,        
    postPresensiStop,         
    meta,
  };
}