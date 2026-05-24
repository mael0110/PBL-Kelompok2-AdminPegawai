<script setup>
import adminLayout from "./adminLayout.vue";
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Save } from "lucide-vue-next";
import { wilayahService } from "../services/wilayah";
import { employeesService } from "../services/pegawai";

const router = useRouter();
const route = useRoute();

const { getEmployeeById, updateEmployee } = employeesService();

const {
  provinces,
  cities,
  districts,
  villages,
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

  citizen_code: "",
  province_code: "",
  city_code: "",
  district_code: "",
  village_code: "",
});

onMounted(async () => {
  try {
    await getProvinces();

    const id = route.params.id;
    console.log("ID dari route:", id);

    const data = await getEmployeeById(id);

    form.employee_name = data.employee_name;
    form.nip = data.nip;
    form.nik = data.nik;
    form.gender = data.gender;
    form.birth_place = data.birth_place;
    form.birth_date = data.birth_date;
    form.address = data.address;
    form.phone_number = data.phone_number;

    form.citizen_code = data.citizen_code;
    form.province_code = data.province_code;
    form.city_code = data.city_code;
    form.district_code = data.district_code;
    form.village_code = data.village_code;

    await getCities(data.province_code);
    await getDistricts(data.city_code);
    await getVillages(data.district_code);
  } catch (error) {
    console.log("Gagal mengambil detail pegawai:", error);
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

const updatePegawai = async () => { //
  try {
    const id = route.params.id;
    await updateEmployee(id, { ...form, citizen_code: null });

    alert("Pegawai berhasil diupdate!");
    router.push("/pegawai");
  } catch (error) {
    console.log("Gagal update pegawai:", error.response?.data || error);
    alert("Gagal update pegawai!");
  }
};

const batal = () => {
  if (confirm("Apakah Anda yakin ingin membatalkan? Perubahan tidak akan simpan.")) {
    router.push("/pegawai");
  }
};
</script>

<template>
<adminLayout>
    <div>
        <p class="text-sm mb-2">
        <RouterLink to="/pegawai" class="text-blue-700 hover:underline">
          Pegawai
        </RouterLink>
        <span class="mx-2 text-gray-400">&gt;</span> Edit Pegawai
        </p>

      <h1 class="text-2xl font-bold mb-6 text-gray-800">EDIT PEGAWAI</h1>

      <form class="grid grid-cols-2 gap-4" @submit.prevent="updatePegawai">
        <div>
          <label for="employee_name" class="block text-sm font-semibold mb-1">
            NAMA PEGAWAI
          </label>
          <input
            id="employee_name"
            v-model="form.employee_name"
            type="text"
            required
            placeholder="Masukkan nama lengkap"
            class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label for="nip" class="block text-sm font-semibold mb-1">NIP</label>
          <input
            id="nip"
            v-model="form.nip"
            type="text"
            required
            placeholder="Contoh: 19XXXXXXXXXXXX"
            class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label for="nik" class="block text-sm font-semibold mb-1">NIK</label>
          <input
            id="nik"
            v-model="form.nik"
            type="text"
            required
            placeholder="Masukkan 16 digit NIK"
            class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label for="gender" class="block text-sm font-semibold mb-1">
            JENIS KELAMIN
          </label>
          <select
            id="gender"
            v-model="form.gender"
            required
            class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="" disabled>Pilih Jenis Kelamin</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
          </select>
        </div>

        <div>
          <p class="block text-sm font-semibold mb-1">TEMPAT, TANGGAL LAHIR</p>
          <div class="flex gap-2">
            <div class="flex-1">
              <label for="birth_place" class="sr-only">Tempat lahir</label>
              <input
                id="birth_place"
                v-model="form.birth_place"
                type="text"
                required
                placeholder="Tempat lahir"
                class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div class="w-52">
              <label for="birth_date" class="sr-only">Tanggal lahir</label>
              <input
                id="birth_date"
                v-model="form.birth_date"
                type="date"
                required
                class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label for="phone_number" class="block text-sm font-semibold mb-1">
            NO. HP
          </label>
          <input
            id="phone_number"
            v-model="form.phone_number"
            type="tel"
            required
            placeholder="08XXXXXXXXXX"
            class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div class="col-span-2">
          <label for="address" class="block text-sm font-semibold mb-1">
            ALAMAT LENGKAP
          </label>
          <textarea id="address" v-model="form.address" rows="3" required placeholder="Masukkan alamat lengkap"
            class="w-full bg-white border rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
          ></textarea>
          <div>

          <div>
            <label class="block text-sm font-semibold mb-1">Provinsi</label>
            <select v-model="form.province_code" @change="handleProvinceChange" class="w-full bg-white border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Provinsi</option>
              <option v-for="item in provinces" :key="item.id" :value="item.code">
                {{ item.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Kabupaten/Kota</label>
            <select v-model="form.city_code" @change="handleCityChange" class="w-full bg-white border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Kota</option>
              <option v-for="item in cities" :key="item.id" :value="item.code">
                {{ item.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Kecamatan</label>
            <select v-model="form.district_code" @change="handleDistrictChange" class="w-full bg-white border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Kecamatan</option>
              <option v-for="item in districts" :key="item.id" :value="item.code">
                {{ item.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold mb-1">Desa/Kelurahan</label>
            <select v-model="form.village_code" class="w-full bg-white border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="">Pilih Desa</option>
              <option v-for="item in villages" :key="item.id" :value="item.code">
                {{ item.name }}
              </option>
            </select>
          </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 col-span-2">
          <button
            type="button"
            @click="batal"
            class="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-lg font-semibold">
            BATAL
          </button>

          <button
            type="submit"
            class="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition">
            <Save/>SIMPAN
          </button>
        </div>
      </form>
    </div>
</adminLayout>
</template>