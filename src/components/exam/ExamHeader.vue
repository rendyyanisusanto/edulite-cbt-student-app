<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'
import { Clock } from 'lucide-vue-next'

const examStore = useExamAttemptStore()

const activeNumber = computed(() => examStore.currentQuestionIndex + 1)
const totalQuestions = computed(() => examStore.totalQuestions)
const title = computed(() => examStore.exam?.subject || 'Ujian')

const timeRemaining = ref(0)
let timerInterval = null

const formattedTime = computed(() => {
  if (timeRemaining.value <= 0) return '00:00:00'
  const h = Math.floor(timeRemaining.value / 3600)
  const m = Math.floor((timeRemaining.value % 3600) / 60)
  const s = Math.floor(timeRemaining.value % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
})

const isTimeLow = computed(() => timeRemaining.value > 0 && timeRemaining.value <= 300) // less than 5 mins
const isTimeWarning = computed(() => timeRemaining.value > 300 && timeRemaining.value <= 900) // 15 mins
const showWarningToast = ref(false)
const showCriticalToast = ref(false)
let resyncInterval = null

onMounted(() => {
  timerInterval = setInterval(() => {
    if (examStore.attempt?.expiresAt) {
      const expiresAt = new Date(examStore.attempt.expiresAt).getTime()
      const now = Date.now() + (examStore.serverTimeOffset || 0)
      const remaining = Math.max(0, (expiresAt - now) / 1000)
      
      // Trigger toast
      if (timeRemaining.value > 900 && remaining <= 900) {
        showWarningToast.value = true
        setTimeout(() => showWarningToast.value = false, 5000)
      } else if (timeRemaining.value > 300 && remaining <= 300) {
        showCriticalToast.value = true
        setTimeout(() => showCriticalToast.value = false, 7000)
      }
      
      timeRemaining.value = remaining
    }
  }, 1000)
  
  resyncInterval = setInterval(() => {
    examStore.resyncTime()
  }, 90000) // 90 seconds
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (resyncInterval) clearInterval(resyncInterval)
})
</script>

<template>
  <header class="bg-white border-b border-slate-300 sticky top-0 z-40 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
    <div class="w-full px-4 sm:px-6 md:px-8 h-14 sm:h-16 flex items-center justify-between">
      
      <!-- Left: Title & Branding -->
      <div class="flex items-center gap-4">
        <h1 class="hidden sm:block text-base sm:text-lg font-bold text-blue-700 tracking-tight pr-4 border-r border-slate-200">
          CBT EDULITE
        </h1>
        <div class="flex flex-col justify-center">
          <span class="text-sm sm:text-base font-bold text-slate-900 leading-tight">{{ title }}</span>
          <span class="text-xs text-slate-500 font-medium sm:hidden">Soal {{ activeNumber }}/{{ totalQuestions }}</span>
        </div>
      </div>

      <!-- Right: Timer -->
      <div class="flex items-center gap-3 sm:gap-4">
        <div class="hidden sm:flex flex-col items-end">
          <div class="text-sm font-semibold text-slate-600">
            Soal {{ activeNumber }} dari {{ totalQuestions }}
          </div>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
            Sisa Waktu
          </div>
        </div>
        <div 
          class="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border-2 font-bold transition-all shadow-sm"
          :class="[
            isTimeLow 
              ? 'bg-red-50 border-red-400 text-red-600 shadow-red-100 animate-[pulse_1s_ease-in-out_infinite]' 
              : isTimeWarning
                ? 'bg-amber-50 border-amber-400 text-amber-600 shadow-amber-100'
                : 'bg-blue-50 border-blue-300 text-blue-700 shadow-blue-50'
          ]"
        >
          <Clock class="w-4 h-4 sm:w-6 sm:h-6" :class="isTimeLow ? 'text-red-500' : (isTimeWarning ? 'text-amber-500' : 'text-blue-500')" />
          <span class="tracking-[0.15em] font-mono text-lg sm:text-xl font-black">{{ formattedTime }}</span>
        </div>
      </div>

    </div>
    
    <!-- Time Warning Toasts -->
    <div v-if="showWarningToast" class="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-amber-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold flex items-center gap-3 z-50 animate-[bounce_1s_ease-in-out_3]">
      <Clock class="w-5 h-5" />
      <span>Waktu tersisa 15 menit.</span>
    </div>
    <div v-if="showCriticalToast" class="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg font-semibold flex flex-col items-center gap-1 z-50 animate-[pulse_1s_ease-in-out_5]">
      <div class="flex items-center gap-3">
        <Clock class="w-5 h-5" />
        <span>Waktu hampir habis!</span>
      </div>
      <span class="text-xs font-normal opacity-90">Pastikan jawaban Anda sudah tersimpan.</span>
    </div>
  </header>
</template>
