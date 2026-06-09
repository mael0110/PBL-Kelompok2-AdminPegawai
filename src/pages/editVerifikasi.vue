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

const simpanVerifikasi = async () => {
  try {
    const id = route.params.id;
    await updateVerifikasi(id, form.status);

    alert("Status verifikasi berhasil diubah!");

    // reload data current page supaya tetap di page itu
    await getVerifikasi(currentPage.value);

    router.push({ path: "/verifikasi", query: { page: currentPage.value } });
  } catch (error) {
    alert("Gagal mengubah status!");
  }
};

const batal = () => {
  // await getVerifikasi(currentPage.value);
  router.push({ path: "/verifikasi", query: { page: currentPage.value } });
};
</script>

<template>
  <adminLayout>
    <p class="text-sm mb-2">
      <RouterLink :to="{ path: '/verifikasi', query: { page: currentPage.value } }" class="hover:underline">
        Verifikasi
      </RouterLink>
      <span class="mx-2 text-gray-400">&gt;</span> Edit Verifikasi
    </p>

    <h1 class="text-2xl font-bold mb-3">EDIT VERIFIKASI</h1>

    <!-- form data pegawai -->
    <div class="space-y-4">
      <div class="card-dashboard bg-white rounded-xl overflow-hidden">
        <div class="bg-blue-200 px-4 py-2 font-bold">DATA PEGAWAI</div>
        <div class="p-4 grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Nama</label>
            <input v-model="form.employee_name" type="text" disabled class="w-full border rounded-lg px-3 py-2 bg-gray-50"/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">NIP</label>
            <input v-model="form.nip" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-50"/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">NIK</label>
            <input v-model="form.nik" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-50"/>
          </div>
        </div>
      </div>

      <!-- form perubahan -->
      <div class="card-dashboard bg-white rounded-xl overflow-hidden">
        <div class="bg-blue-200 px-4 py-2 font-bold">FORM PERUBAHAN</div>
        <div class="p-4 grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold mb-1">Field yang diubah</label>
            <select v-model="form.field_name" @change="pilihField" class="w-full border rounded-lg px-3 py-2">
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
            <label class="block text-sm font-semibold mb-1">Data Lama</label>
            <input v-model="form.old_value" readonly type="text" class="w-full border rounded-lg px-3 py-2"/>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-1">Data Baru</label>
            <input v-model="form.new_value" readonly type="text" class="w-full border rounded-lg px-3 py-2"/>
          </div>
        </div>
      </div>

      <!-- status & tombol -->
      <div class="flex justify-between items-end mt-6">
        <div class="card-dashboard bg-white rounded-xl  w-[300px]">
          <div class="bg-blue-200 px-4 py-2 font-bold rounded-tl-xl rounded-tr-xl">STATUS</div>
          <div class="p-4">
            <select v-model="form.status" class="w-64 border rounded-lg px-3 py-2">
              <option value="">Pilih Status</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end gap-4">
          <button type="button" @click="batal" class="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg font-semibold">
            BATAL
          </button>
          <button type="button" @click="simpanVerifikasi" class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition">
            <Save/>SIMPAN
          </button>
        </div>
      </div>
    </div>
  </adminLayout>
</template>