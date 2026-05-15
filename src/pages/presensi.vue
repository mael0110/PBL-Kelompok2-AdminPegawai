<script setup>
import adminLayout from './adminLayout.vue';
import { ref, computed } from "vue";
import {UserCheck, UserRoundPlus, UserX, Cross, Search} from "lucide-vue-next";

const search = ref("");
const filterStatus = ref("");
const filterTanggal = ref("");

const presensi = ref([
    {
        id: 1,
        employee_name: "Budi Sudarsono",
        nip: "1023xxx",
        tanggal: "2025-01-15",
        jam_masuk: "08:00",
        jam_keluar: "17:00",
        status: "hadir",  
    },
    {
        id: 2,
        employee_name: "Rara Setiawati",
        nip: "1024xxx",
        tanggal: "2025-01-15",
        jam_masuk: "-",
        jam_keluar: "-",
        status: "izin"
    },
]);

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
    <p class="flex gap-4 mb-6">Data Kehadiran Pegawai</p>

    <div >
        <div class="flex gap-4 mb-6 ">
            <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="18"/>
            <input
            v-model="search"
            type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
            </div> 

            <select
            v-model="filterStatus"
            class="bg-transparent border border-blue-900 text-blue-900 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200">
                <option value="">Filter Status</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="tidak-hadir">Tidak Hadir</option>
            </select>

            <input
            v-model="filterTanggal"
            type="date"
            class="bg-transparent border border-blue-900 text-blue-900 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
        </div>

        <div class="grid grid-cols-4 gap-4 mb-6">
            <div class="bg-green-100 rounded-2xl p-5 flex items-center gap-4">
            <UserCheck class="text-green-500" :size="46" />
            <div>
                <h3 class="text-2xl font-bold">95</h3>
                <p class="text-lg font-semibold">Hadir</p>
                <p class="text-gray-700">Total Hadir</p>
            </div>
            </div>

            <div class="bg-yellow-100 rounded-2xl p-5 flex items-center gap-4">
            <UserRoundPlus class="text-yellow-500" :size="46" />
            <div>
                <h3 class="text-2xl font-bold">18</h3>
                <p class="text-lg font-semibold">Izin</p>
                <p class="text-gray-700">Total Izin</p>
            </div>
            </div>

            <div class="bg-red-100 rounded-2xl p-5 flex items-center gap-4">
            <UserX class="text-red-500" :size="46" />
            <div>
                <h3 class="text-2xl font-bold">7</h3>
                <p class="text-lg font-semibold">Alpha</p>
                <p class="text-gray-700">Total Alpha</p>
            </div>
            </div>

            <div class="bg-blue-100 rounded-2xl p-5 flex items-center gap-4">
            <Cross class="text-blue-700 fill-current" :size="46" />
            <div>
                <h3 class="text-2xl font-bold">5</h3>
                <p class="text-lg font-semibold">Sakit</p>
                <p class="text-gray-700">Total Sakit</p>
            </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md overflow-hidden">
            <div class="px-2 py-3">
                <h2 class="font-bold text-xl">DAFTAR PRESENSI</h2>
            </div>

            <table class="w-full text-sm">
                <thead>
                    <tr class="bg-blue-200 font-semibold">
                        <th class="p-3 text-letf">NO</th>
                        <th class="p-3 text-left">NAMA PEGAWAI</th>
                        <th class="p-3 text-left">NIP</th>
                        <th class="p-3 text-left">JAM MASUK</th>
                        <th class="p-3 text-left">JAM KELUAR</th>
                        <th class="p-3 text-left">STATUS</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="(item, index) in filteredPresensi" :key="item.id" class="hover:bg-gray-50">
                        <td class="p-3 font-semibold">{{ index + 1 }}</td>
                        <td class="p-3 text-semibold">{{ item.employee_name}}</td>
                        <td class="p-3 text-semibold">{{ item.nip}}</td>
                        <td class="p-3 text-semibold">{{ item.jam_masuk}}</td>
                        <td class="p-3 text-semibold">{{ item.jam_keluar}}</td>
                        <td class="p-3">
                            <span
                            class="px-3 py-1 rounded-full text=xc font=bold"
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