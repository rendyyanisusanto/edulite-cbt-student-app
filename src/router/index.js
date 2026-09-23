import { createRouter, createWebHistory } from 'vue-router'
import { useStudentAuthStore } from '@/stores/studentAuth'

import StudentLayout from '@/layouts/StudentLayout.vue'
import ExamRunnerLayout from '@/layouts/ExamRunnerLayout.vue'

import StudentLoginView from '@/views/auth/StudentLoginView.vue'
import StudentDashboardView from '@/views/student/StudentDashboardView.vue'
import ExamInfoView from '@/views/student/ExamInfoView.vue'
import ExamConfirmationView from '@/views/student/ExamConfirmationView.vue'
import ExamRunnerView from '@/views/student/ExamRunnerView.vue'
import ExamReviewView from '@/views/student/ExamReviewView.vue'
import ExamFinishedView from '@/views/student/ExamFinishedView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'student-login',
      component: StudentLoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: StudentLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'student-dashboard',
          component: StudentDashboardView
        },
        {
          path: 'exams/:scheduleId',
          name: 'exam-info',
          component: ExamInfoView
        },
        {
          path: 'exams/:scheduleId/confirmation',
          name: 'exam-confirmation',
          component: ExamConfirmationView
        }
      ]
    },
    {
      path: '/exam',
      component: ExamRunnerLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: ':attemptId',
          name: 'exam-runner',
          component: ExamRunnerView
        },
        {
          path: ':attemptId/review',
          name: 'exam-review',
          component: ExamReviewView
        },
        {
          path: ':attemptId/finished',
          name: 'exam-finished',
          component: ExamFinishedView
        }
      ]
    }
  ]
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useStudentAuthStore()
  
  // If route requires auth and not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } 
  // If route requires guest (e.g. login) and already authenticated
  else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } 
  else {
    next()
  }
})

export default router
