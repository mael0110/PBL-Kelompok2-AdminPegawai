<script setup>
import adminLayout from "./adminLayout.vue";
import { reactive, onMounted, ref } from "vue";
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

const showSuccessModal = ref(false);
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

    showSuccessModal.value = true;
    setTimeout(async () => {
      showSuccessModal.value = false;
      router.push("/penjadwalan");
    }, 2000);
    
  } catch (error) {
    console.log("Error update:", error.response?.data || error);
    triggerAlert("Gagal update jadwal!");
  }
};

// setTimeout(async () => {
//   showSuccessModal.value = false;
// }, 2000);

const batal = () => {
  router.push("/penjadwalan");
};
</script>

<template>
  <adminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded shadow-lg text-[11px] z-[9999] transition-all duration-300">
      {{ customAlert.message }}
    </div>

    <p class="text-[11px] mb-2">
      <RouterLink to="/penjadwalan" class="hover:underline">
        Penjadwalan
      </RouterLink>
      <span class="mx-2 text-gray-400">&gt;</span> Edit Penjadwalan
    </p>

    <h2 class="text-base font-bold mb-4">
      EDIT PENJADWALAN SESI PERKULIAHAN
    </h2>

    <div class="bg-white rounded-xl shadow-md p-4">
      <h2 class="font-bold text-sm mb-3">EDIT SESI (ADMIN PEGAWAI)</h2>

      <form @submit.prevent="simpanJadwal" class="grid grid-cols-2 gap-3 text-[11px]">
        <div>
          <label class="block text-[11px] font-semibold mb-1 text-gray-500">MATA KULIAH</label>
          <input v-model="form.course_name" type="text" class="w-full border rounded-lg px-2.5 py-1.5 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1 text-gray-500">TOPIK (HANYA DOSEN)</label>
          <input v-model="form.topic" type="text" class="w-full border rounded-lg px-2.5 py-1.5 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Tanggal Sesi</label>
          <input v-model="form.session_date" type="date" class="w-full border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1 text-gray-500">KELAS</label>
          <input v-model="form.class_name" type="text" class="w-full border rounded-lg px-2.5 py-1.5 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Jam Mulai</label>
          <input v-model="form.start_time" type="time" class="w-full border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1 text-gray-500">DOSEN</label>
          <input v-model="form.lecturer_name" type="text" class="w-full border rounded-lg px-2.5 py-1.5 bg-gray-100 text-gray-500 cursor-not-allowed" readonly />
        </div>

        <div>
          <label class="block text-[11px] font-semibold mb-1">Jam Selesai</label>
          <input v-model="form.end_time" type="time" class="w-full border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div class="flex items-right gap-2 col-span-2 justify-end mt-3">
          <button type="button" @click="batal" class="bg-red-500 hover:bg-red-400 text-white px-6 py-1.5 rounded-lg font-semibold text-[11px] transition">
            BATAL
          </button>

          <button type="submit" class="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-lg font-semibold text-[11px] transition">
            <Save :size="14" />
            Simpan
          </button>
        </div>
      </form>
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