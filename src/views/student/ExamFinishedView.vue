<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CheckCircle2, Clock } from 'lucide-vue-next'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()
const resultData = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const attemptId = route.params.attemptId
    const response = await api.get(`/student/attempts/${attemptId}/result`)
    resultData.value = response.data.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans relative">
    
    <div class="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      <!-- Top Success Pattern -->
      <div class="h-32 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden flex items-center justify-center">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50"></div>
        <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-lg relative z-10 translate-y-4">
          <CheckCircle2 class="w-12 h-12 text-white drop-shadow-md" />
        </div>
      </div>
      
      <!-- Content -->
      <div class="pt-12 px-6 sm:px-10 pb-8 text-center">
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Ujian Telah Selesai</h1>
        <p class="text-slate-500 mt-2 font-medium">Jawaban Anda berhasil dikirim dan disimpan dengan aman.</p>
        
        <div v-if="loading" class="mt-8 flex justify-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
        
        <template v-else-if="resultData">
          <div class="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2 shadow-inner">
            <h2 class="font-bold text-slate-800 text-lg">{{ resultData.examTitle }}</h2>
            <p class="text-sm font-semibold text-blue-600 uppercase tracking-wider">{{ resultData.subjectName }}</p>
          </div>

          <!-- Score Visibility Area -->
          <div class="mt-8">
            <template v-if="resultData.resultVisibility === 'HIDDEN' || resultData.message">
              <div class="inline-block bg-slate-100 text-slate-600 font-medium px-4 py-2 rounded-lg text-sm border border-slate-200">
                {{ resultData.message || 'Hasil ujian belum dipublikasikan.' }}
              </div>
            </template>
            
            <template v-else>
              <div v-if="resultData.gradingStatus === 'WAITING_ESSAY_GRADING'" class="inline-flex flex-col items-center justify-center p-6 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 w-full">
                <Clock class="w-8 h-8 mb-3 text-amber-500" />
                <span class="font-bold text-lg">Menunggu Penilaian</span>
                <span class="text-sm font-medium opacity-80 mt-1">Hasil akhir akan tersedia setelah guru menilai soal essai.</span>
              </div>
              
              <div v-else-if="resultData.score !== undefined" class="inline-flex flex-col items-center justify-center py-6">
                <span class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai Akhir</span>
                <span class="text-6xl font-black text-blue-600 tracking-tighter drop-shadow-sm">{{ resultData.score }}</span>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="p-6 bg-slate-50 border-t border-slate-100">
        <button 
          @click="router.replace('/dashboard')"
          class="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md flex items-center justify-center gap-2"
        >
          Kembali ke Dashboard
        </button>
      </div>

    </div>

  </div>
</template>
