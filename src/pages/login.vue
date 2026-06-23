<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Mail, LockKeyhole, Eye, EyeOff, X } from "lucide-vue-next";
import logo from "../assets/logo.png";
import { authService } from "../services/auth";

const router = useRouter();

const showPassword = ref(false);

const errorMessage = ref("");

const form = reactive({
  email: "tim2@admin.com",
  password: "pass#tim2",
});

const { login } = authService();

const handleLogin = async () => {
  errorMessage.value = "";
  if (!form.email) {
    errorMessage.value = "Username tidak boleh kosong!";
    return;
  }

  if (!form.password) {
    errorMessage.value = "Password tidak boleh kosong!";
    return;
  }

  try {
    await login({
      email: form.email,
      password: form.password,
    });

    router.push("/dashboard");
  } catch (error) {
    errorMessage.value = "Email atau password salah!";
  }
};
</script>

<template>
  <div class="min-h-screen bg-blue-900 flex items-center justify-center p-4">
    <!-- POP-UP ALERT KECIL DI ATAS -->
    <div 
      v-if="errorMessage" 
      class="fixed top-4 left-1/2 -translate-x-1/2 bg-[#E74C3C] text-white px-4 py-1.5 rounded shadow-xl text-[11px] z-[9999] transition-all duration-300 font-medium flex items-center gap-2"
    >
      <span>{{ errorMessage }}</span>
      <X class="w-3 h-3 cursor-pointer" @click="errorMessage = ''" />
    </div>

    <div class="w-[340px] bg-white rounded-xl shadow-lg px-8 py-8">
      <div class="text-center mb-6">
        <img
          :src="logo"
          alt="logo"
          class="w-14 h-14 object-contain mx-auto mb-2"
        />

        <h1 class="text-lg font-bold text-blue-900">Selamat Datang</h1>

        <p class="text-[10px] text-gray-600">Silahkan Login Untuk Melanjutkan</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-3">
        <div>
          <label class="text-[11px] text-gray-600 font-medium block mb-0.5">Username</label>
          <div
            class="flex items-center bg-white border border-gray-300 rounded h-7"
          >
            <Mail class="w-3.5 h-3.5 mx-2 text-gray-400" />
            <input
              v-model="form.email"
              type="email"
              placeholder="Email"
              class="w-full outline-none text-[11px] px-1"
            />
          </div>
        </div>

        <div>
          <label class="text-[11px] text-gray-600 font-medium block mb-0.5">Password</label>
          <div
            class="flex items-center bg-white border border-gray-300 rounded h-7"
          >
            <LockKeyhole class="w-3.5 h-3.5 mx-2 text-gray-400" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="w-full outline-none text-[11px] px-1"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="px-2 text-gray-400"
            >
              <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
              <EyeOff v-else class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="w-full bg-blue-900 text-white text-[11px] py-1.5 rounded hover:bg-blue-800 font-semibold transition-colors pt-2"
        >
          Masuk
        </button>
      </form>
    </div>
  </div>
</template>