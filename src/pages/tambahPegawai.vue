<script setup>
import AdminLayout from "./adminLayout.vue"; 
import { reactive, onMounted, computed, ref } from "vue";
import { useRouter, RouterLink } from "vue-router"; 
import { Save } from 'lucide-vue-next';
import { wilayahService } from "../services/wilayah";
import { employeesService } from "../services/pegawai";

const router = useRouter();
const nipInput = ref(null);
const nikInput = ref(null);
const phoneInput = ref(null);

const showSuccessModal = ref(false);

const { createEmployee, meta, getEmployees } = employeesService();

const {
  countries,
  provinces,
  cities,
  districts,
  villages,
  getCountries,
  getProvinces,
  getCities,
  getDistricts,
  getVillages,
} = wilayahService();

const form = reactive({
  employee_name: "",
  nip: "",
  nik: "",
  gender: "",
  birth_place: "",
  birth_date: "",
  address: "",
  phone_number: "",

  citizen_code: "ID", 
  province_code: "",
  city_code: "",
  district_code: "",
  village_code: "",
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
  try {
    await getCountries();
    await getProvinces();
  } catch (error) {
    console.log("API wilayah belum aktif:", error);
  }
});

const handleProvinceChange = async () => {
  form.city_code = "";
  form.district_code = "";
  form.village_code = "";

  await getCities(form.province_code);
};

const handleCityChange = async () => {
  form.district_code = "";
  form.village_code = "";

  await getDistricts(form.city_code);
};

const handleDistrictChange = async () => {
  form.village_code = "";

  await getVillages(form.district_code);
};

const isNumberOnly = (value) => {
  return /^\d*$/.test(value);
};

const nipError = computed(() => {
  return form.nip && !isNumberOnly(form.nip);
});

const nikError = computed(() => {
  return form.nik && !isNumberOnly(form.nik);
});

const phoneError = computed(() => {
  return form.phone_number && !isNumberOnly(form.phone_number);
});

const simpanPegawai = async () => {
  if (nipError.value) {
    triggerAlert("NIP harus menggunakan angka");
    nipInput.value?.focus();
    return;
  }

  if (form.nip.length !== 18) {
    triggerAlert("NIP harus terdiri dari 18 digit");
    nipInput.value?.focus();
    return;
  }

  if (nikError.value) {
    triggerAlert("NIK harus menggunakan angka");
    nikInput.value?.focus();
    return;
  }

  if (form.nik.length !== 16) {
    triggerAlert("NIK harus terdiri dari 16 digit");
    nikInput.value?.focus();
    return;
  }

  if (phoneError.value) {
    triggerAlert("No. HP harus menggunakan angka");
    phoneInput.value?.focus();
    return;
  }

  try {
    await createEmployee({
      employee_name: form.employee_name,
      nip: form.nip,
      nik: form.nik,
      gender: form.gender,
      birth_place: form.birth_place,
      birth_date: form.birth_date,
      address: form.address,
      phone_number: form.phone_number,
      citizen_code: form.citizen_code,
      province_code: form.province_code,
      city_code: form.city_code,
      district_code: form.district_code,
      village_code: form.village_code,
    });

    showSuccessModal.value = true;
    await getEmployees();

    const lastPage = meta.value?.last_page || 1;
    router.push({ path: "/pegawai", query: { page: lastPage } });
  } catch (error) {
    console.log("Error detail:", error.response?.data);
    
    // Mengambil pesan error spesifik dari backend jika ada
    const pesanGagal = error.response?.data?.message || "Gagal menyimpan! Periksa validasi data.";
    triggerAlert(pesanGagal);
  }
};

setTimeout(async () => {
  showSuccessModal.value = false;

  await getEmployees();

  const lastPage = meta.value?.last_page || 1;
  // router.push({ path: "/pegawai", query: { page: lastPage } });
}, 2000);

const batal = () => {
  if (confirm("Apakah Anda yakin ingin membatalkan? Data yang diisi akan hilang.")) {
    router.push("/pegawai");
  }
};
</script>

<template>
  <AdminLayout>
    <div v-if="customAlert.show" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-1.5 rounded shadow-lg text-[11px] z-[9999] transition-all duration-300">
      {{ customAlert.message }}
    </div>

    <div class="max-w-4xl">
      <p class="text-[11px] mb-1.5 text-gray-500">
        <RouterLink to="/pegawai" class=" hover:underline">
          Pegawai
        </RouterLink>
        <span class="mx-1 text-gray-400">&gt;</span> Tambah Pegawai
      </p>

      <h1 class="text-lg font-bold mb-4 text-gray-800">TAMBAH PEGAWAI BARU</h1>

      <form class="grid grid-cols-2 gap-3" @submit.prevent="simpanPegawai">
        <div>
          <label for="employee_name" class="block text-[11px] font-semibold mb-1 text-gray-700">
            NAMA PEGAWAI
          </label>
          <input
            id="employee_name"
            v-model="form.employee_name"
            type="text"
            required
            placeholder="Masukkan nama lengkap"
            class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label for="nip" class="block text-[11px] font-semibold mb-1 text-gray-700">NIP</label>
          <input
            id="nip"
            v-model="form.nip"
            ref="nipInput"
            type="text" inputmode="numeric" maxlength="18" autocomplete="off" placeholder="Masukkan 18 digit NIP"
            :class="[
            'w-full bg-white rounded-md px-2.5 py-1.5 outline-none text-[11px]',
            nipError  ? 'border border-red-500 focus:ring-2 focus:ring-red-500'  : 'border focus:ring-2 focus:ring-blue-500']"
          />
        </div>

        <div>
          <label for="nik" class="block text-[11px] font-semibold mb-1 text-gray-700">NIK</label>
          <input
            id="nik"
            v-model="form.nik"
            ref="nikInput"
            type="text" inputmode="numeric" maxlength="16" autocomplete="off" placeholder="Masukkan 16 digit NIK"
            :class="[
            'w-full bg-white rounded-md px-2.5 py-1.5 outline-none text-[11px]',
            nikError  ? 'border border-red-500 focus:ring-2 focus:ring-red-500'  : 'border focus:ring-2 focus:ring-blue-500']"
          />
        </div>

        <div>
          <label for="gender" class="block text-[11px] font-semibold mb-1 text-gray-700">
            JENIS KELAMIN
          </label>
          <select
            id="gender"
            v-model="form.gender"
            required
            class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="" disabled>Pilih Jenis Kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div>
          <p class="block text-[11px] font-semibold mb-1 text-gray-700">TEMPAT, TANGGAL LAHIR</p>
          <div class="flex gap-2">
            <div class="flex-1">
              <label for="birth_place" class="sr-only">Tempat lahir</label>
              <input
                id="birth_place"
                v-model="form.birth_place"
                type="text"
                required
                placeholder="Tempat lahir"
                class="w-full bg-white border rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div class="w-36">
              <label for="birth_date" class="sr-only">Tanggal lahir</label>
              <input
                id="birth_date"
                v-model="form.birth_date"
                type="date"
                required
                class="w-full bg-white border rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label for="phone_number" class="block text-[11px] font-semibold mb-1 text-gray-700">
            NO. HP
          </label>
          <input
            id="phone_number"
            v-model="form.phone_number"
            ref="phoneInput"
            type="text" inputmode="numeric"
            required
            placeholder="08XXXXXXXXXX"
            :class="[
            'w-full bg-white rounded-md px-2.5 py-1.5 outline-none text-[11px]',
            phoneError  ? 'border border-red-500 focus:ring-2 focus:ring-red-500'  : 'border focus:ring-2 focus:ring-blue-500']"
          />
        </div>

        <div class="col-span-2">
          <label for="address" class="block text-[11px] font-semibold mb-1 text-gray-700">
            ALAMAT LENGKAP
          </label>
          <textarea
            id="address"
            v-model="form.address"
            rows="2"
            required
            placeholder="Masukkan alamat lengkap"
            class="w-full bg-white border rounded-md px-2.5 py-1.5 mb-2 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-semibold mb-1 text-gray-700">Provinsi</label>
              <select v-model="form.province_code" @change="handleProvinceChange" class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Provinsi</option>
                <option v-for="item in provinces" :key="item.id" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold mb-1 text-gray-700">Kabupaten/Kota</label>
              <select v-model="form.city_code" @change="handleCityChange" class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Kota</option>
                <option v-for="item in cities" :key="item.id" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold mb-1 text-gray-700">Kecamatan</label>
              <select v-model="form.district_code" @change="handleDistrictChange" class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Kecamatan</option>
                <option v-for="item in districts" :key="item.id" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold mb-1 text-gray-700">Desa/Kelurahan</label>
              <select v-model="form.village_code" class="w-full border bg-white rounded-md px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Pilih Desa</option>
                <option v-for="item in villages" :key="item.id" :value="item.code">
                  {{ item.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 col-span-2 mt-2">
          <button
            type="button"
            @click="batal"
            class="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 rounded-md text-[11px] font-semibold">
            BATAL
          </button>

          <button
            type="submit"
            class="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-[11px] font-semibold transition">
            <Save :size="14"/>SIMPAN
          </button>
        </div>
      </form>
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
  </AdminLayout>
</template>