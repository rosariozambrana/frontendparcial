import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoading: (state) => state.loading,
    getError: (state) => state.error
  },

  actions: {
    async register(username, email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post('https://pizarrabackend3-production.up.railway.app/api/register', {
          username,
          email,
          password
        })

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      this.loading = true
      this.error = null

      try {
        const response = await axios.post('https://pizarrabackend3-production.up.railway.app/api/login', {
          email,
          password
        })

        this.user = response.data.user
        this.token = response.data.token

        // Store token in localStorage for persistence
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null

      // Remove from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    initializeAuth() {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
      }
    }
  }
})
