import { defineStore } from 'pinia'
import api from '@/services/api'

export const useExamAttemptStore = defineStore('examAttempt', {
  state: () => ({
    attempt: null,
    exam: null,
    summary: null,
    
    questions: [],
    answers: {},
    
    currentQuestionIndex: 0,
    
    loading: false,
    error: null,
    
    savingState: {}, // { questionId: 'idle' | 'saving' | 'saved' | 'error' }
    
    // Fallback store
    localDrafts: {},
    syncPending: [],
    
    serverTimeOffset: 0,
  }),
  
  getters: {
    currentQuestion: (state) => state.questions[state.currentQuestionIndex] || null,
    totalQuestions: (state) => state.questions.length,
    
    answeredCount: (state) => {
      let count = 0;
      for (const q of state.questions) {
        if (!q) continue;
        const ans = state.answers[q.id];
        if (ans) {
          if (q.questionType === 'SINGLE_CHOICE' && ans.selectedOptionId) count++;
          if (q.questionType === 'ESSAY' && typeof ans.answerText === 'string' && ans.answerText.trim() !== '') count++;
        }
      }
      return count;
    },
    
    flaggedCount: (state) => {
      let count = 0;
      for (const q of state.questions) {
        if (!q) continue;
        if (state.answers[q.id]?.isFlagged) count++;
      }
      return count;
    },
    unansweredCount: (state) => {
      let count = 0;
      for (const q of state.questions) {
        if (!q) continue;
        const ans = state.answers[q.id];
        if (ans) {
          if (q.questionType === 'SINGLE_CHOICE' && ans.selectedOptionId) count++;
          if (q.questionType === 'ESSAY' && typeof ans.answerText === 'string' && ans.answerText.trim() !== '') count++;
        }
      }
      return state.questions.length - count;
    },
    
    isFirstQuestion: (state) => state.currentQuestionIndex === 0,
    isLastQuestion: (state) => state.currentQuestionIndex === state.questions.length - 1,
  },
  
  actions: {
    async fetchAttempt(attemptId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/student/attempts/${attemptId}`)
        const data = response.data.data
        this.attempt = data.attempt
        this.exam = data.exam
        this.summary = data.summary
        
        if (data.serverTime) {
          this.serverTimeOffset = new Date(data.serverTime).getTime() - Date.now();
        }
        
        // Restore local drafts from localStorage
        const draftKey = `cbt_attempt_${attemptId}_draft`
        const local = localStorage.getItem(draftKey)
        if (local) {
          this.localDrafts = JSON.parse(local)
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat sesi ujian.'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async fetchQuestions(attemptId) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`/student/attempts/${attemptId}/questions`)
        const data = response.data.data
        this.questions = data.questions
        this.answers = data.answers || {}
        
        // Apply any local drafts that are not synced
        if (this.localDrafts) {
          for (const qId in this.localDrafts) {
            if (!this.answers[qId] || this.localDrafts[qId].version >= (this.answers[qId].version || 0)) {
               this.answers[qId] = { ...this.answers[qId], ...this.localDrafts[qId] }
               // attempt to sync it now
               this.saveAnswer(qId)
            }
          }
        }
        
        // Restore current question index from sessionStorage
        const savedIndex = sessionStorage.getItem(`cbt_attempt_${attemptId}_current_question`)
        if (savedIndex !== null && savedIndex !== 'undefined' && savedIndex !== 'NaN') {
          const parsed = parseInt(savedIndex, 10)
          if (!isNaN(parsed)) {
            this.currentQuestionIndex = parsed
          } else {
            this.currentQuestionIndex = 0
          }
        } else {
          this.currentQuestionIndex = 0
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memuat soal ujian.'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    goToQuestion(index) {
      this.flushPendingSaves()
      if (index >= 0 && index < this.questions.length) {
        this.currentQuestionIndex = index
        if (this.attempt) {
          sessionStorage.setItem(`cbt_attempt_${this.attempt.id}_current_question`, index.toString())
        }
      }
    },
    
    flushPendingSaves() {
      if (this._essayTimeouts) {
        for (const qId in this._essayTimeouts) {
          clearTimeout(this._essayTimeouts[qId])
          this.saveAnswer(qId)
        }
        this._essayTimeouts = {}
      }
    },
    
    nextQuestion() {
      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.goToQuestion(this.currentQuestionIndex + 1)
      }
    },
    
    prevQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.goToQuestion(this.currentQuestionIndex - 1)
      }
    },
    
    _persistLocalDraft(attemptId) {
      localStorage.setItem(`cbt_attempt_${attemptId}_draft`, JSON.stringify(this.localDrafts))
    },
    
    async saveAnswer(questionId, localUpdateOnly = false) {
      if (!this.attempt || this.attempt.status !== 'IN_PROGRESS') return;
      
      const attemptId = this.attempt.id;
      const ans = this.answers[questionId] || {};
      
      // Update local draft
      this.localDrafts[questionId] = { ...ans };
      this._persistLocalDraft(attemptId);
      
      if (localUpdateOnly) return;
      
      this.savingState[questionId] = 'saving';
      
      try {
        const payload = {
          selectedOptionId: ans.selectedOptionId,
          answerText: ans.answerText,
          answerFileUrl: ans.answerFileUrl,
          isFlagged: ans.isFlagged,
          version: ans.version
        };
        
        const response = await api.put(`/student/attempts/${attemptId}/answers/${questionId}`, payload);
        const data = response.data.data;
        
        // Update version and clear from localDrafts
        if (this.answers[questionId]) {
          this.answers[questionId].version = data.version;
        } else {
          this.answers[questionId] = { version: data.version };
        }
        
        delete this.localDrafts[questionId];
        this._persistLocalDraft(attemptId);
        
        this.savingState[questionId] = 'saved';
        
        // Update attempt lastActivity
        this.attempt.lastActivityAt = data.savedAt;
        
      } catch (err) {
        if (err.response?.status === 409) {
          // Version conflict, reload answers
          this.fetchQuestions(attemptId);
        } else {
          this.savingState[questionId] = 'error';
          if (!this.syncPending.includes(questionId)) {
            this.syncPending.push(questionId);
          }
        }
      }
    },
    
    async toggleFlag(questionId) {
      if (!this.answers[questionId]) {
        this.answers[questionId] = { isFlagged: true };
      } else {
        this.answers[questionId].isFlagged = !this.answers[questionId].isFlagged;
      }
      await this.saveAnswer(questionId);
    },
    
    async setChoiceAnswer(questionId, optionId) {
      if (!this.answers[questionId]) {
        this.answers[questionId] = { selectedOptionId: optionId };
      } else {
        this.answers[questionId].selectedOptionId = optionId;
      }
      await this.saveAnswer(questionId);
    },
    
    setEssayAnswerLocal(questionId, text) {
      if (!this.answers[questionId]) {
        this.answers[questionId] = { answerText: text };
      } else {
        this.answers[questionId].answerText = text;
      }
      
      this.localDrafts[questionId] = { ...this.answers[questionId] };
      if (this.attempt) this._persistLocalDraft(this.attempt.id);
      
      this.savingState[questionId] = 'saving';
      
      if (!this._essayTimeouts) this._essayTimeouts = {};
      if (this._essayTimeouts[questionId]) {
        clearTimeout(this._essayTimeouts[questionId]);
      }
      
      this._essayTimeouts[questionId] = setTimeout(() => {
        this.saveAnswer(questionId);
        delete this._essayTimeouts[questionId];
      }, 1000);
    },
    
    async setEssayFileLocal(questionId, fileUrl) {
      if (!this.answers[questionId]) {
        this.answers[questionId] = { answerFileUrl: fileUrl };
      } else {
        this.answers[questionId].answerFileUrl = fileUrl;
      }
      
      this.localDrafts[questionId] = { ...this.answers[questionId] };
      if (this.attempt) this._persistLocalDraft(this.attempt.id);
      
      // Save immediately for file uploads
      await this.saveAnswer(questionId);
    },
    
    async retrySync() {
      const pending = [...this.syncPending];
      this.syncPending = [];
      for (const qId of pending) {
        await this.saveAnswer(qId);
      }
    },
    
    async resyncTime() {
      if (!this.attempt || this.attempt.status !== 'IN_PROGRESS') return;
      try {
        const response = await api.get(`/student/attempts/${this.attempt.id}/time`);
        const data = response.data.data;
        if (data.serverTime) {
          this.serverTimeOffset = new Date(data.serverTime).getTime() - Date.now();
        }
        if (data.expiresAt) {
          this.attempt.expiresAt = data.expiresAt;
        }
        if (data.status) {
          this.attempt.status = data.status;
        }
      } catch (err) {
        // Silently fail time resync, rely on local offset
        if (err.response?.status === 403) {
          this.attempt.status = 'TIME_EXPIRED';
        }
      }
    },
    
    async submitExam() {
      if (!this.attempt) return;
      const attemptId = this.attempt.id;
      this.flushPendingSaves();
      await this.retrySync();
      await api.post(`/student/attempts/${attemptId}/submit`);
      this.attempt.status = 'SUBMITTED';
    }
  }
})
