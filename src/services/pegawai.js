import axios from "./axios";
import { ref } from "vue";

export function employeesService() {
  const employees = ref([]);
  const meta = ref(null);

  async function getEmployees(page = 1, search = "") {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "/employees",
      {
        params: {
          page,
          search
        },
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

    const res = await axios.post("/employees", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("RESP EMPLOYEE:", res.data);

    const employeeId = res.data?.data?.id;

    if (!employeeId) {
      throw new Error("employee id tidak ditemukan");
    }

    await axios.post("https://be.karlearn.site/api/users", {
      detail_id: employeeId,
      email: payload.nip + "@pegawai.com",
      name: payload.employee_name || payload.name,
      password: payload.nip,
      role_name: "dosen", 
    }, {
      headers: {
        Authorization: `Bearer ${token}`, 
      }
    });

    console.log("ROLE DOSEN BERHASIL DIBUAT");

    return res.data;

  } catch (error) {
    console.log("Gagal tambah pegawai:", error.response?.data || error);
    throw error;
  }
}

 async function getEmployeeById(id) {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `/employees/${id}`,
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
    `/employees/${id}`,
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
      `/employees/${id}`,
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
  async function getEmployeeCount() {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "/employees/info/count",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.data.total_employee;
  } catch (error) {
    console.log("Gagal ambil employee count:", error.response?.data || error);
    return 0;
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
    getEmployeeCount,
  };
}
