<script setup>
import adminLayout from './adminLayout.vue';
import { ref, computed, onMounted } from "vue";
import { UserCheck, UserRoundPlus, Search, Filter } from "lucide-vue-next";
import { presensiService } from "../services/presensi";

const { presensi, getPresensi, meta } = presensiService();
const search = ref("");
const filterStatus = ref("");
const filterTanggal = ref("");

// Card counts untuk Hadir, Izin, Alpa, Sakit
const cardCounts = ref({
  hadir: 0,
  izin: 0,
  alpha: 0,
  sakit: 0
});

// Ambil data saat mounted
onMounted(async () => {
  await getPresensi();
  updateCounts();
});

// FlatMap semua pegawai dari setiap sesi
const filteredPresensi = computed(() => {
  const allPegawai = presensi.value.flatMap(sess =>
    (sess.pegawai || []).map(p => ({
      ...p,
      sesi_created_at: sess.created_at,
      jam_masuk: p.jam_masuk,
      jam_keluar: p.jam_keluar
    }))
  );

  return allPegawai.filter(item => {
    const keyword = search.value.toLowerCase();

    const cocokSearch =
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      item.detail_id?.toLowerCase().includes(keyword);

    const cocokStatus =
      filterStatus.value === "" || 
      (filterStatus.value === "tidak-hadir" ? item.status === "alpha" : item.status === filterStatus.value);

    const cocokTanggal =
      filterTanggal.value === "" || item.sesi_created_at === filterTanggal.value;

    return cocokSearch && cocokStatus && cocokTanggal;
  });
});

// Update card counts sesuai backend
const updateCounts = () => {
  const allPegawai = presensi.value.flatMap(sess => sess.pegawai || []);
  cardCounts.value.hadir = allPegawai.filter(p => p.status === "hadir").length;
  cardCounts.value.izin = allPegawai.filter(p => p.status === "izin").length;
  cardCounts.value.alpha = allPegawai.filter(p => p.status === "alpha").length;
  cardCounts.value.sakit = allPegawai.filter(p => p.status === "sakit").length;
};

const namaField = (field) => {
  const map = {
    alpha: "Alpa",
    hadir: "Hadir", 
    izin: "Izin",
    sakit: "Sakit"
  };

  return map[field] || field;
};
</script>

<template>
<adminLayout>
  <h1 class="text-2xl font-bold">PRESENSI</h1>
  <p class="flex text-sm gap-4 mb-6">Data Kehadiran Pegawai</p>

  <!-- Filter search, status, tanggal -->
  <div class="flex gap-4 mb-6">
    <div class="relative flex-1 text-sm">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="18"/>
      <input v-model="search" type="text"
        placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
        class="w-full border border-blue-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
    </div>

    <div class="relative">
      <Filter class="absolute left-3 top-1/2 -translate-y-1/2 text-white" :size="16"/>
      <select v-model="filterStatus"
        class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"
      >
        <option value="">Filter Status</option>
        <option value="hadir">Hadir</option>
        <option value="izin">Izin</option>
        <option value="tidak-hadir">Tidak Hadir</option>
        <option value="sakit">Sakit</option>
      </select>
    </div>

    <div class="relative">
      <input v-model="filterTanggal" type="date"
        class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 py-2 rounded-lg appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
    </div>
  </div>

  <!-- Dashboard cards -->
  <div class="grid grid-cols-4 gap-4 mb-6">
    <div class="card-dashboard bg-green-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-green-100">
      <p class="text-center text-[16px] font-bold mb-2">HADIR</p>
      <div class="relative flex items-center justify-center mb-2">
        <UserCheck class="text-green-500 absolute left-2" :size="46"/>
        <h2 class="text-3xl font-bold leading-none">{{ cardCounts.hadir }}</h2>
      </div>
      <p class="text-center text-gray-700 text-[14px]">Total Hadir</p>
    </div>

    <div class="card-dashboard bg-yellow-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-yellow-100">
      <p class="text-center text-[16px] font-bold mb-2">IZIN</p>
      <div class="relative flex items-center justify-center mb-2">
        <UserRoundPlus class="text-yellow-500 absolute left-2" :size="46"/>
        <h2 class="text-3xl font-bold leading-none">{{ cardCounts.izin }}</h2>
      </div>
      <p class="text-center text-gray-700 text-[14px]">Total Izin</p>
    </div>

    <div class="card-dashboard bg-red-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-red-100">
      <p class="text-center text-[16px] font-bold mb-2">ALPA</p>
      <div class="relative flex items-center justify-center mb-2">
        <UserRoundPlus class="text-red-500 absolute left-2" :size="46"/>
        <h2 class="text-3xl font-bold leading-none">{{ cardCounts.alpha }}</h2>
      </div>
      <p class="text-center text-gray-700 text-[14px]">Total Alpa</p>
    </div>

    <div class="card-dashboard bg-blue-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-blue-100">
      <p class="text-center text-[16px] font-bold mb-2">SAKIT</p>
      <div class="relative flex items-center justify-center mb-2">
        <UserRoundPlus class="text-blue-500 absolute left-2" :size="46"/>
        <h2 class="text-3xl font-bold leading-none">{{ cardCounts.sakit }}</h2>
      </div>
      <p class="text-center text-gray-700 text-[14px]">Total Sakit</p>
    </div>
  </div>

  <!-- Tabel Presensi -->
  <div class="bg-white rounded-xl shadow-md px-5">
    <div class="px-2 py-3">
      <h2 class="font-bold text-sm">DAFTAR PRESENSI</h2>
    </div>

    <table class="table-dashboard w-full text-sm">
      <thead>
        <tr class="bg-blue-200 font-semibold border-b border-gray-200">
          <th class="p-3 text-letf">NO</th>
          <th class="p-3 text-left">NAMA PEGAWAI</th>
          <th class="p-3 text-left">EMAIL</th>
          <th class="p-3 text-left">TANGGAL</th>
          <th class="p-3 text-left">STATUS</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(item, index) in filteredPresensi" :key="item.detail_id" class="odd:bg-gray-50 even:bg-white font-semibold border-b border-gray-200">
          <td class="p-3 text-semibold text-center">{{ index + 1 }}</td>
          <td class="p-3 text-semibold">{{ item.name || '-' }}</td>
          <td class="p-3 text-semibold">{{ item.email || '-' }}</td>
          <td class="p-3 text-semibold">{{ item.sesi_created_at || '-' }}</td>
          <td class="p-3 font-semibold text-left">
            <span
              class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold"
              :class="
                item.status == 'hadir'
                ? 'bg-green-100 text-green-700'
                : item.status == 'izin'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
              ">
              {{ namaField(item.status) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div v-if="meta && meta.total_pages > 1" class="flex justify-center gap-2 mt-4">
      <button
        v-for="page in meta.total_pages"
        :key="page"
        @click="getPresensi(page, search.value)"
        :class="page === meta.page
          ? 'bg-blue-900 text-white'
          : 'bg-white text-blue-900 hover:bg-blue-100'"
        class="px-3 py-1 rounded border text-sm"
      >
        {{ page }}
      </button>
    </div>
  </div>
</adminLayout>
</template>

<style scoped>
input[type="date"] {
  position: relative;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  position: absolute;
  left: 10px;
  cursor: pointer;
}


/* OPTION DEFAULT */
select option {
  background: white;
  color: black;
}

/* OPTION SAAT HOVER */
select option:hover {
  background: #2563eb;
  color: white;
}

/* OPTION SAAT DIPILIH */
select option:checked {
  background: #2563eb;
  color: white;
}
</style>