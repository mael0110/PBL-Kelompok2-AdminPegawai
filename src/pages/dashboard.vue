<script setup>
import adminLayout from "./adminLayout.vue";
import { ref, computed, onMounted } from "vue";
import { Users, Clock3, FileText, UserCheck } from "lucide-vue-next";
import { employeesService } from "../services/pegawai";
import { verifikasiService } from "../services/verifikasi";
import { presensiService } from "../services/presensi";

const { getEmployeeCount } = employeesService();
const { verifikasi, getAllVerifikasi, getVerifikasiPending, getLaporanMasuk, getVerifikasiTerbaru } = verifikasiService();
const { getPresensi, presensiDosen } = presensiService();

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

// --- STATE PRESENSI FITUR BARU (SAMA SEPERTI PEGAWAI) ---
const sudahPresensi = ref(false);
const loadingPresensi = ref(false);
const showPresensiModal = ref(false);
const statusPresensi = ref("");
const todayKey = new Date().toISOString().split("T")[0];

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

// Fungsi submit absen mandiri admin
const submitPresensi = async () => {
  if (!statusPresensi.value) return;

  loadingPresensi.value = true;

  try {
    const payload = {
      status: statusPresensi.value.trim().toLowerCase()
    };

    console.log("SEND PAYLOAD:", payload);

    const res = await presensiDosen(payload);

    if (res?.success || res) {
      sudahPresensi.value = true;
      localStorage.setItem("presensi_dosen_hari_ini", todayKey);
      showPresensiModal.value = false;
      statusPresensi.value = "";

      await fetchPresensiHariIni();
    }
  } catch (error) {
    console.error("Error submit presensi admin:", error);
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

  // Load Rekap List Presensi
  await fetchPresensiHariIni();

  // Cek Status Absen Mandiri Admin
  const saved = localStorage.getItem("presensi_dosen_hari_ini");
  if (saved === todayKey) {
    sudahPresensi.value = true;
  }
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
    <h1 class="text-2xl font-bold">DASHBOARD</h1>
    <div class="page-container">
      
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="card-dashboard bg-blue-100 rounded-xl shadow px-4 py-3 h-[100px] flex flex-col justify-center border border-blue-100">
          <p class="text-center text-[14px] font-bold mb-2">TOTAL PEGAWAI</p>
          <div class="relative flex items-center justify-center mb-2">
            <Users class="text-blue-500 absolute left-2" :size="38" />
            <h2 class="text-3xl font-bold leading-none">{{ totalPegawai }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[14px]">Data Pegawai Terdaftar</p>
        </div>

        <div class="card-dashboard bg-yellow-100 rounded-xl shadow px-4 py-3 h-[100px] flex flex-col justify-center border border-yellow-100">
          <p class="text-center text-[14px] font-bold mb-2">VERIFIKASI MENUNGGU</p>
          <div class="relative flex items-center justify-center mb-2">
            <Clock3 class="text-yellow-500 absolute left-2" :size="38" />
            <h2 class="text-3xl font-bold leading-none">{{ totalPending }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[14px]">Data Perlu Diverifikasi</p>
        </div>

        <div class="card-dashboard bg-purple-100 rounded-xl shadow px-4 py-3 h-[100px] flex flex-col justify-center border border-purple-100">
          <p class="text-center text-[14px] font-bold mb-2">LAPORAN MASUK</p>
          <div class="relative flex items-center justify-center mb-2">
            <FileText class="text-purple-500 absolute left-2" :size="38" />
            <h2 class="text-3xl font-bold leading-none">{{ laporanMasuk }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[14px]">Pengajuan / Laporan Baru</p>
        </div>

        <div class="card-dashboard bg-green-100 rounded-xl shadow px-4 py-3 h-[100px] flex flex-col justify-center border border-green-100">
          <p class="text-center text-[14px] font-bold mb-2">PRESENSI HARI INI</p>
          <div class="relative flex items-center justify-center mb-2">
            <UserCheck class="text-green-500 absolute left-2" :size="38" />
            <h2 class="text-[24px] font-bold leading-none">{{ totalPresensiHadir }}</h2>
          </div>
          <p class="text-center text-gray-700 text-[14px]">Pegawai Hadir Hari Ini</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        
        <div class="card-dashboard bg-white rounded-xl h-[220px] shadow-md p-5 flex flex-col justify-between">
          <div>
            <p class="text-gray-400 text-[11px] mb-0.5">Presensi Kehadiran Admin Pegawai</p>
            <p class="text-[13px] font-semibold text-gray-700">{{ tanggalHariIni }}</p>
          </div>
          
          <div class="flex justify-center my-1">
            <div v-if="!sudahPresensi" class="w-[50px] h-[50px] bg-amber-500 rounded-full flex items-center justify-center shadow-inner">
              <span class="text-white text-[26px] font-bold">!</span>
            </div>
            <div v-else class="w-[50px] h-[50px] bg-green-500 rounded-full flex items-center justify-center shadow-inner">
              <span class="text-white text-[24px] font-bold">✓</span>
            </div>
          </div>

          <p class="text-center text-[12px] font-semibold text-gray-700">
            {{ sudahPresensi ? "Anda sudah melakukan presensi hari ini" : "Anda belum melakukan presensi hari ini" }}
          </p>
          
          <div class="flex justify-center">
            <button
              @click="showPresensiModal = true"
              :disabled="sudahPresensi || loadingPresensi"
              class="w-full bg-blue-900 text-white py-2 rounded-[6px] text-[12px] font-semibold disabled:bg-gray-300 disabled:text-gray-500 transition shadow-sm"
            >
              {{ loadingPresensi ? "Mengirim..." : "Klik Untuk Presensi Masuk" }}
            </button>
          </div>
        </div>

        <div class="card-dashboard bg-white rounded-xl h-[220px] shadow-md p-5 flex flex-col justify-between">
          <h2 class="font-bold text-sm mb-2">REKAP KESELURUHAN PRESENSI HARI INI</h2>

          <div class="space-y-2.5 pb-1">
            <div
              v-for="item in presensiHariIni" 
              :key="item.label"
              class="grid grid-cols-[60px_1fr_30px_30px] items-center gap-3 text-[13px]"
            >
              <span class="font-semibold">{{ item.label }}</span>

              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-500"
                  :class="item.warna"
                  :style="{ width: item.persen + '%' }"
                ></div>
              </div>

              <span class="text-right font-bold text-gray-700">{{ item.jumlah }}</span>
              <span class="text-right text-gray-400">{{ item.persen }}%</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md px-5">
        <div class="px-5 py-3">
          <h2 class="font-bold text-sm">VERIFIKASI TERBARU</h2>
        </div>

        <table class="w-full table-dashboard text-sm border-b border-gray-200">
          <thead>
            <tr class="bg-blue-200 font-semibold">
              <th class="p-2 text-left">NO</th>
              <th class="p-2 text-left">NAMA PEGAWAI</th>
              <th class="p-2 text-left">FIELD DIUBAH</th>
              <th class="p-2 text-left">DATA LAMA</th>
              <th class="p-2 text-left">DATA BARU</th>
              <th class="p-2 text-center">STATUS</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(item, index) in verifikasiTerbaru"
              :key="item.id"
              class="hover:bg-gray-50 font-semibold border-b border-gray-300"
            >
              <td class="p-3">{{ index + 1 }}</td>
              <td class="p-3">{{ item.employee.employee_name }}</td>
              <td class="p-3">{{ namaField(item.field_name) }}</td>
              <td class="p-3">{{ item.old_value }}</td>
              <td class="p-3">{{ item.new_value }}</td>

              <td class="p-3 text-center">
                <span
                  class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold text-white"
                  :class="{
                    'bg-green-600': item.status === 'approved',
                    'bg-red-500': item.status === 'rejected',
                    'bg-yellow-500': item.status === 'pending'
                  }"
                >
                  {{ namaField(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="text-center py-3">
          <RouterLink
            to="/verifikasi"
            class="text-blue-900 text-[14px] font-bold hover:underline"
          >
            Lihat semua verifikasi &gt;
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="showPresensiModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white w-[300px] p-5 rounded-[10px] shadow-xl relative border border-gray-100">
        <button class="absolute top-2 right-3 text-gray-400 hover:text-black text-[20px]" @click="showPresensiModal = false">×</button>
        <h2 class="text-center font-bold text-[14px] text-gray-800 mb-3">Pilih Status Kehadiran</h2>
        
        <select v-model="statusPresensi" class="w-full border border-gray-200 bg-white p-2 rounded-[6px] mb-4 text-[12px] outline-none focus:border-blue-900 text-gray-700">
          <option disabled value="">-- Pilih Status --</option>
          <option value="hadir">Hadir (Masuk Kerja)</option>
          <option value="izin">Izin Resmi</option>
          <option value="sakit">Sakit</option>
        </select>
        
        <button 
          @click="submitPresensi" 
          class="w-full bg-blue-900 text-white py-2 rounded-[6px] text-[12px] font-bold disabled:bg-gray-300 shadow-sm" 
          :disabled="!statusPresensi || loadingPresensi"
        >
          {{ loadingPresensi ? "Mengirim..." : "Kirim Data Presensi" }}
        </button>
      </div>
    </div>
  </adminLayout>
</template>