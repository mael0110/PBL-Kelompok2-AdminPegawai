<template>
  <div>
    <h1>Jurusan</h1>

    <table>
      <thead>
        <tr>
          <th>No</th>
          <th>Nama</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(data, index) in allJurusan" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ data.email }}</td>
        </tr>
      </tbody>
    </table>

    <br />

    <form @submit.prevent="handleSubmit">
      <input placeholder="email" type="email" v-model="payload.email" />
      <input placeholder="password" type="password" v-model="payload.password" />
      <button type="submit">Tambah Data</button>
    </form>
  </div>
</template>

<script setup>
import JurusanService from "@/services/jurusan";
import { onMounted, reactive } from "vue";

const { allJurusan, getAllJurusan, createJurusan } = JurusanService();

const payload = reactive({
  email: "",
  password: "",
});

onMounted(async () => {
  await getAllJurusan();
});

const handleSubmit = async () => {
  await createJurusan(payload);
  await getAllJurusan();

  payload.email = "";
  payload.password = "";
};
</script>