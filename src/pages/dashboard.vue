<script setup>
import adminLayout from './adminLayout.vue';
import {ref, computed} from "vue";
import { Users, Clock3, FileText, UserCheck } from 'lucide-vue-next';

const pegawai = ref([
  {
    id: 1,
    employee_name: "Dodol",
  },
]);

const verifikasi = ref([
  {
    id: 1,
    status: "menunggu",
  },
  {
    id: 2,
    status: "disetujui",
  },
]);

const presensi = ref([
  {
    status: "hadir",
  },
  {
    id: 2,
    status: "izin",
  },
  {
    id: 3,
    status: "tidak-hadir",
  },
]);

const laporan = ref([
  { id: 1 },
  { id: 2 },
  { id: 3 },
]);

const verifikasiTerbaru = ref([
  {
    id: 1,
    employee_name: "Budi Sudarsono",
    field_name: "Nama",
    old_value: "Budi",
    new_value: "Budi Sudarsono",
    request_date: "15 - 02 - 2025 10:20",
    status: "menunggu",
  },
  {
    id: 2,
    employee_name: "Citra Kirana",
    field_name: "No HP",
    old_value: "085xxxx",
    new_value: "081xxxx",
    request_date: "13 - 05 - 2025 11:50",
    status: "disetujui",
  },
]);

const totalPegawai = computed(() => pegawai.value.length);

const totalVerifikasiMenunggu = computed(() => {
  return verifikasi.value.filter((item) => item.status === "menunggu").length;
});

const totalLaporanMasuk = computed(() => laporan.value.length);

const totalPresensiHadir = computed(() => {
  return presensi.value.filter((item) => item.status === "hadir").length;
});
</script>

<template>
  <adminLayout>
    <h1 class="text-2xl font-bold mb-6">DASHBOARD</h1>
    <div class="grid grid-cols-4 gap-4 w-full mb-6">

      <div class="bg-blue-100 rounded-2xl px-5 py-4 shadow border border-blue-100">
        <p class="text-center text-[15px] font-bold mb-2">TOTAL PEGAWAI</p>
        <div class="flex items-center justify-left gap-3 mb-2">
          <Users class="text-blue-500" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ totalPegawai }}</h2>
        </div>
        <p class="text-center text-gray-700 text-sm">Data Pegawai Terdaftar</p>
      </div>

      <div class="bg-yellow-100 rounded-2xl px-5 py-4 shadow border border-yellow-100">
        <p class="text-center text-[15px] font-bold mb-2">VERIFIKASI MENUNGGU</p>
        <div class="flex items-center justify-left gap-3 mb-2">
          <Clock3 class="text-yellow-500" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ totalVerifikasiMenunggu }}</h2>
        </div>
        <p class="text-center text-gray-700 text-sm">Data Perlu Diverifikasi</p>
      </div>

      <div class="bg-purple-100 rounded-2xl px-5 py-4 shadow border border-purple-100">
        <p class="text-center text-[15px] font-bold mb-2">LAPORAN MASUK</p>
        <div class="flex items-center justify-left gap-3 mb-2">
          <FileText class="text-purple-500" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ totalLaporanMasuk }}</h2>
        </div>
        <p class="text-center text-gray-700 text-sm">Pengajuan / Laporan Baru</p>
      </div>
      <div class="bg-green-100 rounded-2xl px-5 py-4 shadow border border-green-100">
        <p class="text-center text-[15px] font-bold mb-2">PRESENSI HARI INI</p>
        <div class="flex items-center justify-left gap-3 mb-2">
          <UserCheck class="text-green-500" :size="38" />
          <h2 class="text-3xl font-bold leading-none">{{ totalPresensiHadir }}</h2>
        </div>
        <p class="text-center text-gray-700 text-sm">Pegawai Hadir Hari Ini</p>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="px-5 py-3">
        <h2 class=" font-bold text-sm">VERIFIKASI TERBARU</h2>
      </div>

      <table class="w-full text-sm">
        <thead>
          <tr class="bg-blue-200 font-semibold">
            <th class="p-2 text-left">NO</th>
            <th class="p-2 text-left">NAMA PEGAWAI</th>
            <th class="p-2 text-left">FIELD DIUBAH</th>
            <th class="p-2 text-left">DATA LAMA</th>
            <th class="p-2 text-left">DATA BARU</th>
            <th class="p-2 text-left">TGL PENGAJUAN</th>
            <th class="p-2 text-center">STATUS</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in verifikasiTerbaru"
            :key="item.id"
            class="odd:bg-gray-50 even:bg-white font-semibold"
          >
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ item.employee_name }}</td>
            <td class="p-3">{{ item.field_name }}</td>
            <td class="p-3">{{ item.old_value }}</td>
            <td class="p-3">{{ item.new_value }}</td>
            <td class="p-3">{{ item.request_date }}</td>

            <td class="p-3 text-center">
              <span
                class="px-4 py-1 rounded-full text-xs font-bold"
                :class="
                  item.status === 'disetujui'
                    ? 'bg-green-100 text-green-600'
                    : item.status === 'ditolak'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-500'
                "
              >
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="text-center py-3">
        <RouterLink
          to="/verifikasi"
          class="text-blue-900 font-bold hover:underline"
        >
          Lihat semua verifikasi &gt;
        </RouterLink>
      </div>
      
    </div>
  </adminLayout>
</template>