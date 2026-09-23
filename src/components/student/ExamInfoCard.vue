<script setup>
import { Calendar, Clock, BookOpen, FileText } from 'lucide-vue-next'

const props = defineProps({
  exam: {
    type: Object,
    required: true
  }
})

const formatTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
      <h3 class="text-base font-bold text-slate-900">Informasi Tes</h3>
    </div>
    
    <div class="p-5 flex flex-col gap-4">
      
      <div class="flex flex-col mb-1">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ujian</div>
        <div class="text-base font-bold text-slate-900">{{ exam.exam.title }}</div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Mata Pelajaran</div>
          <div class="text-sm font-bold text-slate-900">{{ exam.subject.name }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <Calendar class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Hari / Tanggal</div>
          <div class="text-sm font-bold text-slate-900">{{ formatDate(exam.schedule.startAt) }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <Clock class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Waktu</div>
          <div class="text-sm font-bold text-slate-900">{{ formatTime(exam.schedule.startAt) }} - {{ formatTime(exam.schedule.endAt) }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <FileText class="w-4 h-4" />
        </div>
        <div class="w-full">
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Jumlah Soal</div>
          <div class="flex gap-4">
            <div>
              <div class="text-xl font-extrabold text-slate-900">{{ exam.questionSummary.total }}</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Total</div>
            </div>
            <div class="w-px bg-slate-200"></div>
            <div>
              <div class="text-xl font-extrabold text-slate-900">{{ exam.questionSummary.choice }}</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">PG</div>
            </div>
            <div class="w-px bg-slate-200"></div>
            <div>
              <div class="text-xl font-extrabold text-slate-900">{{ exam.questionSummary.essay }}</div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Essay</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
