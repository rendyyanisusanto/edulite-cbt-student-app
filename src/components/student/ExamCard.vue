<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Calendar, FileText, ArrowRight } from 'lucide-vue-next'

const props = defineProps({
  exam: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const onActionClick = () => {
  if (props.exam.status === 'AVAILABLE' || props.exam.status === 'IN_PROGRESS') {
    router.push(`/exams/${props.exam.scheduleId}`)
  }
}
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] hover:border-blue-300 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden transition-all duration-300 group">
    
    <div class="p-6 flex flex-col h-full">
      
      <!-- Status Badge & Top Info -->
      <div class="flex items-start justify-between mb-5">
        <div>
          <div class="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[11px] font-bold tracking-wider uppercase mb-3">
            {{ exam.subject.name }}
          </div>
          <h3 class="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" :title="exam.exam.title">
            {{ exam.exam.title }}
          </h3>
          <div class="text-sm font-medium text-slate-400">
            Kelas {{ exam.class.name }}
          </div>
        </div>

      <div class="shrink-0 ml-3">
        <span v-if="exam.status === 'AVAILABLE'" class="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Tersedia
        </span>
        <span v-else-if="exam.status === 'IN_PROGRESS'" class="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Sedang Dikerjakan
        </span>
        <span v-else-if="exam.status === 'UPCOMING'" class="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Akan Datang
        </span>
        <span v-else-if="exam.status === 'COMPLETED'" class="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Selesai
        </span>
        <span v-else-if="exam.status === 'EXPIRED'" class="px-2.5 py-1 bg-slate-100 text-slate-500 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Waktu Habis
        </span>
        <span v-else-if="exam.status === 'BLOCKED'" class="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
          Tidak Diizinkan
        </span>
      </div>
    </div>

    <!-- Exam Details Grid -->
    <div class="grid grid-cols-2 gap-y-4 mt-5 flex-1 bg-slate-50/50 p-4 rounded-2xl">
      <div class="flex items-center gap-2.5 text-slate-600">
        <div class="w-7 h-7 rounded-full bg-blue-100/50 flex items-center justify-center">
          <Calendar class="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span class="text-[13px] font-semibold">{{ formatDate(exam.schedule.startAt) }}</span>
      </div>
      <div class="flex items-center gap-2.5 text-slate-600">
        <div class="w-7 h-7 rounded-full bg-blue-100/50 flex items-center justify-center">
          <Clock class="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span class="text-[13px] font-semibold">{{ formatTime(exam.schedule.startAt) }} - {{ formatTime(exam.schedule.endAt) }}</span>
      </div>
      <div class="flex items-center gap-2.5 text-slate-600">
        <div class="w-7 h-7 rounded-full bg-blue-100/50 flex items-center justify-center">
          <Clock class="w-3.5 h-3.5 text-blue-600" />
        </div>
        <span class="text-[13px] font-semibold">{{ exam.durationMinutes }} Menit</span>
      </div>
      <div class="flex items-center gap-2.5 text-slate-600">
        <div class="w-7 h-7 rounded-full bg-blue-100/50 flex items-center justify-center">
          <FileText class="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div class="text-[13px] font-semibold flex gap-1">
          <span v-if="exam.questionSummary.choice > 0">{{ exam.questionSummary.choice }} PG</span>
          <span v-if="exam.questionSummary.choice > 0 && exam.questionSummary.essay > 0">•</span>
          <span v-if="exam.questionSummary.essay > 0">{{ exam.questionSummary.essay }} Esai</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="mt-6 mt-auto">
      <button 
        v-if="exam.status === 'AVAILABLE'"
        @click="onActionClick"
        class="w-full py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:ring-4 focus:ring-blue-200 transition-all duration-300 flex justify-center items-center gap-2"
      >
        Masuk Ujian
        <ArrowRight class="w-4 h-4" />
      </button>

      <button 
        v-else-if="exam.status === 'IN_PROGRESS'"
        @click="onActionClick"
        class="w-full py-3 bg-amber-500 text-white rounded-2xl text-sm font-bold hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 focus:ring-4 focus:ring-amber-200 transition-all duration-300 flex justify-center items-center gap-2"
      >
        Lanjutkan Ujian
        <ArrowRight class="w-4 h-4" />
      </button>

      <!-- Inactive states -->
      <div v-else-if="exam.status === 'COMPLETED'" class="py-3 px-4 text-center text-sm font-bold text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
        Telah Diselesaikan
      </div>
      <div v-else-if="exam.status === 'UPCOMING'" class="py-3 px-4 text-center text-sm font-bold text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 opacity-70">
        Belum Dibuka
      </div>
      <div v-else-if="exam.status === 'EXPIRED'" class="py-3 px-4 text-center text-sm font-bold text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 opacity-70">
        Waktu Ujian Berakhir
      </div>
      <div v-else class="py-3 px-4 text-center text-sm font-bold text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 opacity-70">
        Tidak Tersedia
      </div>
    </div>

    </div>
  </div>
</template>
