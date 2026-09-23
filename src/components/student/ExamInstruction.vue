<script setup>
import { Info } from 'lucide-vue-next'
</script>

<template>
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-5">
    <div class="flex items-center gap-2 mb-3">
      <Info class="w-5 h-5 text-blue-600" />
      <h3 class="text-base font-bold text-blue-900">Petunjuk Ujian</h3>
    </div>
    
    <ul class="space-y-2 text-sm text-blue-800 ml-1">
      <li class="flex items-start gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
        <span>Pastikan koneksi internet stabil selama mengerjakan ujian.</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
        <span>Baca soal dengan teliti. Anda dapat berpindah antar soal dengan bebas.</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
        <span>Jawaban Anda akan tersimpan secara otomatis.</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
        <span>Waktu ujian akan mulai dihitung setelah Anda menekan tombol "Mulai Ujian".</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5"></span>
        <span>Pastikan semua jawaban telah diperiksa sebelum mengakhiri ujian.</span>
      </li>
    </ul>
  </div>
</template>
