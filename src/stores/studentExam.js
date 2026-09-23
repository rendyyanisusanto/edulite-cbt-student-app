import { defineStore } from 'pinia'
import api from '@/services/api'

export const useStudentExamStore = defineStore('studentExam', {
  state: () => ({
    exams: [],
    currentExamDetail: null,
    tokenVerificationState: {},
    loading: false,
    error: null,
    lastFetchedAt: null,
  }),
  getters: {
    availableExams: (state) => state.exams.filter(e => e.status === 'AVAILABLE'),
    upcomingExams: (state) => state.exams.filter(e => e.status === 'UPCOMING'),
    inProgressExams: (state) => state.exams.filter(e => e.status === 'IN_PROGRESS'),
    completedExams: (state) => state.exams.filter(e => e.status === 'COMPLETED'),
  },
  actions: {
    async fetchExams() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/student/exams')
        this.exams = response.data.data.items || []
        this.lastFetchedAt = new Date()
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat daftar ujian.'
      } finally {
        this.loading = false
      }
    },
    async fetchExamDetail(scheduleId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/student/exams/${scheduleId}`)
        this.currentExamDetail = response.data.data
        return this.currentExamDetail
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat detail ujian.'
        throw err
      } finally {
        this.loading = false
      }
    },
    async verifyToken(scheduleId, token) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(`/student/exams/${scheduleId}/verify-token`, { token })
        if (response.data.success) {
          this.tokenVerificationState[scheduleId] = token // store the actual token
          return true
        }
        return false
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal verifikasi token.'
        throw err
      } finally {
        this.loading = false
      }
    },
    async startAttempt(scheduleId, token) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post(`/student/exams/${scheduleId}/start`, { token })
        return response.data.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memulai ujian.'
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
