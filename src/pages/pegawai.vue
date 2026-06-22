<script setup>
import adminLayout from "./adminLayout.vue";
import { computed, onMounted, ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Search, Pencil, Trash2, TriangleAlert } from "lucide-vue-next";
import { employeesService } from "../services/pegawai";

const router = useRouter();
const route = useRoute();
const search = ref("");
const currentPage = ref(1);

const { employees, meta, getEmployees, deleteEmployee } = employeesService();

// --- STATE UTK ALERT CUSTOM POP-UP ---
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

onMounted(async () => {
  const page = route.query.page ? Number(route.query.page) : 1;
  currentPage.value = page;

  await getEmployees(currentPage.value);
});

const goPage = async (page) => {
  currentPage.value = page;
  await getEmployees(page, search.value);
};

watch(search, async (newValue) => {
  await getEmployees(1, newValue);
});

const showModal = ref(false);
const selectedPegawai = ref(null);

const simpanPegawai = () => {
    console.log("Tampah pegawai:", {...form});

    router.push("/pegawai");
};

const bukaModalHapus = (item) => {
  selectedPegawai.value = item;
  showModal.value = true;
};

const konfirmasiHapus = async () => {
  try {
    await deleteEmployee(selectedPegawai.value.id);

    showModal.value = false;
    selectedPegawai.value = null;

    await getEmployees(currentPage.value, search.value);
  } catch (error) {
    // Mengganti alert browser default menjadi pop-up alert custom di bagian atas screen
    triggerAlert("Gagal menghapus pegawai!");
  }
};

const tutupModal = () => {
  showModal.value = false;
};

const namaField = (field) => {
  const map = {
    female: "Perempuan",
    male: "Laki-laki"
  };
  return map[field?.toLowerCase()] || field;
};
</script>

<template>
  <adminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded shadow-lg text-[11px] z-[9999] transition-all duration-300">
      {{ customAlert.message }}
    </div>

    <div>
      <h1 class="text-lg font-bold mb-3 text-gray-800">PEGAWAI</h1>

      <div class="flex gap-3 mb-4">
        <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="15"/>
            <input
            v-model="search"
            type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 rounded-md pl-9 pr-3 py-1.5 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"
            />
        </div> 

        <button 
        @click="router.push('/pegawai/tambah')"
        class="bg-blue-900 text-[11px] hover:bg-blue-800 text-white px-5 py-1.5 rounded-md font-semibold transition">
          TAMBAH
        </button>
      </div>
        
      <div class="bg-white rounded-xl shadow-md px-4">
        <div class="px-4 py-2">
          <h4 class="font-bold text-[11px] text-gray-800">DAFTAR PEGAWAI</h4>
        </div>

        <table class="w-full table-dashboard text-[11px] border-b border-gray-200">
          <thead>
            <tr class="bg-blue-200 font-semibold">
              <th class="p-1.5 text-left">NO</th>
              <th class="p-1.5 text-left">NAMA PEGAWAI</th>
              <th class="p-1.5 text-left">NIP</th>
              <th class="p-1.5 text-left">NIK</th>
              <th class="p-1.5 text-left">JENIS KELAMIN</th>
              <th class="p-1.5 text-left">TTL</th>
              <th class="p-1.5 text-left">ALAMAT</th>
              <th class="p-1.5 text-left">NO. HP</th>
              <th class="p-1.5 text-center">AKSI</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in employees" :key="item.id" class="hover:bg-gray-50 border-b border-gray-200">
              <td class="p-1.5 font-semibold">{{ index + 1 }}</td>
              <td class="p-1.5 font-semibold">{{ item.employee_name }}</td>
              <td class="p-1.5 font-semibold">{{ item.nip }}</td>
              <td class="p-1.5 font-semibold">{{ item.nik }}</td>
              <td class="p-1.5 font-semibold">{{ namaField(item.gender) }}</td>
              <td class="p-1.5 font-semibold">{{ item.birth_place }} {{ item.birth_date }}</td>
              <td class="p-1.5 font-semibold">{{ item.address }}</td>
              <td class="p-1.5 font-semibold">{{ item.phone_number }}</td>

              <td class="p-1.5 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button @click="bukaModalHapus(item)" class="text-red-600 hover:text-red-700 bg-gray-200 hover:bg-gray-300 p-1.5 rounded-md">
                    <Trash2 :size="14" />
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
          class="px-2.5 py-0.5 rounded border text-[11px]"
          :class="link.active
            ? 'bg-blue-900 text-white'
            : 'bg-white text-blue-900 hover:bg-blue-100'"
        >
          <span v-html="link.label"></span>
        </button>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white w-[320px] rounded-xl border-2 border-red-400 p-5 text-center shadow-2xl">
        <div class="flex justify-center mb-3">
          <TriangleAlert class="text-red-500" :size="50" stroke-width="2.5" />
        </div>

        <h2 class="text-sm font-bold mb-4">Yakin Ingin Menghapus, <br><span class="text-gray-700">{{ selectedPegawai ? selectedPegawai.employee_name : "" }}</span></h2>

        <div class="flex justify-center gap-2">
          <button @click="konfirmasiHapus" class="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-[11px] transition-colors font-semibold">
            Yakin
          </button>
          <button @click="tutupModal" class="bg-gray-700 hover:bg-gray-800 text-white px-4 py-1.5 rounded-md text-[11px] transition-colors font-semibold">
            Kembali
          </button>
        </div>
      </div>
    </div>

  </adminLayout>
</template>