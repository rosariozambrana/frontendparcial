<template>
  <div id="app">
    <header v-if="isLoggedIn">
      <nav class="navbar">
        <div class="navbar-brand">Pizarra Colaborativa</div>
        <div class="navbar-menu">
          <router-link to="/dashboard" class="navbar-item">Dashboard</router-link>
          <a href="#" class="navbar-item" @click.prevent="logout">Cerrar Session</a>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuthStore } from './stores/auth'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const isLoggedIn = computed(() => authStore.isLoggedIn)
    
    const logout = () => {
      authStore.logout()
      router.push('/login')
    }
    
    return {
      isLoggedIn,
      logout
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #333;
  color: white;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.navbar-menu {
  display: flex;
  gap: 1rem;
}

.navbar-item {
  color: white;
  text-decoration: none;
}

.navbar-item:hover {
  text-decoration: underline;
}

main {
  flex: 1;
  padding: 2rem;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }
  
  .navbar-menu {
    margin-top: 1rem;
  }
}
</style>