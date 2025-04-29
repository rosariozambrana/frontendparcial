<template>
  <div class="login-view">
    <div class="form-container">
      <h1 class="card-title">Login</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            class="form-input" 
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            class="form-input" 
            required
            placeholder="Enter your password"
          />
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block" 
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="register-link">
        Don't have an account? 
        <router-link to="/register">Register</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)

    const handleLogin = async () => {
      error.value = ''
      loading.value = true

      try {
        await authStore.login(email.value, password.value)

        // Check if there's a pending invite code
        const pendingInviteCode = localStorage.getItem('pendingInviteCode')

        if (pendingInviteCode) {
          // Remove the pending invite code from localStorage
          localStorage.removeItem('pendingInviteCode')

          // Redirect to the join page with the invite code
          router.push(`/join?code=${pendingInviteCode}`)
        } else {
          // Redirect to dashboard
          router.push('/dashboard')
        }
      } catch (err) {
        error.value = authStore.getError || 'Failed to login. Please try again.'
      } finally {
        loading.value = false
      }
    }

    return {
      email,
      password,
      error,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.register-link {
  margin-top: 1.5rem;
  text-align: center;
}

.register-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
