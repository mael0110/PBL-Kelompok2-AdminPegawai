<script setup>
import adminLayout from "./adminLayout.vue";
import { ref, computed, onMounted } from "vue";
import { Users, Clock3, FileText, UserCheck } from "lucide-vue-next";
import { employeesService } from "../services/pegawai";
import { verifikasiService } from "../services/verifikasi";
import { presensiService } from "../services/presensi";

const totalPegawai = ref(0);
const totalPending = ref(0);
const laporanMasuk = ref(0);
const verifikasiTerbaru = ref([]);

const { getEmployeeCount } = employeesService();
const { verifikasi, getAllVerifikasi, getVerifikasiPending,getLaporanMasuk, getVerifikasiTerbaru} = verifikasiService();
const { getPresensi } = presensiService();

const presensiHariIni = ref([
  { label: "Hadir", jumlah: 0, persen: 0, warna: "bg-green-500" },
  { label: "Sakit", jumlah: 0, persen: 0, warna: "bg-blue-300" },
  { label: "Izin", jumlah: 0, persen: 0, warna: "bg-yellow-400" },
  { label: "Alpha", jumlah: 0, persen: 0, warna: "bg-red-500" },
]);

onMounted(async () => {
  totalPegawai.value = await getEmployeeCount();
  totalPending.value = await getVerifikasiPending();
  laporanMasuk.value = await getLaporanMasuk();
  verifikasiTerbaru.value = await getVerifikasiTerbaru();

  await getAllVerifikasi();
});

const ringkasanVerifikasi = computed(() => {
  const data = verifikasi.value || [];

  return {
    pending: data.filter((item) => item.status === "pending").length,
    approved: data.filter((item) => item.status === "approved").length,
    rejected: data.filter((item) => item.status === "rejected").length,
    total: data.length,
  };
});

const persenPending = computed(() => {
  if (ringkasanVerifikasi.value.total === 0) return 0;

  return Math.round(
    (ringkasanVerifikasi.value.pending / ringkasanVerifikasi.value.total) * 100
  );
});

const persenApproved = computed(() => {
  if (ringkasanVerifikasi.value.total === 0) return 0;

  return Math.round(
    (ringkasanVerifikasi.value.approved / ringkasanVerifikasi.value.total) * 100
  );
});

const persenRejected = computed(() => {
  if (ringkasanVerifikasi.value.total === 0) return 0;

  return Math.round(
    (ringkasanVerifikasi.value.rejected / ringkasanVerifikasi.value.total) * 100
  );
});

const totalPresensiHadir = computed(() => {
  return presensi.value.filter((item) => item.status === "hadir").length;
});

const presensiHariIni = [
  { label: "Hadir", jumlah: 95, persen: 79, warna: "bg-green-500" },
  { label: "Sakit", jumlah: 5, persen: 1, warna: "bg-blue-300" },
  { label: "Izin", jumlah: 7, persen: 6, warna: "bg-yellow-400" },
  { label: "Alpha", jumlah: 7, persen: 6, warna: "bg-red-500" },
];

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
    <div class="page-container ">
      
      <div class="grid grid-cols-4 gap-4 mb-6">

      <div class="card-dashboard bg-blue-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-blue-100">
        <p class="text-center text-[14px] font-bold mb-2">TOTAL PEGAWAI</p>
        <div class="relative flex items-center justify-center mb-2">
          <Users class="text-blue-500 absolute left-2" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ totalPegawai }}</h2>
        </div>
        <p class="text-center text-gray-700 text-[14px]">Data Pegawai Terdaftar</p>
      </div>

      <div class="card-dashboard bg-yellow-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-yellow-100">
        <p class="text-center text-[14px] font-bold mb-2">VERIFIKASI MENUNGGU</p>
        <div class="relative flex items-center justify-center mb-2">
          <Clock3 class="text-yellow-500 absolute left-2" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{totalPending }}</h2>
        </div>
        <p class="text-center text-gray-700 text-[14px]">Data Perlu Diverifikasi</p>
      </div>

      <div class="card-dashboard bg-purple-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-purple-100">
        <p class="text-center text-[14px] font-bold mb-2">LAPORAN MASUK</p>
        <div class="relative flex items-center justify-center mb-2">
          <FileText class="text-purple-500 absolute left-2" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ laporanMasuk }}</h2>
        </div>
        <p class="text-center text-gray-700 text-[14px]">Pengajuan / Laporan Baru</p>
      </div>

      <div class="card-dashboard bg-green-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-green-100">
        <p class="text-center text-[14px] font-bold mb-2">PRESENSI HARI INI</p>
        <div class="relative flex items-center justify-center mb-2">
          <UserCheck class="text-green-500 absolute left-2" :size="38" />
          <h2 class="text-[24px] font-bold leading-none">{{ totalPresensiHadir }}</h2>
        </div>
        <p class="text-center text-gray-700 text-[14px]">Pegawai Hadir Hari Ini</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <!-- RINGKASAN VERIFIKASI -->
      <div class="card-dashboard bg-white h-[180px] rounded-xl shadow-md p-5">
        <h2 class="font-bold text-sm mb-4">RINGKASAN VERIFIKASI</h2>

        <div class="flex items-center gap-8 ml-5">
          <div
            class="w-30 h-30 rounded-full flex items-center justify-center"
            :style="{
              background: ringkasanVerifikasi.total === 0 ? '#e5e7eb' :`
                conic-gradient(
                  #facc15 0 ${persenPending}%,
                  #22c55e ${persenPending}% ${persenPending + persenApproved}%,
                  #ef4444 ${persenPending + persenApproved}% 100%
                )
              `
            }"
          >
            <div class="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center text-sm font-bold">
              {{ ringkasanVerifikasi.total }}
              <span class="font-normal text-xs">Total</span>
            </div>
          </div>

          <div class="space-y-2 text-[13px] font-semibold ml-[90px]">
            <p>
              <span class="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
              Menunggu {{ ringkasanVerifikasi.pending }}
            </p>
            <p>
              <span class="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Disetujui {{ ringkasanVerifikasi.approved }}
            </p>
            <p>
              <span class="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Ditolak {{ ringkasanVerifikasi.rejected }}
            </p>
          </div>

          
        </div>
      </div>

      <!-- PRESENSI HARI INI -->
      <div class="card-dashboard bg-white rounded-xl h-[180px] shadow-md p-5">
        <h2 class="font-bold text-sm mb-5">PRESENSI HARI INI</h2>

        <div class="space-y-2">
          <div
            v-for="item in presensiHariIni"
            :key="item.label"
            class="grid grid-cols-[60px_1fr_30px_30px] items-center gap-3 text-[13px]"
          >
            <span class="font-semibold">{{ item.label }}</span>

            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full"
                :class="item.warna"
                :style="{ width: item.persen + '%' }"
              ></div>
            </div>

            <span>{{ item.jumlah }}</span>
            <span>{{ item.persen }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md px-5">
      <div class="px-5 py-3">
        <h2 class=" font-bold text-sm">VERIFIKASI TERBARU</h2>
      </div>

      <table class="w-full table-dashboard w-full text-sm border-b border-gray-200">
        <thead>
          <tr class="bg-blue-200 font-semibold">
            <th class="p-2 text-left">NO</th>
            <th class="p-2 text-left">NAMA PEGAWAI</th>
            <th class="p-2 text-left">FIELD DIUBAH</th>
            <th class="p-2 text-left">DATA LAMA</th>
            <th class="p-2 text-left">DATA BARU</th>
            <!-- <th class="p-2 text-left">TGL PENGAJUAN</th> -->
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
            <!-- <td class="p-3">{{ item.request_date }}</td> -->

            <td class="p-3 text-center">
              <span
                class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold"
                :class="{
                  'bg-[#22C55E]': item.status === 'approved',
                  'bg-[#EF4444]': item.status === 'rejected',
                  'bg-[#FACC15]': item.status === 'pending'
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
  </adminLayout>
</template>