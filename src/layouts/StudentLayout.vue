<script setup>
import { computed, ref } from 'vue'
import { useStudentAuthStore } from '@/stores/studentAuth'
import { LogOut, User, Menu } from 'lucide-vue-next'

const authStore = useStudentAuthStore()
const student = computed(() => authStore.student)
const showMobileMenu = ref(false)

const onLogout = async () => {
  await authStore.logout()
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    
    <!-- Topbar -->
    <header class="bg-white border-b border-slate-300 sticky top-0 z-40 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        <!-- Left: Branding -->
        <div class="flex flex-col justify-center">
          <h1 class="text-base sm:text-lg font-bold text-blue-700 leading-tight tracking-tight">CBT EDULITE</h1>
          <span class="text-[10px] sm:text-xs text-slate-500 font-medium">SMK IT Asy-Syadzili</span>
        </div>

        <!-- Right: Desktop Student Info -->
        <div class="hidden sm:flex items-center gap-4">
          <div class="text-right">
            <div class="text-sm font-bold text-slate-900">{{ student?.name || 'Siswa' }}</div>
            <div class="text-xs text-slate-500 font-medium">{{ student?.class?.name || '-' }}</div>
          </div>
          
          <div class="h-8 w-px bg-slate-200 mx-1"></div>

          <button 
            @click="onLogout"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut class="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

        <!-- Right: Mobile Actions -->
        <div class="sm:hidden flex items-center">
          <button 
            @click="showMobileMenu = !showMobileMenu"
            class="p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu class="w-5 h-5" />
          </button>
        </div>

      </div>

      <!-- Mobile Dropdown Menu -->
      <div v-if="showMobileMenu" class="sm:hidden border-t border-slate-100 bg-white px-4 py-3 shadow-md absolute w-full">
        <div class="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <User class="w-5 h-5" />
          </div>
          <div>
            <div class="text-sm font-bold text-slate-900">{{ student?.name || 'Siswa' }}</div>
            <div class="text-xs text-slate-500 font-medium">{{ student?.class?.name || '-' }}</div>
          </div>
        </div>
        <button 
          @click="onLogout"
          class="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut class="w-4 h-4" />
          <span>Keluar Aplikasi</span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative">
      <RouterView />
    </main>

  </div>
</template>
