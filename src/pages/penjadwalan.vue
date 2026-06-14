<script setup>
import adminLayout from "./adminLayout.vue";
import { useRouter } from "vue-router";
import { reactive, ref, computed, onMounted } from "vue"; 
import { Save, RefreshCw, Trash2, Pencil, TriangleAlert } from "lucide-vue-next";
import { penjadwalanService } from "../services/penjadwalan";

const router = useRouter();
const { generateSesi, getCourses, getLecturers, getClasses, getProdi, 
  getKelasByProdi, getPengampuByKelas, getJadwal, deleteSesiKelas, meta } = penjadwalanService();
const courses = ref([]);
// const lecturers = ref([]);
// const classes = ref([]);
const prodiList = ref([]);
const kelasList = ref([]);
const selectedProdi = ref("");
const pengampuList = ref([]);

const searchSesi = ref("");
const filterMataKuliah = ref("");
const filterKelas = ref("");
const filterTanggal = ref("");

const form = reactive({
  pengampu_id: "",
  lecturer_id: "",
  class_id: "",
  class_name: "",
  topic: "",
  course_code: "",
  course_name: "",
  start_date: "",
  start_time: "",
  end_time: "",
});

const buatJadwal = async () => {
  try {
    const payload = {
      pengampu_id: form.pengampu_id,
      lecturer_id: form.lecturer_id,
      class_id: form.class_id,
      class_name: form.class_name,
      topic: form.topic,
      course_code: form.course_code,
      course_name: form.course_name,
      start_date: form.start_date,
      start_time: form.start_time,
      end_time: form.end_time,
    };

    console.log("Payload generate sesi:", payload);

    await generateSesi(payload);

    alert("Berhasil generate 16 sesi kelas!");

    // ==========================================
    // FIX: RESET FORMULIR SETELAH BERHASIL
    // ==========================================
    form.pengampu_id = "";
    form.lecturer_id = "";
    form.class_id = "";
    form.class_name = "";
    form.topic = "";
    form.course_code = "";
    form.course_name = "";
    form.start_date = "";
    form.start_time = "";
    form.end_time = "";
    
    // Kosongkan state penampung relasi dropdown prodi & list kelas/dosen
    selectedProdi.value = "";
    kelasList.value = [];
    pengampuList.value = [];

    // Muat ulang daftar sesi di bawah agar langsung ter-update otomatis
    daftarSesi.value = await getJadwal();

  } catch (error) {
    console.log("Error generate:", error.response?.data || error);
    alert("Gagal generate sesi kelas!");
  }
};

onMounted(async () => {
  courses.value = await getCourses();
  prodiList.value = await getProdi();
  daftarSesi.value = await getJadwal();
         
});

const pilihMatkul = () => {
  console.log("course_code dipilih:", form.course_code);

  console.log("semua courses:", courses.value);

  const selected = courses.value.find(
    (item) =>
      String(item.kode || item.code) === String(form.course_code)
  );

  console.log("selected matkul:", selected);

  if (selected) {
    form.course_code = selected.kode || selected.code;
    form.course_name = selected.name;
  }
};

const pilihKelas = async () => {
  const selected = kelasList.value.find(
    (item) => String(item.id) === String(form.class_id)
  );

  if (selected) {
    form.class_name =
      selected.class_name || selected.name || selected.nama_kelas || "";
  }

  form.lecturer_id = "";
  pengampuList.value = [];

  if (!form.class_id) return;

  pengampuList.value = await getPengampuByKelas(form.class_id);
};

const pilihProdi = async () => {
  form.class_id = "";
  form.class_name = "";
  kelasList.value = [];

  if (!selectedProdi.value) return;

  kelasList.value = await getKelasByProdi(selectedProdi.value);
};

const pilihPengampu = () => {
  const selected = pengampuList.value.find(
    (item) => String(item.pengampu_id) === String(form.pengampu_id)
  );

  form.lecturer_id = selected?.dosen?.id || "";
};

const daftarSesi = ref([]);

const filteredSesi = computed(() => {
  return daftarSesi.value.filter((item) => {
    const keyword = searchSesi.value.toLowerCase();

    const mataKuliah = item.course_name || "";
    const kelas = item.class_name || "";
    const dosen = item.lecturer?.employee_name || "";

    const cocokSearch =
      mataKuliah.toLowerCase().includes(keyword) ||
      kelas.toLowerCase().includes(keyword) ||
      dosen.toLowerCase().includes(keyword);

    const cocokMatkul =
      filterMataKuliah.value === "" ||
      mataKuliah === filterMataKuliah.value;

    const cocokKelas =
      filterKelas.value === "" ||
      kelas === filterKelas.value;

    const cocokTanggal =
      filterTanggal.value === "" ||
      item.session_date === filterTanggal.value;

    return cocokSearch && cocokMatkul && cocokKelas && cocokTanggal;
  });
});

const currentPage = ref(1);

// Saat user klik tombol pagination
const goPage = async (page) => {
  currentPage.value = page;
  daftarSesi.value = await getJadwal(page);
};

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

const konfirmasiHapus = async () => {
  if (!selectedSesi.value) return;

  try {
    const uuids = [selectedSesi.value.id]; // array, bisa multiple jika bulk
    await deleteSesiKelas(uuids);

    alert("Sesi kelas berhasil dihapus!");

    // Refresh daftar sesi
    daftarSesi.value = await getJadwal();

    showModal.value = false;
    selectedSesi.value = null;
  } catch (error) {
    alert("Gagal menghapus sesi kelas!");
  }
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
            <option v-for="item in courses" :key="item.id" :value="item.code || item.kode">{{ item.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Tanggal Mulai</label>
          <input v-model="form.start_date" type="date" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Prodi</label>
          <select v-model="selectedProdi" @change="pilihProdi" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Prodi</option>
            <option v-for="item in prodiList" :key="item.id" :value="item.name">{{ item.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.start_time" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Kelas</label>
          <select v-model="form.class_id" @change="pilihKelas" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Kelas</option>
            <option v-for="item in kelasList" :key="item.id" :value="item.id">{{ item.class_name || item.name || item.nama_kelas }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.end_time" type="time" class="w-full border rounded-lg px-3 py-2"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Dosen Pengampu</label>
          <select v-model="form.pengampu_id" @change="pilihPengampu" class="w-full border rounded-lg px-3 py-2">
            <option value="">Pilih Dosen</option>
            <option v-for="item in pengampuList" :key="item.pengampu_id" :value="item.pengampu_id">{{ item.dosen && item.dosen.name ? item.dosen.name : "Nama dosen tidak ada" }}</option>
          </select>
        </div>

        <div class="flex justify-end gap-4">
          <button type="submit" class="flex h-[40px] items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold">
            <Save :size="18" />
            Buat Jadwal
          </button>
        </div>
      </form>
    </div>
    <div class="card-dashboard bg-white rounded-xl shadow-md p-5 mt-6">
      <h2 class="text-xl font-bold mb-4">DAFTAR SESI</h2>

      <div class="flex flex-wrap gap-3 mb-4">
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

      <table class="table-dashboard w-full text-sm">
        <thead>
          <tr class="bg-blue-200 text-left">
            <th class="p-3">NO</th>
            <th class="p-3">MATA KULIAH</th>
            <th class="p-3">KELAS</th>
            <th class="p-3">DOSEN</th>
            <th class="p-3">PERTEMUAN</th>
            <th class="p-3">TANGGAL</th>
            <th class="p-3">JAM</th>
            <th class="p-3">STATUS</th>
            <th class="p-3 text-center">AKSI</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in filteredSesi" :key="item.id" class="hover:bg-gray-50 border-b border-gray-200">
            <td class="p-3 font-semibold">{{ index + 1 }}</td>
            <td class="p-3 font-semibold">{{ item.course_name }}</td>
            <td class="p-3 font-semibold">{{ item.class_name }}</td>
            <td class="p-3 font-semibold">{{ item.lecturer.employee_name || '-' }}</td>
            <td class="p-3 font-semibold">PERTEMUAN {{ item.session_number }}</td>
            <td class="p-3 font-semibold">{{ item.session_date }}</td>
            <td class="p-3 font-semibold">{{ item.start_time }} - {{ item.end_time }}</td>

            <td class="p-3">
              <span class="w-[110px] inline-block text-center px-4 py-2 rounded-lg text-[12px] font-semibold"
              :class="
                item.status === 'open'
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

    <div v-if="meta" class="flex justify-center gap-2 mt-4">
        <button
          v-for="link in meta.links"
          :key="link.label"
          :disabled="!link.url"
          @click="link.page && goPage(link.page)"
          class="px-3 py-1 rounded border text-sm"
          :class="link.active
            ? 'bg-blue-900 text-white'
            : 'bg-white text-blue-900 hover:bg-blue-100'"
        >
          <span v-html="link.label"></span>
        </button>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white w-[420px] rounded-xl border-2 border-red-400 p-8 text-center shadow-2xl">
        <div class="flex justify-center mb-5">
          <TriangleAlert class="text-red-500" :size="80" stroke-width="2.5" />
        </div>

        <h2 class="text-2xl font-bold mb-6">Yakin Ingin Menghapus, <br>{{  selectedSesi ? selectedSesi.pertemuan : ""  }}</h2>

        <div class="flex justify-center gap-3">
          <button @click="konfirmasiHapus(item)" class="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm transition-colors">
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

<style scoped>
/* Styling opsional jika dibutuhkan tetap aman */
</style>