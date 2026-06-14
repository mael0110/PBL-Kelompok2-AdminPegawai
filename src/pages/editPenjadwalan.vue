<script setup>
import adminLayout from "./adminLayout.vue";
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Save } from "lucide-vue-next";
import { penjadwalanService } from "../services/penjadwalan";

const router = useRouter();
const route = useRoute();

const { getJadwalById, updateJadwal } = penjadwalanService();

const form = reactive({
  course_code: "",
  course_name: "",
  class_id: "",
  class_name: "",
  topic: "", // Diinisialisasi string kosong agar aman dari error 422
  pengampu_id: "",
  lecturer_id: "",
  lecturer_name: "",
  session_date: "",
  start_time: "",
  end_time: "",
});

onMounted(async () => {
  const id = route.params.id;
  console.log("ID dari route:", id);

  const data = await getJadwalById(id);
  console.log("Data detail jadwal:", data);

  if (!data) return;

  form.course_code = data.course_code || "";
  form.course_name = data.course_name || "";
  form.class_id = data.class_id || "";
  // FIX: Ambil topik asli dari backend, jika null paksa jadi "" agar validasi string backend lolos
  form.topic = data.topic || ""; 
  form.class_name = data.class_name || "";
  form.pengampu_id = data.pengampu_id || "";
  form.lecturer_id = data.lecturer_id || "";
  form.lecturer_name = data.lecturer?.employee_name || "";
  form.session_date = data.session_date || "";
  form.start_time = data.start_time?.slice(0, 5) || "";
  form.end_time = data.end_time?.slice(0, 5) || "";
});

const simpanJadwal = async () => {
  try {
    const id = route.params.id;

    const payload = {
      pengampu_id: form.pengampu_id,
      lecturer_id: form.lecturer_id,
      class_id: form.class_id,
      class_name: form.class_name,
      // TRIK: Jika topik kosong, paksa kirim string berisi spasi " " agar backend mau menerima
      topic: form.topic.trim() === "" ? "-" : form.topic, 
      course_code: form.course_code,
      course_name: form.course_name,
      session_date: form.session_date,
      start_time: form.start_time,
      end_time: form.end_time,
    };

    console.log("Payload update jadwal (Trik Spasi):", payload);

    await updateJadwal(id, payload);

    alert("Jadwal berhasil diupdate!");
    router.push("/penjadwalan");
  } catch (error) {
    console.log("Error update:", error.response?.data || error);
    alert("Gagal update jadwal!");
  }
};

const batal = () => {
  router.push("/penjadwalan");
};
</script>

<template>
  <adminLayout>
    <p class="text-sm mb-2">
      <RouterLink to="/penjadwalan" class="hover:underline">
        Penjadwalan
      </RouterLink>
      <span class="mx-2 text-gray-400">&gt;</span> Edit Penjadwalan
    </p>

    <h2 class="text-2xl font-bold mb-6">
      EDIT PENJADWALAN SESI PERKULIAHAN
    </h2>

    <div class="bg-white rounded-xl shadow-md p-5">
      <h2 class="font-bold text-xl mb-4">EDIT SESI (ADMIN PEGAWAI)</h2>

      <form @submit.prevent="simpanJadwal" class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-500">MATA KULIAH</label>
          <input v-model="form.course_name" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-500">TOPIK (HANYA DOSEN)</label>
          <input v-model="form.topic" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Tanggal Sesi</label>
          <input v-model="form.session_date" type="date" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-500">KELAS</label>
          <input v-model="form.class_name" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.start_time" type="time" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1 text-gray-500">DOSEN</label>
          <input v-model="form.lecturer_name" type="text" class="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-sm font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.end_time" type="time" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div class="flex items-right gap-2 col-span-2 justify-end mt-4">
          <button type="submit" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition">
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