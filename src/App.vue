<script setup>
import { onMounted } from 'vue'
import { useStudentAuthStore } from '@/stores/studentAuth'

const authStore = useStudentAuthStore()

onMounted(async () => {
  await authStore.restoreSession()
})
</script>

<template>
  <RouterView />
</template>
