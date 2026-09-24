<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useExamAttemptStore } from '@/stores/examAttempt'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    default: ''
  },
  questionId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'update:fileUrl'])
const examStore = useExamAttemptStore()
import api from '@/services/api'
import { Image as ImageIcon, X as XIcon } from 'lucide-vue-next'

const answerText = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  if (newVal !== answerText.value) {
    answerText.value = newVal
  }
})

const onInput = () => {
  emit('update:modelValue', answerText.value)
}

const isUploading = ref(false)
const uploadError = ref('')

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'Ukuran gambar maksimal 5MB'
    return
  }
  
  uploadError.value = ''
  isUploading.value = true
  
  try {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async (e) => {
      try {
        const { data } = await api.post('/upload/image', { image: e.target.result })
        emit('update:fileUrl', data.data.url)
        isUploading.value = false
      } catch (err) {
        uploadError.value = 'Gagal mengunggah gambar'
        isUploading.value = false
      }
    }
  } catch (err) {
    uploadError.value = 'Gagal memproses gambar'
    isUploading.value = false
  }
}

const removeFile = () => {
  emit('update:fileUrl', '')
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
    
    <!-- File Upload Section -->
    <div class="mt-4 border-t border-slate-100 pt-4">
      <div v-if="fileUrl" class="relative inline-block">
        <img :src="fileUrl" class="max-h-48 rounded-lg border border-slate-200" alt="Jawaban Gambar" />
        <button type="button" @click="removeFile" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
          <XIcon class="w-4 h-4" />
        </button>
      </div>
      <div v-else>
        <label class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer transition-colors" :class="{ 'opacity-50 cursor-not-allowed': isUploading }">
          <span v-if="isUploading" class="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
          <ImageIcon v-else class="w-4 h-4" />
          {{ isUploading ? 'Mengunggah...' : 'Lampirkan Gambar Jawaban' }}
          <input type="file" class="hidden" accept="image/jpeg, image/png, image/jpg" @change="handleFileUpload" :disabled="isUploading" />
        </label>
        <p v-if="uploadError" class="mt-1 text-xs text-red-500">{{ uploadError }}</p>
      </div>
    </div>
    
    <div class="mt-4 flex items-center justify-end text-xs font-medium">
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
