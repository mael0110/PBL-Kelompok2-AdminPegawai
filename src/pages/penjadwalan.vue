<script setup>
import adminLayout from "./adminLayout.vue";
import { useRouter } from "vue-router";
import { reactive, ref, computed, onMounted } from "vue"; 
import { Save, RefreshCw, Trash2, Pencil, TriangleAlert } from "lucide-vue-next";
import { penjadwalanService } from "../services/penjadwalan";

const router = useRouter();
const { generateSesi } = penjadwalanService();

// Perbaikan: Deklarasikan state filter yang kurang agar tidak undefined
const searchSesi = ref("");
const filterMataKuliah = ref("");
const filterKelas = ref("");
const filterTanggal = ref("");

const form = reactive({
  pengampu_id: "",
  lecturer_id: "",
  class_id: "",
  class_name: "",
  course_code: "",
  course_name: "",
  start_date: "",
  start_time: "",
  end_time: "",
});

const pilihMatkul = () => {
  const selected = courses.value.find(
    (item) => item.course_code === form.course_code
  );

  if (selected) {
    form.course_name = selected.course_name;
  }
};

const pilihKelas = () => {
  const selected = classes.value.find(
    (item) => item.id === form.class_id
  );

  if (selected) {
    form.class_name = selected.class_name;
  }
};

const buatJadwal = async () => {
  try {
    await generateSesi({
      pengampu_id: form.pengampu_id,
      lecturer_id: form.lecturer_id,
      class_id: form.class_id,
      class_name: form.class_name,
      course_code: form.course_code,
      course_name: form.course_name,
      start_date: form.start_date,
      start_time: form.start_time,
      end_time: form.end_time,
    });

    alert("Berhasil generate 16 sesi kelas!");
  } catch (error) {
    alert("Gagal generate sesi kelas!");
  }
};

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

// Perbaikan: Tambahkan fungsi simpanJadwal agar tidak crash saat form di-submit
const simpanJadwal = () => {
  console.log("Data disimpan:", form);
};

const refreshData = () => {
  searchSesi.value = "";
  filterMataKuliah.value = "";
  filterKelas.value = "";
  filterTanggal.value = "";
};


const showModal = ref(false);
const selectedSesi = ref(null);

const bukaModalHapus = (item) => {
  selectedSesi.value = item;
  showModal.value = true;
};

const tutupModal = () => {
  showModal.value = false;
  selectedSesi.value = null;
};

const konfirmasiHapus = () => {
  console.log("Hapus sesi:", selectedSesi.value);

  // nanti kalau sudah ada API delete, panggil di sini

  showModal.value = false;
  selectedSesi.value = null;
};
</script>

<template>
  <adminLayout>
    <h2 class="text-2xl font-bold mb-6">
      PENJADWALAN SESI PERKULIAHAN
    </h2>

    <div class="card-dashboard bg-white rounded-xl shadow-md p-5">
      <h2 class="font-bold text-xl mb-4">BUAT SESI</h2>

      <form @submit.prevent="buatJadwal" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1">Mata Kuliah</label>
          <select v-model="form.course_code" @change="pilihMatkul" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Mata Kuliah</option>
            <option v-for="item in courses" :key="item.id" :value="item.course_code">{{ item.course_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Tanggal Mulai</label>
          <input v-model="form.start_date" type="date" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Kelas</label>
          <select v-model="form.class_id" @change="pilihKelas" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Kelas</option>
            <option v-for="item in classes" :key="item.id" :value="item.id">{{ item.class_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.start_time" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Dosen Pengampu</label>
          <select v-model="form.lecturer_id" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Dosen</option>
            <option v-for="item in lecturers" :key="item.id" :value="item.id">{{ item.employee_name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.end_time" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div class="flex items-right gap-2 col-span-2 justify-end">
          <button type="submit" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
            <Save :size="18" />
            Buat Jadwal
          </button>
        </div>
      </form>
    </div>

    <div class="card-dashboard bg-white rounded-xl shadow-md p-5 mt-6">
      <h2 class="text-xl font-bold mb-4">DAFTAR SESI</h2>

      <div class="flex flex-wrap gap-3 mb-4"> <!-- Wrapper opsional untuk merapikan layout baris input filter -->
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
      </div>

      <!-- TABLE -->
      <table class="table-dashboard w-full text-sm">
        <thead>
          <tr class="bg-blue-200 text-left">
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
          <!-- Perbaikan: Mengubah data di dalam row agar dinamis sesuai item dari v-for -->
          <tr v-for="(item, index) in filteredSesi" :key="item.id" class="hover:bg-gray-50 border-b border-gray-200">
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ item.pertemuan }}</td>
            <td class="p-3">{{ item.tanggal }}</td>
            <td class="p-3">{{ item.hari }}</td>
            <td class="p-3">{{ item.jam }}</td>

            <td class="p-3">
              <span class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold"
              :class="
                item.status === 'Terjadwal'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              ">
                {{ item.status }}
              </span>
            </td>

            <td class="p-3">
              <div class="flex justify-center gap-3">
                <button @click="bukaModalHapus(item)" class="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
                  <Trash2 class="text-red-500" :size="18" />
                </button>

                <button @click="router.push(`/penjadwalan/edit/${item.id}`)" class="bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
                  <Pencil class="text-yellow-500" :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white w-[420px] rounded-xl border-2 border-red-400 p-8 text-center shadow-2xl">
        <div class="flex justify-center mb-5">
          <TriangleAlert class="text-red-500" :size="80" stroke-width="2.5" />
        </div>

        <h2 class="text-2xl font-bold mb-6">Yakin Ingin Menghapus, <br>{{  selectedSesi ? selectedSesi.pertemuan : ""  }}</h2>

        <div class="flex justify-center gap-3">
          <button @click="konfirmasiHapus" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm transition-colors">
            Yakin
          </button>
          <button @click="tutupModal" class="bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm transition-colors">
            Kembali
          </button>
        </div>
      </div>
    </div>
  </adminLayout>
</template>