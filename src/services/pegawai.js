import axios from "axios";
import { ref } from "vue";

export function employeesService() {
  const employees = ref([]);
  const meta = ref(null);

  async function getEmployees(page = 1) {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      `https://api-pegawai-4a.akufarish.my.id:1234/api/employees?page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    employees.value = res.data.data;
    meta.value = res.data.meta;
  } catch (error) {
    console.log("Error get employees:", error.response?.data || error);
  }
}

  async function createEmployee(payload) {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "https://api-pegawai-4a.akufarish.my.id:1234/api/employees",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Berhasil tambah pegawai:", res.data);

    return res.data;
  } catch (error) {
    console.log("Gagal tambah pegawai:", error.response?.data || error);
    throw error;
  }

 }

 async function getEmployeeById(id) {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `https://api-pegawai-4a.akufarish.my.id:1234/api/employees/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.data;
}

async function updateEmployee(id, payload) {
  const token = localStorage.getItem("token");

  const res = await axios.put(
    `https://api-pegawai-4a.akufarish.my.id:1234/api/employees/${id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

async function deleteEmployee(id) {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.delete(
      `https://api-pegawai-4a.akufarish.my.id:1234/api/employees/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Berhasil hapus pegawai:", res.data);
    return res.data;
  } catch (error) {
    console.log("Gagal hapus pegawai:", error.response?.data || error);
    throw error;
  }
}

  return {
    employees,
    meta,
    getEmployees,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
  };
}
