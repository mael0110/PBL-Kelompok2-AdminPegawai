<script setup>
import AdminLayout from "./adminLayout.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { verifikasiService } from "../services/verifikasi";
import { Search } from "lucide-vue-next";

const router = useRouter();
const { verifikasi, meta, getVerifikasi } = verifikasiService();

const search = ref("");
const filterStatus = ref("");
const filterTanggal = ref("");

onMounted(async () => {
  await getVerifikasi();
});

const filteredVerifikasi = computed(() => {
  return verifikasi.value.filter((item) => {
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
  <AdminLayout>
    <div>
      <h1 class="text-2xl font-bold mb-8 uppercase tracking-wide">Verifikasi</h1>

      <div class="flex gap-4 mb-6 ">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="18"/>
          <input v-model="search" type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
        </div> 

        <select
          v-model="filterStatus"
          class="bg-transparent border border-blue-900 text-blue-900 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200">
          <option value="">Filter Status</option>
          <option value="approved">Disetujui</option>
          <option value="pending">Menunggu</option>
          <option value="rejected">Ditolak</option>
        </select>

        <input
          v-model="filterTanggal"
          type="date"
          class="bg-transparent border border-blue-900 text-blue-900 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
      </div>

    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="px-2 py-3">
          <h2 class="font-bold text-xl">DAFTAR VERIFIKASI</h2>
        </div>
      <table class="w-full text-sm">
        <thead>
        <tr class="bg-blue-200 font-semibold">
            <th class="text-left p-3">No</th>
            <th class="text-left p-3">Nama Pegawai</th>
            <th class="text-left p-3">NIP</th>
            <th class="text-left p-3">NIK</th>
            <th class="text-left p-3">Tanggal Pengajuan</th>
            <th class="text-left p-3">Status</th>
            <th class="text-center p-3">Aksi</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="(item, index) in filteredVerifikasi"
            :key="item.id"
            class="border-t hover:bg-blue-50 transition">
            <td class="p-3 text-semibold">{{ index + 1 }}</td>
            <td class="p-3 text-semibold">{{ item.employee.employee_name }}</td>
            <td class="p-3 text-semibold">{{ item.employee.nip }}</td>
            <td class="p-3 text-semibold">{{ item.employee.nik }}</td>
            <td class="p-3 text-semibold">{{ item.field_name }}</td>
            <td class="p-3 text-semibold">{{ item.old_value }}</td>
            <td class="p-3 text-semibold">{{ item.new_value }}</td>
            <td class="p-3 text-semibold">{{ item.status }}</td>
            <td class="p-3">
            <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                :class="
                item.status === 'disetujui'
                    ? 'bg-green-100 text-green-700'
                    : item.status === 'ditolak'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                ">
                {{ item.status }}
            </span>
            </td>

            <td class="p-3 text-center">
            <button
                @click="router.push(`/verifikasi/edit/${item.id}`)"
                class="bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs">
                VERIFIKASI
            </button>
            </td>
        </tr>
        </tbody>
      </table>
    </div>
    </div>
  </AdminLayout>
</template>