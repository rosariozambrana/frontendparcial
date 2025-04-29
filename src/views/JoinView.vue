<template>
  <div class="join-view">
    <div class="loading-container" v-if="loading">
      <p>Joining room...</p>
    </div>
    <div class="error-container" v-else-if="error">
      <h2>Error</h2>
      <p>{{ error }}</p>
      <router-link to="/dashboard" class="btn btn-primary">Back to Dashboard</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWhiteboardStore } from '../stores/whiteboard'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'JoinView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const whiteboardStore = useWhiteboardStore()
    const authStore = useAuthStore()
    
    const loading = ref(true)
    const error = ref('')
    
    onMounted(async () => {
      // Check if user is logged in
      if (!authStore.isLoggedIn) {
        // Store the invite code in localStorage to use after login
        if (route.query.code) {
          localStorage.setItem('pendingInviteCode', route.query.code)
        }
        router.push('/login')
        return
      }
      
      // Get the invite code from the URL
      const inviteCode = route.query.code
      
      if (!inviteCode) {
        error.value = 'Invalid invitation link. No invite code provided.'
        loading.value = false
        return
      }
      
      try {
        // Join the room with the invite code
        const result = await whiteboardStore.joinRoomWithInviteCode(inviteCode)
        
        // Redirect to the whiteboard
        router.push(`/whiteboard/${result.room.id}`)
      } catch (err) {
        error.value = whiteboardStore.getError || 'Failed to join room. Please check the invite code and try again.'
        loading.value = false
      }
    })
    
    return {
      loading,
      error
    }
  }
}
</script>

<style scoped>
.join-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.error-container h2 {
  color: #f44336;
  margin-bottom: 1rem;
}

.error-container p {
  margin-bottom: 1.5rem;
}
</style>