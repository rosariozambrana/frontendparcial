<template>
  <div class="register-view">
    <div class="form-container">
      <h1 class="card-title">Register</h1>
      
      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            class="form-input" 
            required
            placeholder="Choose a username"
          />
        </div>
        
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
            placeholder="Choose a password"
            minlength="6"
          />
        </div>
        
        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            class="form-input" 
            required
            placeholder="Confirm your password"
            minlength="6"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-block" 
          :disabled="loading || !isFormValid"
        >
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      
      <p class="login-link">
        Already have an account? 
        <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const confirmPassword = ref('')
    const error = ref('')
    const loading = ref(false)
    
    const isFormValid = computed(() => {
      return (
        username.value.trim() !== '' &&
        email.value.trim() !== '' &&
        password.value.length >= 6 &&
        password.value === confirmPassword.value
      )
    })
    
    const handleRegister = async () => {
      if (!isFormValid.value) {
        if (password.value !== confirmPassword.value) {
          error.value = 'Passwords do not match'
        } else if (password.value.length < 6) {
          error.value = 'Password must be at least 6 characters'
        }
        return
      }
      
      error.value = ''
      loading.value = true
      
      try {
        await authStore.register(username.value, email.value, password.value)
        // After successful registration, login the user
        await authStore.login(email.value, password.value)
        router.push('/dashboard')
      } catch (err) {
        error.value = authStore.getError || 'Failed to register. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      username,
      email,
      password,
      confirmPassword,
      error,
      loading,
      isFormValid,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.login-link {
  margin-top: 1.5rem;
  text-align: center;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: bold;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>