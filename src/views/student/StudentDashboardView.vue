<script setup>
import { onMounted, computed } from 'vue'
import { useStudentExamStore } from '@/stores/studentExam'
import { useStudentAuthStore } from '@/stores/studentAuth'
import ExamCard from '@/components/student/ExamCard.vue'
import { RefreshCw, BookOpen, Clock } from 'lucide-vue-next'

const examStore = useStudentExamStore()
const authStore = useStudentAuthStore()

const student = computed(() => authStore.student)
const loading = computed(() => examStore.loading)

const availableExams = computed(() => examStore.availableExams)
const upcomingExams = computed(() => examStore.upcomingExams)
const inProgressExams = computed(() => examStore.inProgressExams)
const completedExams = computed(() => examStore.completedExams)

const hasAnyExams = computed(() => examStore.exams.length > 0)

const fetchExams = async () => {
  await examStore.fetchExams()
}

onMounted(() => {
  fetchExams()
})
</script>

<template>
  <div class="space-y-8 pb-10">
    
    <!-- Welcome Header -->
    <div class="bg-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
      <!-- Soft abstract shapes -->
      <div class="absolute top-[-50%] right-[-10%] w-96 h-96 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center font-bold text-3xl shadow-inner border border-white/30 backdrop-blur-sm">
          {{ student?.name?.charAt(0) || 'S' }}
        </div>
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Halo, {{ student?.name?.split(' ')[0] || 'Siswa' }}!</h2>
          <p class="text-blue-100 font-medium mt-1 text-sm sm:text-base">Siap untuk ujian hari ini? Pilih ujianmu di bawah.</p>
        </div>
      </div>
      <button 
        @click="fetchExams" 
        :disabled="loading"
        class="relative z-10 flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-white/30 focus:outline-none transition-all duration-300 disabled:opacity-50 shadow-sm"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        Segarkan Daftar
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !hasAnyExams" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
      <RefreshCw class="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p class="text-slate-500 font-medium">Memuat daftar ujian...</p>
    </div>
    
    <template v-else-if="hasAnyExams">
      <!-- In Progress / Available Exams (High Priority) -->
      <section v-if="inProgressExams.length > 0 || availableExams.length > 0">
        <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          Ujian Tersedia
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ExamCard 
            v-for="exam in [...inProgressExams, ...availableExams]" 
            :key="exam.scheduleId" 
            :exam="exam" 
          />
        </div>
      </section>

      <!-- Upcoming Exams -->
      <section v-if="upcomingExams.length > 0">
        <h3 class="text-lg font-bold text-slate-900 mb-4 mt-8 flex items-center gap-2">
          Akan Datang
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ExamCard 
            v-for="exam in upcomingExams" 
            :key="exam.scheduleId" 
            :exam="exam" 
          />
        </div>
      </section>

      <!-- Completed Exams -->
      <section v-if="completedExams.length > 0">
        <h3 class="text-lg font-bold text-slate-900 mb-4 mt-8 flex items-center gap-2">
          Riwayat Ujian
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition-opacity">
          <ExamCard 
            v-for="exam in completedExams" 
            :key="exam.scheduleId" 
            :exam="exam" 
          />
        </div>
      </section>
    </template>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 ring-4 ring-slate-50/50">
        <BookOpen class="w-8 h-8 text-slate-300" />
      </div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">Belum Ada Ujian</h3>
      <p class="text-slate-500 font-medium max-w-sm">Saat ini belum ada ujian yang tersedia. Silakan menunggu instruksi dari pengawas.</p>
    </div>

  </div>
</template>
