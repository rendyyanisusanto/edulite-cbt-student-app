<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  questionId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
const examStore = useExamAttemptStore()

const answerText = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== answerText.value) {
    answerText.value = newVal
  }
})

const onInput = () => {
  emit('update:modelValue', answerText.value)
}

const textareaRef = ref(null)

onMounted(() => {
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
})

const saveStatus = computed(() => examStore.savingState[props.questionId])
</script>

<template>
  <div class="w-full">
    <textarea
      ref="textareaRef"
      v-model="answerText"
      @input="onInput"
      placeholder="Ketik jawaban Anda di sini..."
      class="w-full min-h-[180px] sm:min-h-[280px] p-4 text-[15px] sm:text-base leading-relaxed text-slate-900 bg-white border-2 border-slate-200 rounded-xl resize-y focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
    ></textarea>
    
    <div class="mt-2 flex items-center justify-end text-xs font-medium">
      <span v-if="saveStatus === 'saving'" class="text-blue-500 flex items-center gap-1">
        <span class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
        Menyimpan...
      </span>
      <span v-else-if="saveStatus === 'saved'" class="text-green-600 flex items-center gap-1">
        ✓ Tersimpan
      </span>
      <span v-else-if="saveStatus === 'error'" class="text-red-500 flex items-center gap-1">
        ! Gagal menyimpan (tersimpan lokal)
      </span>
      <span v-else class="text-slate-400">
        {{ answerText.length > 0 ? '✓ Tersimpan (lokal)' : 'Otomatis menyimpan saat mengetik' }}
      </span>
    </div>
  </div>
</template>
