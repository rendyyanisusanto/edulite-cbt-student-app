<script setup>
import { ref, computed } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-vue-next'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])
const examStore = useExamAttemptStore()

const answeredCount = computed(() => examStore.answeredCount)
const unansweredCount = computed(() => examStore.unansweredCount)
const flaggedCount = computed(() => examStore.flaggedCount)
const total = computed(() => examStore.totalQuestions)

const isChecked = ref(false)

const onConfirm = () => {
  if (isChecked.value) {
    emit('confirm')
  }
}
</script>

<template>
  <div 
    v-if="isOpen" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
  >
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Header -->
      <div class="p-6 text-center border-b border-slate-100">
        <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" :class="unansweredCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'">
          <AlertTriangle v-if="unansweredCount > 0" class="w-8 h-8" />
          <HelpCircle v-else class="w-8 h-8" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Selesaikan Ujian?</h3>
        <p v-if="unansweredCount > 0" class="text-sm font-bold text-red-500">
          Masih ada {{ unansweredCount }} soal yang belum dijawab.
        </p>
        <p v-else class="text-sm text-slate-500 font-medium">
          Anda akan menyelesaikan ujian ini dan jawaban akan dikirim.
        </p>
      </div>
      
      <!-- Summary -->
      <div class="px-6 py-5 bg-slate-50/50">
        <div class="space-y-3">
          <div class="flex justify-between items-center text-sm font-semibold text-slate-700">
            <span>Total Soal</span>
            <span class="font-bold text-slate-900">{{ total }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-green-700">
            <span>Sudah Dijawab</span>
            <span class="font-bold text-green-700">{{ answeredCount }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-red-600">
            <span>Belum Dijawab</span>
            <span class="font-bold text-red-600">{{ unansweredCount }}</span>
          </div>
          <div class="flex justify-between items-center text-sm font-semibold text-amber-600">
            <span>Ditandai (Ragu-ragu)</span>
            <span class="font-bold text-amber-600">{{ flaggedCount }}</span>
          </div>
        </div>
      </div>

      <!-- Confirmation -->
      <div class="p-6 border-t border-slate-100">
        <label class="flex items-start gap-3 cursor-pointer group mb-6">
          <div class="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              v-model="isChecked"
              class="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors peer"
            />
          </div>
          <span class="text-sm font-bold text-slate-700 group-hover:text-slate-900 leading-tight pt-0.5">
            Saya yakin ingin mengakhiri ujian dan mengirimkan jawaban.
          </span>
        </label>

        <div class="flex gap-3">
          <button 
            @click="emit('close')"
            class="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Kembali Periksa
          </button>
          <button 
            @click="onConfirm"
            :disabled="!isChecked"
            class="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Selesaikan
          </button>
        </div>
      </div>

    </div>
  </div>
</template>
