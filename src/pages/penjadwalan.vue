<script setup>
import adminLayout from "./adminLayout.vue";
import { reactive, ref } from "vue";
import { Save, RefreshCw, Trash2, Pencil } from "lucide-vue-next";
import { computed } from "vue";

const form = reactive({
  mata_kuliah: "",
  kelas: "",
  dosen: "",
  tanggal_mulai: "",
  jam_mulai: "",
  jam_selesai: "",
  jumlah_pertemuan: 16,
});

const daftarSesi = ref([
  {
    id: 1,
    mata_kuliah: "Pemrograman Web",
    kelas: "TI-4A",
    dosen: "Pak Budi",
    pertemuan: "PERTEMUAN 1",
    tanggal: "2025-02-12",
    hari: "Selasa",
    jam: "08:13 - 13:30",
    status: "Terjadwal",
  },
]);

const filteredSesi = computed(() => {
  return daftarSesi.value.filter((item) => {
    const keyword = searchSesi.value.toLowerCase();

    const cocokSearch =
      item.mata_kuliah.toLowerCase().includes(keyword) ||
      item.kelas.toLowerCase().includes(keyword) ||
      item.dosen.toLowerCase().includes(keyword);

    const cocokMatkul =
      filterMataKuliah.value === "" ||
      item.mata_kuliah === filterMataKuliah.value;

    const cocokKelas =
      filterKelas.value === "" ||
      item.kelas === filterKelas.value;

    const cocokTanggal =
      filterTanggal.value === "" ||
      item.tanggal === filterTanggal.value;

    return cocokSearch && cocokMatkul && cocokKelas && cocokTanggal;
  });
});

const refreshData = () => {
  searchSesi.value = "";
  filterMataKuliah.value = "";
  filterKelas.value = "";
  filterTanggal.value = "";
};
</script>

<template>
  <adminLayout>
    <h2 class="text-2xl font-bold mb-6">
      PENJADWALAN SESI PERKULIAHAN
    </h2>

    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="font-bold text-xl mb-4">BUAT SESI</h2>

      <form @submit.prevent="simpanJadwal" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Mata Kuliah</label>
          <select v-model="form.mata_kuliah" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Mata Kuliah</option>
            <option value="Pemrograman Web">Pemrograman Web</option>
            <option value="Basis Data">Basis Data</option>
            <option value="PBO">PBO</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Tanggal Mulai</label>
          <input v-model="form.tanggal_mulai" type="date" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Kelas</label>
          <select v-model="form.kelas" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Kelas</option>
            <option value="TI-4A">TI-4A</option>
            <option value="TI-4B">TI-4B</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.jam_mulai" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Dosen Pengampu</label>
          <select v-model="form.dosen" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Dosen</option>
            <option value="Wade Cooper">Wade Cooper</option>
            <option value="Arlene Mccoy">Arlene Mccoy</option>
            <option value="Devon Webb">Devon Webb</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.jam_selesai" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div class="flex items-right gap-2 col-span-2 justify-end">
          <button type="submit" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
            <Save :size="18" />
            Buat Jadwal
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-xl shadow-md p-5 mt-6">
    <h2 class="text-2xl font-bold mb-4">DAFTAR SESI</h2>

    <input
  v-model="searchSesi"
  type="text"
  placeholder="Cari mata kuliah, kelas, atau dosen..."
  class="flex-1 border rounded-lg px-4 py-2"
/>

<select v-model="filterMataKuliah" class="border rounded-lg px-4 py-2 w-52">
  <option value="">Semua Mata Kuliah</option>
  <option value="Pemrograman Web">Pemrograman Web</option>
</select>

<select v-model="filterKelas" class="border rounded-lg px-4 py-2 w-40">
  <option value="">Semua Kelas</option>
  <option value="TI-4A">TI-4A</option>
</select>

<input
  v-model="filterTanggal"
  type="date"
  class="border rounded-lg px-4 py-2"
/>

<button
  @click="refreshData"
  type="button"
  class="flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-100"
>
  <RefreshCw :size="16" />
  Refresh
</button>

    <!-- TABLE -->
    <table class="w-full text-sm">
      <thead>
        <tr v-for="item in filteredSesi" :key="item.id">
          <th class="p-3">NO</th>
          <th class="p-3">PERTEMUAN</th>
          <th class="p-3">TANGGAL</th>
          <th class="p-3">HARI</th>
          <th class="p-3">JAM</th>
          <th class="p-3">STATUS</th>
          <th class="p-3 text-center">AKSI</th>
        </tr>
      </thead>

      <tbody>
        <tr class="border-t">
          <td class="p-3">1</td>
          <td class="p-3">PERTEMUAN 1</td>
          <td class="p-3">12 Feb 2025</td>
          <td class="p-3">Selasa</td>
          <td class="p-3">08:13 - 13:30</td>

          <td class="p-3">
            <span
              class="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-semibold"
            >
              Terjadwal
            </span>
          </td>

          <td class="p-3">
            <div class="flex justify-center gap-3">
              <button
                class="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
              >
                <Trash2 class="text-red-500" :size="18" />
              </button>

              <button
                class="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
              >
                <Pencil class="text-yellow-500" :size="18" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </adminLayout>
</template>