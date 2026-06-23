<script setup>
import adminLayout from "./adminLayout.vue";
import { useRouter } from "vue-router";
import { reactive, ref, computed, onMounted } from "vue"; 
import { Save, RefreshCw, Trash2, Pencil, TriangleAlert, UserPlus, X } from "lucide-vue-next"; 
import { penjadwalanService } from "../services/penjadwalan";

const router = useRouter();
const { generateSesi, getCourses, getLecturers, getClasses, getProdi, 
  getKelasByProdi, getPengampuByKelas, getJadwal, deleteSesiKelas, meta,
  createPengampu 
} = penjadwalanService();

const courses = ref([]);
// const lecturers = ref([]);
// const classes = ref([]);
const prodiList = ref([]);
const kelasList = ref([]);
const selectedProdi = ref("");
const pengampuList = ref([]);

// State baru untuk modal pop up dosen pengampu
const showSuccessModal = ref(false);
const showModalPengampu = ref(false);
const listDosenRaw = ref([]); // Menampung hasil array dari API pegawai baru
const masterKelasModal = ref([]); 
const loadingPengampu = ref(false);
const formPengampu = reactive({
  dosen_id: "",
  kelas_id: "", 
  mkkode: ""    
});

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

// --- STATE DAN FUNGSI UNTUK ALERT CUSTOM POP-UP DI ATAS ---
const customAlert = ref({
  show: false,
  message: ""
});

const triggerAlert = (msg) => {
  customAlert.value.message = msg;
  customAlert.value.show = true;
  setTimeout(() => {
    customAlert.value.show = false;
  }, 3000);
};

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

    showSuccessModal.value = true;

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
    
    selectedProdi.value = "";
    kelasList.value = [];
    pengampuList.value = [];

    daftarSesi.value = await getJadwal();

  } catch (error) {
    console.log("Error generate:", error.response?.data || error);
    triggerAlert("Gagal generate sesi kelas!");
  }
};

const simpanDosenPengampu = async () => {
  if (!formPengampu.dosen_id || !formPengampu.kelas_id || !formPengampu.mkkode) {
    triggerAlert("Mohon lengkapi semua pilihan data pengampu!");
    return;
  }
  try {
    loadingPengampu.value = true;
    if (typeof createPengampu === "function") {
      await createPengampu({
        dosen_id: formPengampu.dosen_id,
        kelas_id: formPengampu.kelas_id,
        mkkode: formPengampu.mkkode
      });
      showSuccessModal.value = true;
    } 
    
    // Reset form setelah sukses
    formPengampu.dosen_id = "";
    formPengampu.kelas_id = "";
    formPengampu.mkkode = "";
    showModalPengampu.value = false;

    setTimeout(async () => {
      showSuccessModal.value = false;

    }, 2000);


    if (form.class_id) {
      pengampuList.value = await getPengampuByKelas(form.class_id);
    }
  } catch (error) {
    console.error(error);
    triggerAlert("Gagal mendaftarkan dosen pengampu.");
  } finally {
    loadingPengampu.value = false;
  }
};

onMounted(async () => {
  courses.value = await getCourses();
  prodiList.value = await getProdi();
  daftarSesi.value = await getJadwal();
  masterKelasModal.value = await getClasses();
  
  // Memanggil API pegawai baru dan dimasukkan ke listDosenRaw
  listDosenRaw.value = await getLecturers();
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

const goPage = async (page) => {
  currentPage.value = page;
  daftarSesi.value = await getJadwal(page);
};

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
    const uuids = [selectedSesi.value.id]; 
    await deleteSesiKelas(uuids);

    triggerAlert("Sesi kelas berhasil dihapus!");

    daftarSesi.value = await getJadwal();

    showModal.value = false;
    selectedSesi.value = null;
  } catch (error) {
    triggerAlert("Gagal menghapus sesi kelas!");
  }
};

const formatProdi = (text) => {
  if (!text) return "-";

  return text
    .replace(/-/g, " ") // ganti "-" jadi spasi
    .replace(/\b\w/g, (c) => c.toUpperCase()); // kapital tiap kata
};
</script>

<template>
  <adminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-xl text-[11px] z-[9999] transition-all duration-300 font-medium">
      {{ customAlert.message }}
    </div>

    <div class="flex justify-between items-center mb-4">
      <h2 class="text-base font-bold">
        PENJADWALAN SESI PERKULIAHAN
      </h2>

      <button
        @click="showModalPengampu = true"
        type="button"
        class="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px] shadow transition-colors"
      >
        <UserPlus :size="14" />
        Daftarkan Dosen Pengampu
      </button>
    </div>

    <div class="card-dashboard bg-white rounded-xl shadow-md p-4">
      <h2 class="font-bold text-base mb-3">BUAT SESI</h2>

      <form @submit.prevent="buatJadwal" class="grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <label class="block text-[11px] font-semibold mb-1">Mata Kuliah</label>
          <select v-model="form.course_code" @change="pilihMatkul" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]">
            <option value="">Pilih Mata Kuliah</option>
            <option v-for="item in courses" :key="item.id" :value="item.code || item.kode">{{ item.name }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Tanggal Mulai</label>
          <input v-model="form.start_date" type="date" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]"/>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Prodi</label>
          <select v-model="selectedProdi" @change="pilihProdi" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]">
            <option value="">Pilih Prodi</option>
            <option v-for="item in prodiList" :key="item.id" :value="item.name">{{ formatProdi(item.name) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.start_time" type="time" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]"/>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Kelas</label>
          <select v-model="form.class_id" @change="pilihKelas" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]">
            <option value="">Pilih Kelas</option>
            <option v-for="item in kelasList" :key="item.id" :value="item.id">{{ item.class_name || item.name || item.nama_kelas }}</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.end_time" type="time" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]"/>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Dosen Pengampu</label>
          <select v-model="form.pengampu_id" @change="pilihPengampu" class="w-full border rounded-lg px-2.5 py-1.5 text-[11px]">
            <option value="">Pilih Dosen</option>
            <option v-for="item in pengampuList" :key="item.pengampu_id" :value="item.pengampu_id">{{ item.dosen && item.dosen.name ? item.dosen.name : "Nama dosen tidak ada" }}</option>
          </select>
        </div>

        <div class="flex justify-end gap-3 items-end">
          <button type="button" class="flex h-[32px] items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white px-4 py-1.5 rounded-lg font-semibold text-[11px]">
            Batal
          </button>

          <button type="submit" class="flex h-[32px] items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg font-semibold text-[11px]">
            <Save :size="14" />
            Simpan
          </button>
        </div>
      </form>
    </div>

    <div class="card-dashboard bg-white rounded-xl shadow-md p-4 mt-4">
      <h2 class="text-base font-bold mb-3">DAFTAR SESI</h2>

      <div class="flex flex-wrap gap-2 mb-3 text-[11px]">
        <input
          v-model="searchSesi"
          type="text"
          placeholder="Cari mata kuliah, kelas, atau dosen..."
          class="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-[11px]"
        />

        <select v-model="filterMataKuliah" class="border rounded-lg px-3 py-1.5 w-44 text-white bg-blue-900">
          <option value="">Semua Mata Kuliah</option>
          <option value="Pemrograman Web">Pemrograman Web</option>
        </select>

        <select v-model="filterKelas" class="border rounded-lg px-3 py-1.5 w-36 text-white bg-blue-900">
          <option value="">Semua Kelas</option>
          <option value="TI-4A">TI-4A</option>
        </select>

        <input
          v-model="filterTanggal"
          type="date"
          class="border rounded-lg px-3 py-1.5 text-white bg-blue-900 items-white"
        />
      </div>

      <table class="table-dashboard w-full text-[11px]">
        <thead>
          <tr class="bg-blue-200 text-left">
            <th class="p-2">NO</th>
            <th class="p-2">MATA KULIAH</th>
            <th class="p-2">KELAS</th>
            <th class="p-2">DOSEN</th>
            <th class="p-2">PERTEMUAN</th>
            <th class="p-2">TANGGAL</th>
            <th class="p-2">JAM</th>
            <th class="p-2">STATUS</th>
            <th class="p-2 text-center">AKSI</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(item, index) in filteredSesi" :key="item.id" class="hover:bg-gray-50 border-b border-gray-200">
            <td class="p-2 font-semibold">{{ index + 1 }}</td>
            <td class="p-2 font-semibold">{{ item.course_name }}</td>
            <td class="p-2 font-semibold">{{ item.class_name }}</td>
            <td class="p-2 font-semibold">{{ item.lecturer.employee_name || '-' }}</td>
            <td class="p-2 font-semibold">PERTEMUAN {{ item.session_number }}</td>
            <td class="p-2 font-semibold">{{ item.session_date }}</td>
            <td class="p-2 font-semibold">{{ item.start_time }} - {{ item.end_time }}</td>

            <td class="p-2">
              <span 
                v-if="item.status === 'opened' || item.status === 'open'"
                class="w-[85px] inline-block text-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-yellow-500 text-white"
              >
                Berjalan
              </span>
              <span 
                v-else-if="(item.status === 'closed' || item.status === 'close') && item.topic && item.topic !== '' && item.topic !== '-'"
                class="w-[85px] inline-block text-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-green-600 text-white"
              >
                Selesai
              </span>
              <span 
                v-else
                class="w-[85px] inline-block text-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-900 text-white"
              >
                Terjadwal
              </span>
            </td>

            <td class="p-2">
              <div class="flex justify-center gap-2">
                <button @click="bukaModalHapus(item)" class="bg-gray-200 hover:bg-gray-300 p-1.5 rounded-lg">
                  <Trash2 class="text-red-500" :size="14" />
                </button>

                <button @click="router.push(`/penjadwalan/edit/${item.id}`)" class="bg-gray-200 hover:bg-gray-300 p-1.5 rounded-lg">
                  <Pencil class="text-yellow-500" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="meta" class="flex justify-center gap-1.5 mt-3">
        <button
          v-for="link in meta.links"
          :key="link.label"
          :disabled="!link.url"
          @click="link.page && goPage(link.page)"
          class="px-2 py-0.5 rounded border text-[11px]"
          :class="link.active
            ? 'bg-blue-900 text-white'
            : 'bg-white text-blue-900 hover:bg-blue-100'"
        >
          <span v-html="link.label"></span>
        </button>
    </div>

    <div v-if="showModalPengampu" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div class="bg-blue-900 text-white px-4 py-3 flex justify-between items-center">
          <h4 class="font-bold text-xs flex items-center gap-1.5 text-[11px]">
            <UserPlus :size="14" /> Daftarkan Dosen Pengampu
          </h4>
          <button @click="showModalPengampu = false" class="hover:bg-blue-800 p-1 rounded-lg text-white">
            <X :size="16" />
          </button>
        </div>

        <form @submit.prevent="simpanDosenPengampu" class="p-4 space-y-3 text-[11px]">
          <div>
            <label class="block text-[10px] font-bold text-gray-600 mb-1">PILIH DOSEN</label>
            <select v-model="formPengampu.dosen_id" class="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none">
              <option value="">-- Silahkan Pilih Dosen --</option>
              <option v-for="dsn in listDosenRaw" :key="dsn.id" :value="dsn.id">
                {{ dsn.employee_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-600 mb-1">PILIH MATA KULIAH</label>
            <select v-model="formPengampu.mkkode" class="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none">
              <option value="">-- Silahkan Pilih Mata Kuliah --</option>
              <option v-for="crs in courses" :key="crs.id" :value="crs.code || crs.kode">
                {{ crs.name }} ({{ crs.code || crs.kode }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-600 mb-1">PILIH KELAS</label>
            <select v-model="formPengampu.kelas_id" class="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none">
              <option value="">-- Silahkan Pilih Kelas --</option>
              <option v-for="kls in masterKelasModal" :key="kls.id" :value="kls.id">
                {{ kls.class_name || kls.name || kls.nama_kelas }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-2 pt-2.5 border-t mt-4">
            <button @click="showModalPengampu = false" type="button" class="bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg font-semibold text-[11px]">
              Batal
            </button>
            <button :disabled="loadingPengampu" type="submit" class="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg font-semibold text-[11px] disabled:bg-gray-400">
              {{ loadingPengampu ? "Memproses..." : "Simpan" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white w-[340px] rounded-xl border-2 border-red-400 p-6 text-center shadow-2xl">
        <div class="flex justify-center mb-4">
          <TriangleAlert class="text-red-500" :size="48" stroke-width="2.5" />
        </div>

        <h2 class="text-base font-bold mb-4">Yakin Ingin Menghapus, <br>Jadwal Sesi ini</h2>

        <div class="flex justify-center gap-3">
          <button @click="konfirmasiHapus(selectedSesi)" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs transition-colors">
            Yakin
          </button>
          <button @click="tutupModal" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-xs transition-colors">
            Kembali
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[260px] rounded-xl shadow-lg p-5 text-center animate-fadeIn">
        <div class="mx-auto w-[64px] h-[64px] flex items-center justify-center rounded-full border-4 border-green-500 mb-3">
          <svg
            class="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 class="text-sm font-semibold text-gray-700">
          Data berhasil disimpan
        </h2>
      </div>
    </div>
  </adminLayout>
</template>