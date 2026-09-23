<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentExamStore } from '@/stores/studentExam'
import { ArrowLeft } from 'lucide-vue-next'

import StudentIdentityCard from '@/components/student/StudentIdentityCard.vue'
import ExamInfoCard from '@/components/student/ExamInfoCard.vue'
import ExamInstruction from '@/components/student/ExamInstruction.vue'
import ExamTokenForm from '@/components/student/ExamTokenForm.vue'

const route = useRoute()
const router = useRouter()
const examStore = useStudentExamStore()

const scheduleId = Number(route.params.scheduleId)

const exam = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    exam.value = await examStore.fetchExamDetail(scheduleId)
  } catch (error) {
    router.replace('/dashboard')
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="max-w-4xl mx-auto pb-10 px-4 sm:px-0">
    <!-- Top Action -->
    <button 
      @click="goBack"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm mb-6"
    >
      <ArrowLeft class="w-4 h-4" />
      Kembali ke Dashboard
    </button>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-200">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p class="text-slate-500 font-medium">Memuat informasi ujian...</p>
    </div>

    <div v-else-if="exam">
      <!-- Header -->
      <div class="mb-8">
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Informasi Ujian</h2>
        <p class="text-slate-500 font-medium mt-1">Pastikan data dan informasi ujian berikut sudah benar.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        <!-- Left Column -->
        <div class="space-y-6">
          <StudentIdentityCard :student="exam.student" />
          <ExamInstruction />
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <ExamInfoCard :exam="exam" />
          <ExamTokenForm :exam="exam" :scheduleId="scheduleId" />
        </div>

      </div>
    </div>
  </div>
</template>
