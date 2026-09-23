<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExamAttemptStore } from '@/stores/examAttempt'
import { Flag, ArrowLeft, ArrowRight, LayoutGrid } from 'lucide-vue-next'

import ExamHeader from '@/components/exam/ExamHeader.vue'
import QuestionCard from '@/components/exam/QuestionCard.vue'
import QuestionNavigator from '@/components/exam/QuestionNavigator.vue'
import QuestionNavigatorDrawer from '@/components/exam/QuestionNavigatorDrawer.vue'
import FinishExamModal from '@/components/exam/FinishExamModal.vue'

const router = useRouter()
const route = useRoute()
const examStore = useExamAttemptStore()

const isMobileDrawerOpen = ref(false)
const showFinishModal = ref(false)

const isFirst = computed(() => examStore.isFirstQuestion)
const isLast = computed(() => examStore.isLastQuestion)
const activeId = computed(() => examStore.currentQuestion?.id)
const isFlagged = computed(() => examStore.answers[activeId.value]?.isFlagged)

const isOffline = ref(!navigator.onLine)
const showOnlineBanner = ref(false)
let onlineTimeout = null

const handleOffline = () => {
  isOffline.value = true
}

const handleOnline = async () => {
  isOffline.value = false
  showOnlineBanner.value = true
  
  // Try to sync pending drafts
  await examStore.retrySync()
  
  if (onlineTimeout) clearTimeout(onlineTimeout)
  onlineTimeout = setTimeout(() => {
    showOnlineBanner.value = false
  }, 5000)
}

onMounted(async () => {
  try {
    const attemptId = route.params.attemptId;
    await examStore.fetchAttempt(attemptId);
    await examStore.fetchQuestions(attemptId);
    
    // Check if attempt is expired or finished
    if (examStore.attempt?.status === 'COMPLETED') {
      router.replace('/exam/finished')
    }
  } catch (error) {
    router.replace('/dashboard')
  }
  
  window.addEventListener('offline', handleOffline)
  window.addEventListener('online', handleOnline)
})

onUnmounted(() => {
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('online', handleOnline)
  if (onlineTimeout) clearTimeout(onlineTimeout)
})

const onPrev = () => {
  examStore.prevQuestion()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const onNext = () => {
  if (isLast.value) {
    onFinish()
  } else {
    examStore.nextQuestion()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const toggleFlag = () => {
  examStore.toggleFlag(activeId.value)
}

const onFinish = () => {
  router.push(`/exam/${route.params.attemptId}/review`)
}

// Submitting is now done in Review page, so submitExam can be removed from here, or kept if FinishExamModal is still used here.
// But we will move FinishExamModal to ReviewView.
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans relative">
    
    <ExamHeader />

    <!-- Connection Recovery Banners -->
    <div v-if="isOffline" class="bg-red-500 text-white px-4 py-2 text-center text-sm font-semibold sticky top-14 sm:top-16 z-30 shadow-sm flex flex-col items-center justify-center">
      <span>Koneksi internet terputus.</span>
      <span class="font-normal text-xs mt-0.5">Jawaban sementara disimpan di perangkat. Jangan menutup halaman ujian.</span>
    </div>
    <div v-else-if="showOnlineBanner" class="bg-green-500 text-white px-4 py-2 text-center text-sm font-semibold sticky top-14 sm:top-16 z-30 shadow-sm flex flex-col items-center justify-center">
      <span>Koneksi kembali tersedia.</span>
      <span class="font-normal text-xs mt-0.5">Semua jawaban telah tersimpan dan disinkronkan.</span>
    </div>

    <main class="flex-1 w-full px-4 sm:px-6 md:px-8 py-6 pb-24 sm:pb-10 flex gap-6">
      
      <div v-if="examStore.loading" class="flex-1 flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-300 shadow-sm">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-slate-500 font-medium">Memuat sesi ujian...</p>
      </div>

      <template v-else>
        <!-- Left / Main Content -->
        <div class="flex-1 min-w-0 flex flex-col">
          <QuestionCard />
          
          <!-- Desktop Footer Actions -->
          <div class="hidden sm:flex mt-6 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <button 
              @click="onPrev"
              :disabled="isFirst"
              class="px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              :class="isFirst ? 'bg-slate-100 text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            >
              <ArrowLeft class="w-4 h-4" />
              Sebelumnya
            </button>

            <button 
              @click="toggleFlag"
              class="px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors border-2"
              :class="isFlagged ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'"
            >
              <Flag class="w-4 h-4" :class="{'fill-amber-500 text-amber-500': isFlagged}" />
              {{ isFlagged ? 'Ditandai' : 'Tandai Soal' }}
            </button>

            <button 
              @click="onNext"
              class="px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              :class="isLast ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-blue-600 text-white hover:bg-blue-700'"
            >
              {{ isLast ? 'Periksa Jawaban' : 'Selanjutnya' }}
              <ArrowRight v-if="!isLast" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right Navigator (Desktop) -->
        <div class="hidden md:block w-72 lg:w-80 shrink-0">
          <QuestionNavigator @finish="onFinish" />
        </div>
      </template>

    </main>

    <!-- Mobile Sticky Footer -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgb(0,0,0,0.05)] z-40 px-4 py-3 flex items-center justify-between gap-2">
      <button 
        @click="onPrev"
        :disabled="isFirst"
        class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 disabled:opacity-50"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>

      <button 
        @click="isMobileDrawerOpen = true"
        class="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200 text-sm"
      >
        <LayoutGrid class="w-4 h-4" />
        Daftar Soal
      </button>

      <button 
        @click="toggleFlag"
        class="w-12 h-12 flex items-center justify-center rounded-xl transition-colors border"
        :class="isFlagged ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-slate-300 text-slate-500'"
      >
        <Flag class="w-5 h-5" :class="{'fill-amber-500 text-amber-500': isFlagged}" />
      </button>

      <button 
        @click="onNext"
        class="w-12 h-12 flex items-center justify-center rounded-xl text-white disabled:opacity-50"
        :class="isLast ? 'bg-green-600' : 'bg-blue-600'"
      >
        <span v-if="isLast" class="text-xs font-bold px-1">Cek</span>
        <ArrowRight v-else class="w-5 h-5" />
      </button>
    </div>

    <QuestionNavigatorDrawer 
      :isOpen="isMobileDrawerOpen" 
      @close="isMobileDrawerOpen = false" 
      @finish="onFinish"
    />

    <!-- Modal moved to ReviewView -->

  </div>
</template>
