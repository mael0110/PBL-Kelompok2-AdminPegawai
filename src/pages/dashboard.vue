<script setup>
import adminLayout from "./adminLayout.vue";
import { ref, computed, onMounted } from "vue";
import { Users, Clock3, FileText, UserCheck, LogIn, LogOut } from "lucide-vue-next";
import { employeesService } from "../services/pegawai";
import { verifikasiService } from "../services/verifikasi";
import { presensiService } from "../services/presensi";

const { getEmployeeCount } = employeesService();
const { verifikasi, getAllVerifikasi, getVerifikasiPending, getLaporanMasuk, getVerifikasiTerbaru } = verifikasiService();
const { getPresensi, checkStatusPresensiHariIni, postPresensiStart, postPresensiStop } = presensiService();

// --- STATE DATA DASHBOARD ADMIN ---
const totalPegawai = ref(0);
const totalPending = ref(0);
const laporanMasuk = ref(0);
const verifikasiTerbaru = ref([]);
const totalPresensiHadir = ref(0);
const presensiHariIni = ref([
  { label: "Hadir", jumlah: 0, persen: 0, warna: "bg-green-500" },
  { label: "Sakit", jumlah: 0, persen: 0, warna: "bg-blue-300" },
  { label: "Izin", jumlah: 0, persen: 0, warna: "bg-yellow-400" },
  { label: "Alpha", jumlah: 0, persen: 0, warna: "bg-red-500" },
]);

// --- STATE PRESENSI FITUR BARU (ONE-CLICK ACTION) ---
const sudahPresensi = ref(false);
const loadingPresensi = ref(false);

// --- STATE UTK ALERT CUSTOM ---
const customAlert = ref({
  show: false,
  message: ""
});

const triggerAlert = (msg) => {
  customAlert.value.message = msg;
  customAlert.value.show = true;
  setTimeout(() => {
    customAlert.value.show = false;
  }, 3000);
};

// Tanggal hari ini format Indonesia
const today = new Date();
const tanggalHariIni = today.toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// Fungsi mengambil data rekap presensi seluruh pegawai
const fetchPresensiHariIni = async () => {
  try {
    const items = await getPresensi(); 
    const allPegawai = items.flatMap(sess => sess.pegawai || []);

    const total = allPegawai.reduce((acc, item) => {
      if (!item.status) return acc;
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const jumlahTotal = Object.values(total).reduce((a, b) => a + b, 0) || 1;

    presensiHariIni.value = [
      { label: "Hadir", jumlah: total.hadir || 0, persen: Math.round((total.hadir || 0) / jumlahTotal * 100), warna: "bg-green-500" },
      { label: "Sakit", jumlah: total.sakit || 0, persen: Math.round((total.sakit || 0) / jumlahTotal * 100), warna: "bg-blue-300" },
      { label: "Izin", jumlah: total.izin || 0, persen: Math.round((total.izin || 0) / jumlahTotal * 100), warna: "bg-yellow-400" },
      { label: "Alpha", jumlah: total.alpha || 0, persen: Math.round((total.alpha || 0) / jumlahTotal * 100), warna: "bg-red-500" },
    ];

    totalPresensiHadir.value = total.hadir || 0;
  } catch (error) {
    console.error("Gagal memuat rekap presensi:", error);
  }
};

// 🛠️ PERBAIKAN: Deteksi fleksibel isi data status dari backend
const fetchStatusPresensiAdmin = async () => {
  try {
    const res = await checkStatusPresensiHariIni();
    console.log("LOG STATUS PRESENSI BACKEND:", res);
    
    // Mengecek berbagai kemungkinan format: res.is_active, res.data.is_active, atau kata "on"/"active"
    const dataStatus = res?.data !== undefined ? res.data : res;
    
    if (
      dataStatus === true || 
      dataStatus?.is_active === true || 
      dataStatus?.status === 'active' || 
      dataStatus?.status === 'on' ||
      dataStatus?.already_on === true
    ) {
      sudahPresensi.value = true;
    } else {
      sudahPresensi.value = false;
    }
  } catch (error) {
    console.error("Gagal memuat status presensi mandiri admin:", error);
  }
};

// Fungsi aksi presensi masuk (Start)
const handlePresensiStart = async () => {
  loadingPresensi.value = true;
  try {
    const res = await postPresensiStart();
    console.log("LOG START PRESENSI:", res);
    
    // 🟢 PAKSA UTK BERUBAH DI FRONTEND TANPA MENUNGGU SYNC LAINNYA
    sudahPresensi.value = true; 
    
    triggerAlert("Presensi masuk berhasil dicatat!");
    await fetchPresensiHariIni(); // Perbarui rekap grafik
    await fetchStatusPresensiAdmin(); // Ambil ulang status resmi database
  } catch (error) {
    console.error("Error start presensi:", error);
    // Jika backend bilang sudah on, paksa samakan tampilan frontend ke true
    if (error.response?.data?.message?.toLowerCase().includes("already on") || error.response?.data?.includes("already on")) {
      sudahPresensi.value = true;
    }
    triggerAlert(error.response?.data?.message || "Gagal melakukan presensi masuk");
  } finally {
    loadingPresensi.value = false;
  }
};

// Fungsi aksi stop presensi (Stop/Keluar)
const handlePresensiStop = async () => {
  loadingPresensi.value = true;
  try {
    const res = await postPresensiStop();
    console.log("LOG STOP PRESENSI:", res);
    
    // 🔴 PAKSA KEMBALI JADI FALSE DI FRONTEND
    sudahPresensi.value = false;
    
    triggerAlert("Presensi keluar berhasil dicatat!");
    await fetchPresensiHariIni(); // Perbarui rekap grafik
    await fetchStatusPresensiAdmin(); // Ambil ulang status resmi database
  } catch (error) {
    console.error("Error stop presensi:", error);
    triggerAlert(error.response?.data?.message || "Gagal menghentikan presensi");
  } finally {
    loadingPresensi.value = false;
  }
};

onMounted(async () => {
  // Load Counter & Ringkasan Data Admin
  totalPegawai.value = await getEmployeeCount();
  totalPending.value = await getVerifikasiPending();
  laporanMasuk.value = await getLaporanMasuk();
  verifikasiTerbaru.value = await getVerifikasiTerbaru();
  await getAllVerifikasi();

  // Load Rekap List Presensi & Status Absen Mandiri Admin
  await fetchPresensiHariIni();
  await fetchStatusPresensiAdmin();
});

const namaField = (field) => {
  const map = {
    employee_name: "Nama Pegawai",
    nip: "NIP",
    nik: "NIK",
    address: "Alamat",
    birth_place: "Tempat Lahir",
    birth_date: "Tanggal Lahir",
    gender: "Jenis Kelamin",
    phone_number: "No. HP",
    village_code: "Desa/Kelurahan",
    district_code: "Kecamatan",
    city_code: "Kabupaten/Kota",
    province_code: "Provinsi",
    citizen_code: "Kewarganegaraan",
    pending: "Menunggu",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return map[field] || field;
};
</script>

<template>
  <adminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded shadow-lg text-[11px] z-[9999] transition-all duration-300">
      {{ customAlert.message }}
    </div>

    <h1 class="text-lg font-bold">DASHBOARD</h1>
    <div class="page-container">
      
      <div class="grid grid-cols-4 gap-3 mb-4">
        <div class="card-dashboard bg-blue-100 rounded-xl shadow px-3 py-2.5 h-[85px] flex flex-col justify-center border border-blue-100">
          <p class="text-center text-[11px] font-bold mb-1">TOTAL PEGAWAI</p>
          <div class="relative flex items-center justify-center mb-1">
            <Users class="text-blue-500 absolute left-2" :size="26" />
            <h2 class="text-xl font-bold leading-none">{{ totalPegawai }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[11px]">Data Pegawai Terdaftar</p>
        </div>

        <div class="card-dashboard bg-yellow-100 rounded-xl shadow px-3 py-2.5 h-[85px] flex flex-col justify-center border border-yellow-100">
          <p class="text-center text-[11px] font-bold mb-1">VERIFIKASI MENUNGGU</p>
          <div class="relative flex items-center justify-center mb-1">
            <Clock3 class="text-yellow-500 absolute left-2" :size="26" />
            <h2 class="text-xl font-bold leading-none">{{ totalPending }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[11px]">Data Perlu Diverifikasi</p>
        </div>

        <div class="card-dashboard bg-purple-100 rounded-xl shadow px-3 py-2.5 h-[85px] flex flex-col justify-center border border-purple-100">
          <p class="text-center text-[11px] font-bold mb-1">LAPORAN MASUK</p>
          <div class="relative flex items-center justify-center mb-1">
            <FileText class="text-purple-500 absolute left-2" :size="26" />
            <h2 class="text-xl font-bold leading-none">{{ laporanMasuk }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[11px]">Pengajuan / Laporan Baru</p>
        </div>

        <div class="card-dashboard bg-green-100 rounded-xl shadow px-3 py-2.5 h-[85px] flex flex-col justify-center border border-green-100">
          <p class="text-center text-[11px] font-bold mb-1">PRESENSI HARI INI</p>
          <div class="relative flex items-center justify-center mb-1">
            <UserCheck class="text-green-500 absolute left-2" :size="26" />
            <h2 class="text-xl font-bold leading-none">{{ totalPresensiHadir }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[11px]">Pegawai Hadir Hari Ini</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4">
        
        <div class="card-dashboard bg-white rounded-xl h-[190px] shadow-md p-4 flex flex-col justify-between">
          <div>
            <p class="text-gray-400 text-[10px] mb-0.5">Presensi Kehadiran Admin Pegawai</p>
            <p class="text-[11px] font-semibold">{{ tanggalHariIni }}</p>
          </div>
          
          <div class="flex justify-center my-0.5">
            <div v-if="!sudahPresensi" class="w-[38px] h-[38px] bg-amber-500 rounded-full flex items-center justify-center shadow-inner">
              <span class="text-white text-[20px] font-bold">!</span>
            </div>
            <div v-else class="w-[38px] h-[38px] bg-green-500 rounded-full flex items-center justify-center shadow-inner">
              <span class="text-white text-[18px] font-bold">✓</span>
            </div>
          </div>

          <p class="text-center text-[11px] font-semibold">
            {{ sudahPresensi ? "Anda sudah melakukan presensi hari ini" : "Anda belum melakukan presensi hari ini" }}
          </p>
          
          <!-- TOMBOL DINAMIS BERGANTI BERDASARKAN STATUS NYATA BACKEND -->
          <div class="flex justify-center">
            <button
              v-if="!sudahPresensi"
              @click="handlePresensiStart"
              :disabled="loadingPresensi"
              class="w-full flex items-center justify-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white py-1.5 rounded-[5px] text-[11px] font-semibold transition shadow-sm"
            >
              <LogIn :size="13" />
              {{ loadingPresensi ? "Mengirim..." : "Klik Untuk Presensi Masuk" }}
            </button>

            <button
              v-else
              @click="handlePresensiStop"
              :disabled="loadingPresensi"
              class="w-full flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-[5px] text-[11px] font-semibold transition shadow-sm"
            >
              <LogOut :size="13" />
              {{ loadingPresensi ? "Mengirim..." : "Klik Untuk Stop Presensi" }}
            </button>
          </div>
        </div>

        <div class="card-dashboard bg-white rounded-xl h-[190px] shadow-md p-4 flex flex-col justify-between">
          <h2 class="font-bold text-[11px] mb-1">REKAP KESELURUHAN PRESENSI HARI INI</h2>

          <div class="space-y-1.5 pb-0.5">
            <div
              v-for="item in presensiHariIni" 
              :key="item.label"
              class="grid grid-cols-[50px_1fr_25px_25px] items-center gap-2 text-[11px]"
            >
              <span class="font-semibold">{{ item.label }}</span>

              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  class="h-1.5 rounded-full transition-all duration-500"
                  :class="item.warna"
                  :style="{ width: item.persen + '%' }"
                ></div>
              </div>

              <span class="text-right font-bold text-gray-700">{{ item.jumlah }}</span>
              <span class="text-right text-gray-400 text-[10px]">{{ item.persen }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md px-4">
        <div class="px-4 py-2">
          <h2 class="font-bold text-[11px]">VERIFIKASI TERBARU</h2>
        </div>

        <table class="w-full table-dashboard text-[11px] border-b border-gray-200">
          <thead>
            <tr class="bg-blue-200 font-semibold">
              <th class="p-1.5 text-left">NO</th>
              <th class="p-1.5 text-left">NAMA PEGAWAI</th>
              <th class="p-1.5 text-left">FIELD DIUBAH</th>
              <th class="p-1.5 text-left">DATA LAMA</th>
              <th class="p-1.5 text-left">DATA BARU</th>
              <th class="p-1.5 text-center">STATUS</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in verifikasiTerbaru"
              :key="item.id"
              class="hover:bg-gray-50 font-semibold border-b border-gray-300"
            >
              <td class="p-2">{{ index + 1 }}</td>
              <td class="p-2">{{ item.employee.employee_name || "Tidak Diketahui" }}</td>
              <td class="p-2">{{ namaField(item.field_name) }}</td>
              <td class="p-2">{{ item.old_value }}</td>
              <td class="p-2">{{ item.new_value }}</td>

              <td class="p-2 text-center">
                <span
                  class="w-[85px] inline-block text-center px-2 py-1 rounded-md text-[10px] font-semibold"
                  :class="{
                    'bg-green-100 text-green-500': item.status === 'approved',
                    'bg-red-100 text-red-500': item.status === 'rejected',
                    'bg-yellow-100 text-yellow-500': item.status === 'pending'
                  }"
                >
                  {{ namaField(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="text-center py-2">
          <RouterLink
            to="/verifikasi"
            class="text-blue-900 text-[11px] font-bold hover:underline"
          >
            Lihat semua verifikasi &gt;
          </RouterLink>
        </div>
      </div>
    </div>
  </adminLayout>
</template>