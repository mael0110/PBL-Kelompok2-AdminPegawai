<script setup>
import adminLayout from "./adminLayout.vue";
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Save } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();

const form = reactive({
  mata_kuliah: "",
  tanggal_mulai: "",
  kelas: "",
  jam_mulai: "",
  dosen: "",
  jam_selesai: "",
});

onMounted(() => {
  const id = route.params.id;
  console.log("ID jadwal:", id);

  // sementara dummy dulu
  form.mata_kuliah = "Pemrograman Web";
  form.tanggal_mulai = "2025-02-12";
  form.kelas = "TI-4A";
  form.jam_mulai = "08:00";
  form.dosen = "Wade Cooper";
  form.jam_selesai = "10:00";
});

const simpanJadwal = () => {
  console.log("Update jadwal:", { ...form });

  alert("Jadwal berhasil diupdate!");
  router.push("/penjadwalan");
};

const batal = () => {
  router.push("/penjadwalan");
};
</script>

<template>
  <adminLayout>
    <p class="text-sm mb-2">
      <RouterLink to="/penjadwalan" class="text-blue-700 hover:underline">
        Penjadwalan
      </RouterLink>
      <span class="mx-2 text-gray-400">&gt;</span> Edit Penjadwalan
    </p>

    <h2 class="text-2xl font-bold mb-6">
      EDIT PENJADWALAN SESI PERKULIAHAN
    </h2>

    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="font-bold text-xl mb-4">EDIT SESI</h2>

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
            Simpan Jadwal
          </button>

          <button type="button" @click="batal" class="bg-gray-500 hover:bg-gray-600 text-white px-8 py-2 rounded-lg font-semibold transition">
            BATAL
          </button>
        </div>
      </form>
    </div>
  </adminLayout>
</template>