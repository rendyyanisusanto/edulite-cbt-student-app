<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { useStudentAuthStore } from '@/stores/studentAuth'
import { Eye, EyeOff, User, Lock, BookOpen } from 'lucide-vue-next'

const router = useRouter()
const authStore = useStudentAuthStore()

const schema = toTypedSchema(
  z.object({
    login: z.string().min(1, { message: 'Username atau NIS wajib diisi.' }),
    password: z.string().min(1, { message: 'Password wajib diisi.' })
  })
)

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: schema,
})

const { value: login } = useField('login')
const { value: password } = useField('password')

const errorMessage = ref('')
const showPassword = ref(false)

const onSubmit = handleSubmit(async (values) => {
  errorMessage.value = ''
  
  const result = await authStore.login({
    username: values.login,
    password: values.password
  })
  
  if (result.success) {
    router.push('/dashboard')
  } else {
    errorMessage.value = result.message
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    <div class="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

    <div class="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 relative z-10">
      
      <!-- Logo & Header -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-blue to-blue-400 text-white mb-5 shadow-lg shadow-blue-500/30">
          <BookOpen class="w-8 h-8" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">CBT Edulite</h1>
        <p class="text-sm font-medium text-gray-500 uppercase tracking-widest">SMK IT Asy-Syadzili</p>
      </div>

      <form @submit="onSubmit" class="space-y-6">
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-start gap-3">
          <svg class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Username Input -->
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700 ml-1">Username / NIS</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-blue transition-colors">
              <User class="w-5 h-5" />
            </div>
            <input 
              v-model="login"
              type="text" 
              class="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30': errors.login }"
              placeholder="Masukkan username Anda"
            />
          </div>
          <p v-if="errors.login" class="text-red-500 text-xs font-medium mt-1.5 ml-1">{{ errors.login }}</p>
        </div>

        <!-- Password Input -->
        <div class="space-y-1.5">
          <label class="block text-sm font-semibold text-gray-700 ml-1">Password</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary-blue transition-colors">
              <Lock class="w-5 h-5" />
            </div>
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              class="w-full pl-11 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-blue/10 focus:border-primary-blue transition-all duration-300 text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
              :class="{ 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50/30': errors.password }"
              placeholder="Masukkan password Anda"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
          <p v-if="errors.password" class="text-red-500 text-xs font-medium mt-1.5 ml-1">{{ errors.password }}</p>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="relative w-full py-4 mt-2 bg-gradient-to-r from-primary-blue to-blue-500 text-white rounded-2xl font-bold tracking-wide hover:from-primary-dark hover:to-primary-blue focus:outline-none focus:ring-4 focus:ring-primary-blue/30 transition-all duration-300 shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden group"
        >
          <div class="absolute inset-0 w-full h-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out"></div>
          <span class="relative flex justify-center items-center gap-2">
            <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isSubmitting ? 'Memproses...' : 'Masuk Ujian' }}
          </span>
        </button>
      </form>
      
    </div>
  </div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
  animation: blob 7s infinite;
}
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
