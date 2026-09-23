<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { KeyRound, ArrowRight, CheckCircle, XCircle } from 'lucide-vue-next'
import { useStudentExamStore } from '@/stores/studentExam'

const props = defineProps({
  scheduleId: {
    type: [String, Number],
    required: true
  },
  exam: {
    type: Object,
    required: true
  }
})

const router = useRouter()
const examStore = useStudentExamStore()

const token = ref('')
const state = ref('default') // default, loading, valid, invalid
const errorMessage = ref('')

onMounted(() => {
  if (props.exam.status === 'IN_PROGRESS' || examStore.tokenVerificationState[props.scheduleId]) {
    state.value = 'valid'
  }
})

const verifyToken = async () => {
  if (!token.value) return
  if (props.exam.status !== 'AVAILABLE') return
  
  state.value = 'loading'
  
  try {
    const isValid = await examStore.verifyToken(props.scheduleId, token.value)
    if (isValid) {
      state.value = 'valid'
    } else {
      state.value = 'invalid'
      errorMessage.value = examStore.error || 'Token ujian tidak sesuai.'
    }
  } catch (error) {
    state.value = 'invalid'
    errorMessage.value = examStore.error || 'Terjadi kesalahan saat memverifikasi token.'
  }
}

const proceedToConfirmation = () => {
  router.push(`/exams/${props.scheduleId}/confirmation`)
}
</script>

<template>
  <div class="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm mt-6">
    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <KeyRound class="w-4 h-4 text-slate-500" />
        Akses Ujian
      </h3>
      <span v-if="exam.status === 'UPCOMING'" class="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
        Belum Dibuka
      </span>
      <span v-else-if="exam.status === 'COMPLETED'" class="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
        Selesai
      </span>
    </div>
    
    <div class="p-6 md:p-8 flex flex-col items-center justify-center text-center">
      
      <template v-if="exam.status === 'AVAILABLE' || exam.status === 'IN_PROGRESS'">
        <p v-if="state === 'default'" class="text-sm font-medium text-slate-600 mb-6">
          Masukkan token yang diberikan oleh pengawas untuk masuk ke dalam ujian.
        </p>

        <div v-if="state === 'valid'" class="mb-6 flex flex-col items-center text-green-600">
          <CheckCircle class="w-12 h-12 mb-3" />
          <span class="text-lg font-bold">{{ exam.status === 'IN_PROGRESS' ? 'Ujian Sedang Berlangsung' : 'Token Valid' }}</span>
        </div>

        <div v-else-if="state === 'invalid'" class="mb-6 flex flex-col items-center text-red-500 max-w-sm">
          <XCircle class="w-12 h-12 mb-3" />
          <span class="text-sm font-bold">{{ errorMessage }}</span>
        </div>

        <div v-if="state !== 'valid'" class="w-full max-w-xs space-y-4">
          <input 
            v-model="token"
            @keyup.enter="verifyToken"
            type="text" 
            placeholder="XXXXX"
            class="w-full text-center text-3xl font-black tracking-[0.5em] uppercase px-4 py-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            :class="{'border-red-300 focus:border-red-500 focus:ring-red-500/10': state === 'invalid'}"
            :disabled="state === 'loading'"
          />
          
          <button 
            @click="verifyToken"
            :disabled="state === 'loading' || !token"
            class="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="state === 'loading'">Memeriksa token...</span>
            <span v-else>Verifikasi Token</span>
          </button>
        </div>

        <div v-else class="w-full max-w-xs space-y-4">
          <button 
            @click="proceedToConfirmation"
            class="w-full py-3 bg-blue-600 text-white rounded-xl text-base font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            {{ exam.status === 'IN_PROGRESS' ? 'Lanjutkan Ujian' : 'Lanjutkan' }}
            <ArrowRight class="w-5 h-5" />
          </button>
        </div>
      </template>

      <template v-else-if="exam.status === 'UPCOMING'">
        <div class="mb-2 flex flex-col items-center text-slate-400">
          <span class="text-lg font-bold">Ujian Belum Dimulai</span>
        </div>
        <p class="text-sm font-medium text-slate-500">
          Silakan tunggu waktu ujian dimulai untuk memasukkan token.
        </p>
      </template>

      <template v-else-if="exam.status === 'COMPLETED'">
        <div class="mb-2 flex flex-col items-center text-green-600">
          <CheckCircle class="w-12 h-12 mb-3" />
          <span class="text-lg font-bold">Ujian Telah Selesai</span>
        </div>
        <p class="text-sm font-medium text-slate-500">
          Anda telah menyelesaikan ujian ini.
        </p>
      </template>
      
      <template v-else>
        <div class="mb-2 flex flex-col items-center text-red-500">
          <XCircle class="w-12 h-12 mb-3" />
          <span class="text-lg font-bold">Tidak Tersedia</span>
        </div>
        <p class="text-sm font-medium text-slate-500">
          Akses ujian telah berakhir atau dibatasi.
        </p>
      </template>
      
    </div>
  </div>
</template>
