<script setup>
import { computed } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'
import ExamStatusLegend from './ExamStatusLegend.vue'

const emit = defineEmits(['finish'])
const examStore = useExamAttemptStore()

const questions = computed(() => examStore.questions)
const activeId = computed(() => examStore.currentQuestion?.id)
const answers = computed(() => examStore.answers)

const answeredCount = computed(() => examStore.answeredCount)
const unansweredCount = computed(() => examStore.unansweredCount)
const flaggedCount = computed(() => examStore.flaggedCount)
const total = computed(() => examStore.totalQuestions)

const goTo = (index) => {
  examStore.goToQuestion(index)
}

const getStatusClass = (qId) => {
  const isActive = qId === activeId.value
  const ans = answers.value[qId]
  const isFlagged = ans?.isFlagged
  let isAnswered = false
  
  if (ans) {
    if (ans.selectedOptionId) isAnswered = true
    if (typeof ans.answerText === 'string' && ans.answerText.trim() !== '') isAnswered = true
  }

  if (isActive) {
    return 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600 ring-offset-2'
  }
  if (isFlagged) {
    return 'bg-amber-400 text-amber-900 border-amber-500'
  }
  if (isAnswered) {
    return 'bg-green-500 text-white border-green-600'
  }
  
  return 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[calc(100vh-6rem)] sticky top-20">
    
    <!-- Header Summary -->
    <div class="p-5 border-b border-slate-100">
      <h3 class="font-bold text-slate-900 mb-3">Daftar Soal</h3>
      
      <div class="flex gap-4">
        <div>
          <div class="text-xl font-black text-slate-900">{{ answeredCount }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dijawab</div>
        </div>
        <div>
          <div class="text-xl font-black text-slate-900">{{ unansweredCount }}</div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum</div>
        </div>
        <div v-if="flaggedCount > 0">
          <div class="text-xl font-black text-amber-500">{{ flaggedCount }}</div>
          <div class="text-[10px] font-bold text-amber-500/70 uppercase tracking-wider">Ditandai</div>
        </div>
      </div>
    </div>

    <!-- Grid -->
    <div class="p-5 overflow-y-auto flex-1">
      <div class="grid grid-cols-5 gap-2.5">
        <button 
          v-for="(q, idx) in questions" 
          :key="q.id"
          @click="goTo(idx)"
          class="w-full aspect-square rounded-lg flex items-center justify-center text-sm font-bold border transition-all"
          :class="getStatusClass(q.id)"
        >
          {{ idx + 1 }}
        </button>
      </div>

      <ExamStatusLegend />
    </div>

    <!-- Finish Action -->
    <div class="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
      <button 
        @click="emit('finish')"
        class="w-full py-3 bg-white border-2 border-red-500 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        Selesaikan Ujian
      </button>
    </div>

  </div>
</template>
