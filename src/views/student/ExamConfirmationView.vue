<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentExamStore } from '@/stores/studentExam'
import { AlertCircle, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const examStore = useStudentExamStore()

const scheduleId = Number(route.params.scheduleId)
const exam = ref(null)
const loading = ref(true)

const showModal = ref(false)

onMounted(async () => {
  try {
    // If token is not verified and exam is not in progress, redirect back to info page
    const detail = await examStore.fetchExamDetail(scheduleId)
    
    if (detail.status !== 'IN_PROGRESS' && !examStore.tokenVerificationState[scheduleId]) {
      router.replace(`/exams/${scheduleId}`)
      return
    }
    
    exam.value = detail
  } catch (error) {
    router.replace('/dashboard')
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.push(`/exams/${scheduleId}`)
}

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const starting = ref(false)
const errorMessage = ref('')

const startExam = async () => {
  const token = examStore.tokenVerificationState[scheduleId] || ''
  starting.value = true
  errorMessage.value = ''
  try {
    const attempt = await examStore.startAttempt(scheduleId, token)
    closeModal()
    router.push(`/exam/${attempt.attemptId}`)
  } catch (error) {
    errorMessage.value = examStore.error || 'Terjadi kesalahan'
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto pb-10 px-4 sm:px-0">
    
    <div class="mb-8">
      <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight text-center">Konfirmasi Ujian</h2>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-300 shadow-sm">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-slate-500 font-medium">Memuat data konfirmasi...</p>
    </div>

    <!-- Confirmation Card -->
    <div v-else-if="exam" class="bg-white border border-slate-300 rounded-2xl p-6 md:p-8 shadow-sm">
      
      <div class="space-y-4">
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-semibold text-sm">Nama</span>
          <span class="text-slate-900 font-bold text-sm">{{ exam.student.name }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-semibold text-sm">Mata Pelajaran</span>
          <span class="text-slate-900 font-bold text-sm">{{ exam.exam.subjectName || exam.subject?.name }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-semibold text-sm">Kelas</span>
          <span class="text-slate-900 font-bold text-sm">{{ exam.student.className || exam.class?.name }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-semibold text-sm">Jumlah Soal</span>
          <span class="text-slate-900 font-bold text-sm">{{ exam.questions?.total || exam.questionSummary?.total }}</span>
        </div>
        <div class="flex justify-between items-center py-3 border-b border-slate-100">
          <span class="text-slate-500 font-semibold text-sm">Durasi</span>
          <span class="text-slate-900 font-bold text-sm">{{ exam.schedule.durationMinutes || exam.durationMinutes }} Menit</span>
        </div>
      </div>

      <div class="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div class="text-sm font-medium text-blue-800">
          Pastikan data di atas sudah benar. Waktu ujian akan mulai dihitung setelah Anda menekan tombol "{{ exam.status === 'IN_PROGRESS' ? 'Lanjutkan Ujian' : 'Mulai Ujian' }}".
        </div>
      </div>

      <div class="mt-8 space-y-3">
        <button 
          @click="openModal"
          class="w-full py-3.5 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 focus:ring-4 focus:ring-blue-600/30 transition-all shadow-lg shadow-blue-500/20"
        >
          {{ exam.status === 'IN_PROGRESS' ? 'Lanjutkan Ujian' : 'Mulai Ujian' }}
        </button>
        <button 
          @click="goBack"
          class="w-full py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft class="w-4 h-4" />
          Kembali
        </button>
      </div>

    </div>

    <!-- Modal Konfirmasi -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeModal"></div>
      
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="w-8 h-8" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">{{ exam?.status === 'IN_PROGRESS' ? 'Lanjutkan Ujian?' : 'Mulai Ujian?' }}</h3>
          <p class="text-sm text-slate-500 font-medium">Waktu ujian akan mulai dihitung setelah ujian dimulai.</p>
        </div>
        
        <div class="flex border-t border-slate-100">
          <button 
            @click="closeModal"
            :disabled="starting"
            class="flex-1 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <div class="w-px bg-slate-100"></div>
          <button 
            @click="startExam"
            :disabled="starting"
            class="flex-1 py-4 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span v-if="starting" class="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
            {{ starting ? 'Memulai...' : 'Ya, Lanjutkan' }}
          </button>
        </div>
        
        <div v-if="errorMessage" class="px-6 pb-4 pt-2 text-center text-red-500 text-xs font-bold">
          {{ errorMessage }}
        </div>
      </div>
    </div>

  </div>
</template>
