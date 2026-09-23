import { defineStore } from 'pinia'

// Generate 40 mock questions
const generateMockQuestions = () => {
  const questions = []
  
  // 35 Multiple Choice Questions
  for (let i = 1; i <= 35; i++) {
    questions.push({
      id: i,
      number: i,
      type: 'SINGLE_CHOICE',
      text: `Ini adalah contoh soal pilihan ganda nomor ${i}. Apa fungsi utama dari teknologi yang sedang dibahas pada materi ini? Pilihlah jawaban yang paling tepat.`,
      options: [
        { key: 'A', text: 'Menambah kapasitas memori dan penyimpanan secara signifikan.' },
        { key: 'B', text: 'Menyaring lalu lintas jaringan dan melindungi sistem dari akses tidak sah.' },
        { key: 'C', text: 'Meningkatkan kecepatan pemrosesan data pada CPU komputer.' },
        { key: 'D', text: 'Menyediakan antarmuka grafis yang memudahkan pengguna.' },
        { key: 'E', text: 'Menghubungkan dua jaringan yang berbeda protokol.' }
      ]
    })
  }
  
  // 5 Essay Questions
  for (let i = 36; i <= 40; i++) {
    questions.push({
      id: i,
      number: i,
      type: 'ESSAY',
      text: `Ini adalah contoh soal essay nomor ${i}. Jelaskan secara rinci bagaimana konsep ini diterapkan di dunia nyata, serta sebutkan minimal 3 contoh penerapannya!`
    })
  }
  
  return questions
}

export const useMockExamStore = defineStore('mockExam', {
  state: () => ({
    examDetails: {
      examTitle: 'PTS Ganjil 2026/2027',
      subjectName: 'Keamanan Jaringan',
      className: 'XII TKJ',
      durationMinutes: 90,
      choiceQuestions: 35,
      essayQuestions: 5,
      totalQuestions: 40
    },
    questions: [],
    answers: {}, // { questionId: 'A' } or { questionId: 'My essay answer' }
    flagged: {}, // { questionId: true }
    activeQuestionId: 1,
    timeRemaining: 90 * 60, // in seconds
    timerInterval: null,
    isStarted: false,
    isFinished: false
  }),
  
  getters: {
    activeQuestion: (state) => state.questions.find(q => q.id === state.activeQuestionId),
    answeredCount: (state) => Object.keys(state.answers).filter(k => {
      const ans = state.answers[k]
      return ans !== null && ans !== undefined && ans !== ''
    }).length,
    flaggedCount: (state) => Object.keys(state.flagged).filter(k => state.flagged[k]).length,
    unansweredCount: (state) => state.questions.length - Object.keys(state.answers).filter(k => {
      const ans = state.answers[k]
      return ans !== null && ans !== undefined && ans !== ''
    }).length,
    formattedTimeRemaining: (state) => {
      const h = Math.floor(state.timeRemaining / 3600)
      const m = Math.floor((state.timeRemaining % 3600) / 60)
      const s = state.timeRemaining % 60
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    },
    isLastQuestion: (state) => state.activeQuestionId === state.questions[state.questions.length - 1]?.id,
    isFirstQuestion: (state) => state.activeQuestionId === state.questions[0]?.id
  },
  
  actions: {
    initializeExam() {
      // Load from local storage if exists
      const savedState = localStorage.getItem('mockExamState')
      if (savedState) {
        const parsed = JSON.parse(savedState)
        this.questions = parsed.questions || generateMockQuestions()
        this.answers = parsed.answers || {}
        this.flagged = parsed.flagged || {}
        this.activeQuestionId = parsed.activeQuestionId || 1
        this.timeRemaining = parsed.timeRemaining || 90 * 60
        this.isStarted = parsed.isStarted || true
        this.isFinished = parsed.isFinished || false
      } else {
        this.questions = generateMockQuestions()
        this.answers = {}
        this.flagged = {}
        this.activeQuestionId = 1
        this.timeRemaining = 90 * 60
        this.isStarted = true
        this.isFinished = false
      }
      this.saveState()
      this.startTimer()
    },
    
    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
      this.timerInterval = setInterval(() => {
        if (this.timeRemaining > 0) {
          this.timeRemaining--
          if (this.timeRemaining % 10 === 0) { // Save every 10s
             this.saveState()
          }
        } else {
          this.finishExam()
        }
      }, 1000)
    },
    
    stopTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval)
    },
    
    setAnswer(questionId, answer) {
      this.answers[questionId] = answer
      this.saveState()
    },
    
    toggleFlag(questionId) {
      this.flagged[questionId] = !this.flagged[questionId]
      this.saveState()
    },
    
    goToQuestion(questionId) {
      this.activeQuestionId = questionId
      this.saveState()
    },
    
    nextQuestion() {
      const idx = this.questions.findIndex(q => q.id === this.activeQuestionId)
      if (idx < this.questions.length - 1) {
        this.activeQuestionId = this.questions[idx + 1].id
        this.saveState()
      }
    },
    
    prevQuestion() {
      const idx = this.questions.findIndex(q => q.id === this.activeQuestionId)
      if (idx > 0) {
        this.activeQuestionId = this.questions[idx - 1].id
        this.saveState()
      }
    },
    
    finishExam() {
      this.isFinished = true
      this.stopTimer()
      this.saveState()
    },
    
    saveState() {
      localStorage.setItem('mockExamState', JSON.stringify({
        questions: this.questions,
        answers: this.answers,
        flagged: this.flagged,
        activeQuestionId: this.activeQuestionId,
        timeRemaining: this.timeRemaining,
        isStarted: this.isStarted,
        isFinished: this.isFinished
      }))
    },
    
    clearState() {
      localStorage.removeItem('mockExamState')
      this.stopTimer()
      this.isStarted = false
      this.isFinished = false
    }
  }
})
