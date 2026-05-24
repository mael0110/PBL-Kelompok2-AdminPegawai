import { createRouter, createWebHistory } from "vue-router";

import Login from "../pages/login.vue";
import Dashboard from "../pages/dashboard.vue";
import Pegawai from "../pages/pegawai.vue";
import Verifikasi from "../pages/verifikasi.vue";
import Presensi from "../pages/presensi.vue";
import TambahPegawai from "../pages/tambahPegawai.vue";
import editPegawai from "../pages/editPegawai.vue";
import EditPegawai from "../pages/editPegawai.vue";
import EditVerifikasi from "../pages/editVerifikasi.vue";
import Penjadwalan from "../pages/penjadwalan.vue";
import editPenjadwalan from "../pages/editPenjadwalan.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "halaman-login", component: Login },
  { path: "/dashboard", name: "dashboard", component: Dashboard },
  { path: "/pegawai", name: "pegawai", component: Pegawai },
  { path: "/verifikasi", name: "verifikasi", component: Verifikasi },
  { path: "/presensi", name: "presensi", component: Presensi },
  {path: "/pegawai/tambah",name: "tambah-pegawai",component: TambahPegawai,},
  {path: "/pegawai/edit/:id", name: "edit-pegawai", component: EditPegawai},
  {path: "/verifikasi/edit/:id", name: "edit-verifikasi", component: EditVerifikasi},
  {path: "/penjadwalan", name: "penjadwalan", component: Penjadwalan},
  {path: "/penjadwalan/edit/:id", name: "edit-penjadwalan", component: editPenjadwalan},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
 
export default router;