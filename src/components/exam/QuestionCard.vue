<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'
import ChoiceOption from './ChoiceOption.vue'
import EssayAnswer from './EssayAnswer.vue'

const examStore = useExamAttemptStore()

const question = computed(() => examStore.currentQuestion)
const answer = computed(() => {
  if (!question.value) return ''
  const ans = examStore.answers[question.value.id]
  if (!ans) return ''
  if (question.value.questionType === 'SINGLE_CHOICE') return ans.selectedOptionId
  if (question.value.questionType === 'ESSAY') return ans.answerText || ''
  return ''
})

const setAnswerChoice = (val) => {
  examStore.setChoiceAnswer(question.value.id, val)
}

const setAnswerEssay = (val) => {
  examStore.setEssayAnswerLocal(question.value.id, val)
}

// Keyboard shortcuts for Single Choice
const handleKeydown = (e) => {
  // Don't trigger if user is typing in an input or textarea
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

  if (question.value?.questionType === 'SINGLE_CHOICE') {
    const key = e.key.toUpperCase()
    const options = question.value.options || []
    const option = options.find(o => o.displayKey === key)
    
    if (option) {
      setAnswerChoice(option.id)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div v-if="question" class="bg-white rounded-2xl shadow-sm border border-slate-200">
    
    <!-- Header -->
    <div class="px-5 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex justify-between items-center">
      <div>
        <h2 class="text-lg sm:text-xl font-bold text-slate-900">Soal {{ examStore.currentQuestionIndex + 1 }}</h2>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
          {{ question.questionType === 'SINGLE_CHOICE' ? 'Pilihan Ganda' : 'Essay' }}
        </p>
      </div>
    </div>

    <!-- Question Content -->
    <div class="p-5 sm:p-8">
      
      <!-- Text -->
      <div class="text-[16px] sm:text-[18px] md:text-[20px] leading-relaxed text-slate-900 mb-8 prose prose-lg max-w-none" v-html="question.questionText">
      </div>

      <!-- Image -->
      <div v-if="question.mediaUrl" class="mb-8">
        <img :src="question.mediaUrl" alt="Gambar Soal" class="max-h-64 sm:max-h-96 rounded-lg border border-slate-200 shadow-sm object-contain" />
      </div>

      <!-- Options / Answer Area -->
      <div v-if="question.questionType === 'SINGLE_CHOICE'" class="space-y-3">
        <ChoiceOption 
          v-for="opt in question.options" 
          :key="opt.id"
          :option="opt"
          :isSelected="answer === opt.id"
          @select="setAnswerChoice"
        />
      </div>

      <div v-else-if="question.questionType === 'ESSAY'">
        <EssayAnswer 
          :modelValue="answer"
          :questionId="question.id"
          @update:modelValue="setAnswerEssay"
        />
      </div>

    </div>

  </div>
</template>
