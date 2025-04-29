<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">Go Home</router-link>
        <button @click="goBack" class="btn btn-secondary">Go Back</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  text-align: center;
}

.not-found-content {
  max-width: 500px;
  padding: 2rem;
}

h1 {
  font-size: 6rem;
  margin: 0;
  color: #4CAF50;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

p {
  margin-bottom: 2rem;
  color: #666;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 4rem;
  }
  
  h2 {
    font-size: 1.5rem;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>