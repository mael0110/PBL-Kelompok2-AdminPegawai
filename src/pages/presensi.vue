<script setup>
import adminLayout from './adminLayout.vue';
import { ref, computed, onMounted } from "vue";
import {UserCheck, UserRoundPlus, UserX, Cross, Search, Filter} from "lucide-vue-next";
import {presensiService} from "../services/presensi";

const { presensi, getPresensi } = presensiService();
const search = ref("");
const filterStatus = ref("");
const filterTanggal = ref("");

onMounted(async () => {
  await getPresensi("2025-05-12", "ISI_SESI_ID");
});

const filteredPresensi = computed(() => {
  return presensi.value.filter((item) => {
    const keyword = search.value.toLowerCase();

    const cocokSearch =
      item.employee_name.toLowerCase().includes(keyword) ||
      item.nip.toLowerCase().includes(keyword);

    const cocokStatus =
      filterStatus.value === "" || item.status === filterStatus.value;

    const cocokTanggal =
      filterTanggal.value === "" || item.request_date === filterTanggal.value;

    return cocokSearch && cocokStatus && cocokTanggal;
  });
});
</script>

<template>
<adminLayout>
    <h1 class="text-2xl font-bold">PRESENSI</h1>
    <p class="flex text-sm gap-4 mb-6">Data Kehadiran Pegawai</p>

    <div >
        <div class="flex gap-4 mb-6 ">
            <div class="relative flex-1 text-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="18"/>
            <input
            v-model="search"
            type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
            </div> 

            <div class="relative">
            <Filter class="absolute left-3 top-1/2 -translate-y-1/2 text-white" :size="16"/>
            <select
            v-model="filterStatus"
            class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200">
                <option value="">Filter Status</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="tidak-hadir">Tidak Hadir</option>
            </select>
            </div>
            
            <div class="relative">
            <input
            v-model="filterTanggal"
            type="date"
            class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 py-2 rounded-lg appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
            </div>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="card-dashboard bg-green-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-green-100">
                <p class="text-center text-[16px] font-bold mb-2">HADIR</p>
                <div class="relative flex items-center justify-center mb-2">
                    <UserCheck class="text-green-500 absolute left-2" :size="46"/>
                    <h2 class="text-3xl font-bold leading-none">1</h2>
                </div>
                <p class="text-center text-gray-700 text-[14px]">Total Hadir</p>
            </div>

            <div class="card-dashboard bg-yellow-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-yellow-100">
                <p class="text-center text-[16px] font-bold mb-2">IZIN</p>
                <div class="relative flex items-center justify-center mb-2">
                    <UserRoundPlus class="text-yellow-500 absolute left-2" :size="46" />
                    <h2 class="text-3xl font-bold leading-none">1</h2>
                </div>
                <p class="text-center text-gray-700 text-[14px]">Total Izin</p>
            <UserRoundPlus class="text-yellow-500" :size="46" />
            </div>

            <div class="card-dashboard bg-red-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-red-100">
                <p class="text-center text-[16px] font-bold mb-2">ALPA</p>
                <div class="relative flex items-center justify-center mb-2">
                    <UserRoundPlus class="text-red-500 absolute left-2" :size="46" />
                    <h2 class="text-3xl font-bold leading-none">1</h2>
                </div>
                <p class="text-center text-gray-700 text-[14px]">Total Alpa</p>
            <UserRoundPlus class="text-red-500" :size="46" />
            </div>

            <div class="card-dashboard bg-blue-100 rounded-xl shadow-md px-4 py-3 h-[100px] flex flex-col justify-center shadow border border-blue-100">
                <p class="text-center text-[16px] font-bold mb-2">SAKIT</p>
                <div class="relative flex items-center justify-center mb-2">
                    <UserRoundPlus class="text-blue-500 absolute left-2" :size="46" />
                    <h2 class="text-3xl font-bold leading-none">1</h2>
                </div>
                <p class="text-center text-gray-700 text-[14px]">Total Sakit</p>
            <UserRoundPlus class="text-blue-500" :size="46" />
            </div>

        </div>

        <div class="bg-white rounded-xl shadow-md px-5">
            <div class="px-2 py-3">
                <h2 class="font-bold text-sm">DAFTAR PRESENSI</h2>
            </div>

            <table class="table-dashboard w-full text-sm">
                <thead>
                    <tr class="bg-blue-200 font-semibold border-b border-gray-200">
                        <th class="p-3 text-letf">NO</th>
                        <th class="p-3 text-left">NAMA PEGAWAI</th>
                        <th class="p-3 text-left">NIP</th>
                        <th class="p-3 text-left">JAM MASUK</th>
                        <th class="p-3 text-left">JAM KELUAR</th>
                        <th class="p-3 text-left">STATUS</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in filteredPresensi" :key="item.id" class="odd:bg-gray-50 even:bg-white font-semibold border-b border-gray-200">
                        <td class="p-3 text-semibold text-center">{{ index + 1 }}</td>
                        <td class="p-3 text-semibold">{{ item.employee_name}}</td>
                        <td class="p-3 text-semibold">{{ item.nip}}</td>
                        <td class="p-3 text-semibold">{{ item.jam_masuk}}</td>
                        <td class="p-3 text-semibold">{{ item.jam_keluar}}</td>
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
                                {{ item.status }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
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