<script setup>
import { User, Key, LayoutGrid } from 'lucide-vue-next'

defineProps({
  student: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
    <div class="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
      <h3 class="text-base font-bold text-slate-900">Data Peserta</h3>
    </div>
    
    <div class="p-5 flex flex-col gap-4">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <User class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Nama</div>
          <div class="text-sm font-bold text-slate-900">{{ student.name || '-' }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <Key class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">NIS / Username</div>
          <div class="text-sm font-bold text-slate-900">{{ student.username || '-' }}</div>
        </div>
      </div>

      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
          <LayoutGrid class="w-4 h-4" />
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Kelas</div>
          <div class="text-sm font-bold text-slate-900">{{ student.class?.name || '-' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
