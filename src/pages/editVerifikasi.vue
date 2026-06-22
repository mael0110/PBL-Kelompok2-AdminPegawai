<script setup>
import adminLayout from "./adminLayout.vue";
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Save } from "lucide-vue-next";
import { verifikasiService } from "../services/verifikasi";

const router = useRouter();
const route = useRoute();
const { updateVerifikasi, getVerifikasiById, getVerifikasi } = verifikasiService();

const currentPage = ref(route.query.page ? Number(route.query.page) : 1);
const status = ref("approved");

const form = reactive({
  employee_name: "",
  nip: "",
  nik: "",
  field_name: "",
  old_value: "",
  new_value: "",
  status: "",
});

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
  const id = route.params.id;
  const data = await getVerifikasiById(id);

  if (data) {
    form.employee_name = data.employee?.employee_name || "";
    form.nip = data.employee?.nip || "";
    form.nik = data.employee?.nik || "";
    form.field_name = data.field_name || "";
    form.old_value = data.old_value || "";
    form.new_value = data.new_value || "";
    form.status = data.status || "";
    status.value = data.status || "pending";
  }
});

const showSuccessModal = ref(false);
const simpanVerifikasi = async () => {
  try {
    const id = route.params.id;
    await updateVerifikasi(id, form.status);

    showSuccessModal.value = true;
    // reload data current page supaya tetap di page itu
    await getVerifikasi(currentPage.value);

    router.push({ path: "/verifikasi", query: { page: currentPage.value } });
  } catch (error) {
    // Mengganti alert bawaan browser menjadi custom alert pop-up atas
    triggerAlert("Gagal mengubah status!");
  }
};

setTimeout(async () => {
  showSuccessModal.value = false;
}, 2000);

const batal = () => {
  // await getVerifikasi(currentPage.value);
  router.push({ path: "/verifikasi", query: { page: currentPage.value } });
};
</script>

<template>
  <adminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded shadow-lg text-[11px] z-[9999] transition-all duration-300">
      {{ customAlert.message }}
    </div>

    <p class="text-[11px] mb-1.5 text-gray-500">
      <RouterLink :to="{ path: '/verifikasi', query: { page: currentPage.value } }" class="hover:underline">
        Verifikasi
      </RouterLink>
      <span class="mx-1 text-gray-400">&gt;</span> Edit Verifikasi
    </p>

    <h1 class="text-lg font-bold mb-4 text-gray-800">EDIT VERIFIKASI</h1>

    <div class="space-y-3">
      <div class="card-dashboard bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <div class="bg-blue-200 px-4 py-1.5 font-bold text-[11px] text-blue-950">DATA PEGAWAI</div>
        <div class="p-3 grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">Nama</label>
            <input v-model="form.employee_name" type="text" disabled class="w-full border rounded-md px-2.5 py-1.5 text-[11px] bg-gray-50 outline-none"/>
          </div>
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">NIP</label>
            <input v-model="form.nip" type="text" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] bg-gray-50 outline-none"/>
          </div>
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">NIK</label>
            <input v-model="form.nik" type="text" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] bg-gray-50 outline-none"/>
          </div>
        </div>
      </div>

      <div class="card-dashboard bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
        <div class="bg-blue-200 px-4 py-1.5 font-bold text-[11px] text-blue-950">FORM PERUBAHAN</div>
        <div class="p-3 grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">Field yang diubah</label>
            <select v-model="form.field_name" @change="pilihField" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] bg-white outline-none">
              <option value="">Pilih Field</option>
              <option value="nip">NIP</option>
              <option value="nik">NIK</option>
              <option value="employee_name">Nama</option>
              <option value="address">Alamat</option>
              <option value="gender">Jenis Kelamin</option>
              <option value="phone_number">Nomor HP</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">Data Lama</label>
            <input v-model="form.old_value" readonly type="text" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] outline-none bg-white"/>
          </div>
          <div>
            <label class="block text-[11px] font-semibold mb-1 text-gray-700">Data Baru</label>
            <input v-model="form.new_value" readonly type="text" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] outline-none bg-white"/>
          </div>
        </div>
      </div>

      <div class="flex justify-between items-end mt-4">
        <div class="card-dashboard bg-white rounded-xl w-[260px] border border-gray-100 shadow-sm">
          <div class="bg-blue-200 px-4 py-1.5 font-bold text-[11px] text-blue-950 rounded-tl-xl rounded-tr-xl">STATUS</div>
          <div class="p-3">
            <select v-model="form.status" class="w-full border rounded-md px-2.5 py-1.5 text-[11px] bg-white outline-none">
              <option value="">Pilih Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" @click="batal" class="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-md text-[11px] font-semibold transition-colors">
            BATAL
          </button>
          <button type="button" @click="simpanVerifikasi" class="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-[11px] font-semibold transition">
            <Save :size="14"/>SIMPAN
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showSuccessModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[260px] rounded-xl shadow-lg p-5 text-center animate-fadeIn">
        <div class="mx-auto w-[60px] h-[60px] flex items-center justify-center rounded-full border-4 border-green-500 mb-3">
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