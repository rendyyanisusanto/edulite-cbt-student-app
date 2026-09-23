<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamAttemptStore } from '@/stores/examAttempt'
import { ArrowLeft, Check, Flag, HelpCircle, AlertCircle } from 'lucide-vue-next'
import api from '@/services/api'
import FinishExamModal from '@/components/exam/FinishExamModal.vue'
import ExamHeader from '@/components/exam/ExamHeader.vue'

const router = useRouter()
const route = useRoute()
const examStore = useExamAttemptStore()

const showFinishModal = ref(false)
const isSubmitting = ref(false)

onMounted(async () => {
  try {
    const attemptId = route.params.attemptId;
    if (!examStore.attempt) {
      await examStore.fetchAttempt(attemptId);
      await examStore.fetchQuestions(attemptId);
    }
  } catch (error) {
    router.replace('/dashboard')
  }
})

const questions = computed(() => examStore.questions)
const answers = computed(() => examStore.answers)

const getQuestionStatus = (q) => {
  if (!q) return 'unanswered'
  const ans = answers.value[q.id]
  if (!ans) return 'unanswered'
  if (ans.isFlagged) return 'flagged'
  if (q.questionType === 'SINGLE_CHOICE' && ans.selectedOptionId) return 'answered'
  if (q.questionType === 'ESSAY' && typeof ans.answerText === 'string' && ans.answerText.trim() !== '') return 'answered'
  return 'unanswered'
}

const goToQuestion = (index) => {
  examStore.goToQuestion(index)
  router.push(`/exam/${route.params.attemptId}`)
}

const submitExam = async () => {
  isSubmitting.value = true
  try {
    // Flush pending
    examStore.flushPendingSaves()
    await examStore.retrySync()

    const attemptId = route.params.attemptId
    await api.post(`/student/attempts/${attemptId}/submit`)
    router.replace(`/exam/${attemptId}/finished`)
  } catch (error) {
    console.error(error)
    alert('Terjadi kesalahan saat mengumpulkan ujian. Pastikan koneksi internet Anda stabil dan coba lagi.')
  } finally {
    isSubmitting.value = false
    showFinishModal.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans relative">
    <ExamHeader />

    <main class="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-24 sm:pb-10 flex flex-col gap-6">
      
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Periksa Jawaban</h1>
          <p class="text-slate-500 font-medium text-sm mt-1">Pastikan semua jawaban sudah sesuai sebelum mengakhiri ujian.</p>
        </div>
        <button 
          @click="router.push(`/exam/${route.params.attemptId}`)"
          class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <ArrowLeft class="w-4 h-4" />
          Kembali ke Soal
        </button>
      </div>

      <!-- Warning sections -->
      <div v-if="examStore.unansweredCount > 0" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-red-700 font-bold">
          <AlertCircle class="w-6 h-6 shrink-0" />
          <span>Masih ada {{ examStore.unansweredCount }} soal yang belum dijawab.</span>
        </div>
        <button 
          @click="goToQuestion(questions.findIndex(q => getQuestionStatus(q) === 'unanswered'))"
          class="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg text-sm transition-colors shrink-0 whitespace-nowrap"
        >
          Periksa Soal
        </button>
      </div>

      <div v-if="examStore.flaggedCount > 0" class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 text-amber-700 font-bold">
          <Flag class="w-6 h-6 shrink-0 fill-amber-500 text-amber-500" />
          <span>Ada {{ examStore.flaggedCount }} soal yang Anda tandai ragu-ragu.</span>
        </div>
        <button 
          @click="goToQuestion(questions.findIndex(q => getQuestionStatus(q) === 'flagged'))"
          class="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold rounded-lg text-sm transition-colors shrink-0 whitespace-nowrap"
        >
          Periksa Soal
        </button>
      </div>

      <!-- Summary & Grid -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <!-- Summary Stats -->
        <div class="md:col-span-1 flex flex-col gap-3">
          <div class="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100">
            <span class="text-sm font-semibold text-slate-600">Total Soal</span>
            <span class="font-black text-lg text-slate-900">{{ examStore.totalQuestions }}</span>
          </div>
          <div class="bg-green-50 p-4 rounded-xl flex items-center justify-between border border-green-100">
            <span class="text-sm font-semibold text-green-700 flex items-center gap-2"><Check class="w-4 h-4"/> Dijawab</span>
            <span class="font-black text-lg text-green-700">{{ examStore.answeredCount }}</span>
          </div>
          <div class="bg-red-50 p-4 rounded-xl flex items-center justify-between border border-red-100">
            <span class="text-sm font-semibold text-red-700 flex items-center gap-2"><HelpCircle class="w-4 h-4"/> Belum</span>
            <span class="font-black text-lg text-red-700">{{ examStore.unansweredCount }}</span>
          </div>
          <div class="bg-amber-50 p-4 rounded-xl flex items-center justify-between border border-amber-100">
            <span class="text-sm font-semibold text-amber-700 flex items-center gap-2"><Flag class="w-4 h-4"/> Ditandai</span>
            <span class="font-black text-lg text-amber-700">{{ examStore.flaggedCount }}</span>
          </div>
        </div>

        <!-- Grid -->
        <div class="md:col-span-3">
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Navigasi Soal</h2>
          <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            <button
              v-for="(q, index) in questions"
              :key="q.id"
              @click="goToQuestion(index)"
              class="relative aspect-square flex items-center justify-center font-bold text-sm sm:text-base rounded-xl transition-all border-2 group"
              :class="{
                'bg-white border-slate-200 text-slate-500 hover:border-slate-400': getQuestionStatus(q) === 'unanswered',
                'bg-green-500 border-green-600 text-white shadow-sm hover:bg-green-600': getQuestionStatus(q) === 'answered',
                'bg-amber-400 border-amber-500 text-amber-900 shadow-sm hover:bg-amber-500': getQuestionStatus(q) === 'flagged',
              }"
            >
              {{ index + 1 }}
              <div v-if="getQuestionStatus(q) === 'flagged'" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Flag class="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Submit Action -->
      <div class="flex justify-end mt-4">
        <button 
          @click="showFinishModal = true"
          :disabled="isSubmitting"
          class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-lg shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-3 disabled:opacity-50"
        >
          <span v-if="isSubmitting" class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span>
          {{ isSubmitting ? 'Mengirim Jawaban...' : 'Selesaikan Ujian' }}
        </button>
      </div>

    </main>

    <FinishExamModal 
      :isOpen="showFinishModal"
      @close="showFinishModal = false"
      @confirm="submitExam"
    />

  </div>
</template>
