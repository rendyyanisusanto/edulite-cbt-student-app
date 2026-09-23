import { defineStore } from 'pinia'
import api from '@/services/api'
import router from '@/router'

export const useStudentAuthStore = defineStore('studentAuth', {
  state: () => ({
    student: null,
    accessToken: localStorage.getItem('cbt_student_access_token') || null,
    loading: false,
    isAuthenticated: !!localStorage.getItem('cbt_student_access_token'),
  }),
  actions: {
    async login(credentials) {
      this.loading = true
      try {
        const response = await api.post('/student/auth/login', credentials)
        const data = response.data.data
        this.student = data.student
        this.accessToken = data.accessToken
        this.isAuthenticated = true
        localStorage.setItem('cbt_student_access_token', this.accessToken)
        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || 'Login gagal.'
        }
      } finally {
        this.loading = false
      }
    },
    async fetchMe() {
      try {
        const response = await api.get('/student/auth/me')
        this.student = response.data.data.student
        this.isAuthenticated = true
      } catch (error) {
        this.clearSession()
        router.push('/login')
      }
    },
    async restoreSession() {
      if (this.accessToken) {
        await this.fetchMe()
      } else {
        this.isAuthenticated = false
      }
    },
    async logout() {
      try {
        if (this.accessToken) {
          await api.post('/student/auth/logout')
        }
      } catch (e) {
        // Ignore error on logout
      } finally {
        this.clearSession()
        router.push('/login')
      }
    },
    clearSession() {
      this.student = null
      this.accessToken = null
      this.isAuthenticated = false
      localStorage.removeItem('cbt_student_access_token')
    }
  }
})
