<script setup>
import AdminLayout from "./adminLayout.vue";
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { verifikasiService } from "../services/verifikasi";
import { Search, Filter, CalendarDays } from "lucide-vue-next";

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
      item.employee?.employee_name?.toLowerCase().includes(keyword) ||
      item.employee?.nip?.toLowerCase().includes(keyword);

    const cocokStatus =
      filterStatus.value === "" || item.status === filterStatus.value;

    const cocokTanggal =
      filterTanggal.value === "" || item.request_date === filterTanggal.value;

    return cocokSearch && cocokStatus && cocokTanggal;
  });
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
  <AdminLayout>
    <div>
      <h1 class="text-2xl font-bold mb-4">VERIFIKASI</h1>

      <div class="flex gap-4 mb-6 ">
        <div class="relative flex-1 text-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="16"/>
          <input v-model="search" type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
        </div> 

        <div class="relative">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 text-white" :size="16"/>
        <select
          v-model="filterStatus"
          class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 pr-8 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200">
          <option value="">Filter Status</option>
          <option value="approved">Disetujui</option>
          <option value="pending">Menunggu</option>
          <option value="rejected">Ditolak</option>
        </select>
        </div>

        <div class="relative">
        <input
          v-model="filterTanggal"
          type="date"
          class="bg-blue-900 border border-blue-900 text-sm text-white pl-10 py-2 rounded-lg appearance-none [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"/>
      </div>
      </div>

    <div class="bg-white rounded-xl shadow-md px-5">
      <div class="px-5 py-3">
          <h4 class="font-bold text-xl">DAFTAR VERIFIKASI</h4>
      </div>
      <table class="w-full table-dashboard text-sm border-b border-gray-200">
        <thead>
        <tr class="bg-blue-200 font-semibold">
            <th class="p-2 text-left">NO</th>
            <th class="p-2 text-left">NAMA PEGAWAI</th>
            <th class="p-2 text-left">NIP</th>
            <th class="p-2 text-left">NIK</th>
            <!-- <th class="p-2 text-left">TANGGAL PENGAJUAN</th> -->
            <th class="p-2 text-left">STATUS</th>
            <th class="p-2 text-center">AKSI</th>
        </tr>
        </thead>

        <tbody>
        <tr
            v-for="(item, index) in filteredVerifikasi"
            :key="item.id"
            class="hover:bg-gray-50 border-b border-gray-200">
            <td class="p-2 font-semibold">{{ index + 1 }}</td>
            <td class="p-2 font-semibold">{{ item.employee.employee_name }}</td>
            <td class="p-2 font-semibold">{{ item.employee.nip }}</td>
            <td class="p-2 font-semibold">{{ item.employee.nik }}</td>
            <!-- <td class="p-2 font-semibold">{{ item.field_name }}</td> -->
            <!-- <td class="p-2 font-semibold">{{ item.old_value }}</td>
            <td class="p-2 font-semibold">{{ item.new_value }}</td> -->
            <td class="p-2 font-semibold text-left">
              <span
                  class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold"
                  :class="{
                    'bg-[#22C55E]': item.status === 'approved',
                    'bg-[#EF4444]': item.status === 'rejected',
                    'bg-[#FACC15]': item.status === 'pending'
                  }">
                  {{ namaField(item.status) }}
              </span>
            </td>

            <td class="p-3 text-center">
            <button
                @click="router.push(`/verifikasi/edit/${item.id}`)"
                class="w-[90px] inline-block text-center bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs">
                VERIFIKASI
            </button>
            </td>
        </tr>
        </tbody>
      </table>
    </div>

      <div v-if="meta" class="flex justify-center gap-2 mt-4">
        <button
          v-for="link in meta.links"
          :key="link.label"
          :disabled="!link.url"
          @click="link.page && getVerifikasi(link.page)"
          class="px-3 py-1 rounded border text-sm"
          :class="link.active
            ? 'bg-blue-900 text-white'
            : 'bg-white text-blue-900 hover:bg-blue-100'"
        >
          <span v-html="link.label"></span>
        </button>
        </div>
    </div>
  </AdminLayout>
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