<script setup>
import { computed } from 'vue'

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const onSelect = () => {
  emit('select', props.option.id)
}
</script>

<template>
  <button 
    @click="onSelect"
    class="w-full text-left group flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 outline-none"
    :class="[
      isSelected 
        ? 'border-blue-600 bg-blue-50/50 shadow-[0_2px_12px_rgb(37,99,235,0.1)]' 
        : 'border-slate-200 bg-white hover:border-blue-300 focus:border-blue-400'
    ]"
  >
    <!-- Label Circle -->
    <div 
      class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-colors mt-0.5"
      :class="[
        isSelected
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-slate-50 border-slate-300 text-slate-600 group-hover:border-blue-400 group-hover:text-blue-600'
      ]"
    >
      {{ option.displayKey }}
    </div>

    <!-- Text -->
    <div 
      class="flex-1 text-[15px] sm:text-base leading-relaxed pt-1"
      :class="[
        isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'
      ]"
    >
      {{ option.text }}
    </div>
  </button>
</template>
