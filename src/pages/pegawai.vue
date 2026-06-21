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
    alert("Gagal menghapus pegawai!");
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
    <div>
      <h1 class="text-2xl font-bold mb-4">PEGAWAI</h1>

      <div class="flex gap-4 mb-6">
        <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" :size="18"/>
            <input
            v-model="search"
            type="text"
            placeholder="Cari pegawai berdasarkan nama, NIP, atau NIK"
            class="w-full border border-blue-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-200"
            />
        </div> 

        <button 
        @click="router.push('/pegawai/tambah')"
        class="bg-blue-900 text-sm hover:bg-blue-800 text-white px-8 py-2 rounded-lg font-semibold transition">
          TAMBAH
        </button>
        </div>
        
        <div class="bg-white rounded-xl shadow-md px-5">
        <div class="px-5 py-3">
          <h4 class="font-bold text-xl">DAFTAR PEGAWAI</h4>
        </div>

        <table class="w-full table-dashboard text-sm border-b border-gray-200">
          <thead>
            <tr class="bg-blue-200 font-semibold">
              <th class="p-2 text-left">NO</th>
              <th class="p-2 text-left">NAMA PEGAWAI</th>
              <th class="p-2 text-left">NIP</th>
              <th class="p-2 text-left">NIK</th>
              <th class="p-2 text-left">JENIS KELAMIN</th>
              <th class="p-2 text-left">TTL</th>
              <th class="p-2 text-left">ALAMAT</th>
              <th class="p-2 text-left">NO. HP</th>
              <th class="p-2 text-center">AKSI</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in employees" :key="item.id" class="hover:bg-gray-50 border-b border-gray-200">
              <td class="p-2 font-semibold">{{ index + 1 }}</td>
              <td class="p-2 font-semibold">{{ item.employee_name }}</td>
              <td class="p-2 font-semibold">{{ item.nip }}</td>
              <td class="p-2 font-semibold">{{ item.nik }}</td>
              <td class="p-2 font-semibold">{{ namaField(item.gender) }}</td>
              <td class="p-2 font-semibold">{{ item.birth_place }} {{ item.birth_date }}</td>
              <td class="p-2 font-semibold">{{ item.address }}</td>
              <td class="p-2 font-semibold">{{ item.phone_number }}</td>

              <td class="p-2 text-center">
                <div class="flex items-center justify-center gap-2">
                  <!-- <button @click="router.push(`/pegawai/edit/${item.id}`)" class="text-yellow-600 hover:text-yellow-700">
                    <Pencil :size="16" />
                  </button> -->

                  <button @click="bukaModalHapus(item)" class="text-red-600 hover:text-red-700 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg">
                    <Trash2 :size="16" />
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
          @click="link.page &&  goPage(link.page)"
          class="px-3 py-1 rounded border text-sm"
          :class="link.active
            ? 'bg-blue-900 text-white'
            : 'bg-white text-blue-900 hover:bg-blue-100'"
        >
          <span v-html="link.label"></span>
        </button>
        </div>
      </div>

    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white w-[420px] rounded-xl border-2 border-red-400 p-8 text-center shadow-2xl">
        <div class="flex justify-center mb-5">
          <TriangleAlert class="text-red-500" :size="80" stroke-width="2.5" />
        </div>

        <h2 class="text-2xl font-bold mb-6">Yakin Ingin Menghapus, <br>{{ selectedPegawai ? selectedPegawai.employee_name : "" }}</h2>

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