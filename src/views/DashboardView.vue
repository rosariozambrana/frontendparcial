<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    
    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div class="dashboard-actions">
      <button class="btn btn-primary" @click="showCreateRoomModal = true">
        Crear Nueva Sala
      </button>
      <button class="btn btn-secondary" @click="showJoinRoomModal = true">
        Unirse a Sala
      </button>
    </div>
    
    <div v-if="loading" class="loading">
      Loading rooms...
    </div>
    
    <div v-else-if="rooms.length === 0" class="no-rooms">
      <p>Aún no tienes salas. Crea una nueva o únete a una ya existente.</p>
    </div>
    
    <div v-else class="rooms-list">
      <div v-for="room in rooms" :key="room.id" class="card room-card">
        <div class="room-header">
          <h2 class="room-name">{{ room.name }}</h2>
          <span class="room-date">Created: {{ formatDate(room.created_at) }}</span>
        </div>
        
        <div class="room-actions">
          <router-link :to="`/whiteboard/${room.id}`" class="btn btn-primary">
            Pizarra
          </router-link>
          <button v-if="room.owner_id === authStore.getUser.id"
              class="btn btn-secondary"
              @click="copyInviteLink(room)">Copiar Enlace
          </button>
<!--          <button class="btn btn-secondary" @click="copyInviteLink(room)">-->
<!--            Copia el Enlace-->
<!--          </button>-->
        </div>
      </div>
    </div>
    
    <!-- Create Room Modal -->
    <div v-if="showCreateRoomModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Create New Room</h2>
          <button class="close-btn" @click="showCreateRoomModal = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="roomName" class="form-label">Nombre de la Sala</label>
            <input 
              type="text" 
              id="roomName" 
              v-model="newRoomName" 
              class="form-input" 
              placeholder="Enter room name"
              required
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateRoomModal = false">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="createRoom" 
            :disabled="!newRoomName.trim() || creatingRoom"
          >
            {{ creatingRoom ? 'Creating...' : 'Create Room' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Join Room Modal -->
    <div v-if="showJoinRoomModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Join Room</h2>
          <button class="close-btn" @click="showJoinRoomModal = false">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="inviteCode" class="form-label">Invite Code</label>
            <input 
              type="text" 
              id="inviteCode" 
              v-model="inviteCode" 
              class="form-input" 
              placeholder="Enter invite code"
              required
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showJoinRoomModal = false">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="joinRoom" 
            :disabled="!inviteCode.trim() || joiningRoom"
          >
            {{ joiningRoom ? 'Joining...' : 'Join Room' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWhiteboardStore } from '../stores/whiteboard'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'DashboardView',
  setup() {
    const router = useRouter()
    const whiteboardStore = useWhiteboardStore()
    const authStore = useAuthStore()
    
    const rooms = ref([])
    const loading = ref(true)
    const error = ref('')
    
    const showCreateRoomModal = ref(false)
    const showJoinRoomModal = ref(false)
    const newRoomName = ref('')
    const inviteCode = ref('')
    const creatingRoom = ref(false)
    const joiningRoom = ref(false)
    
    const fetchRooms = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const fetchedRooms = await whiteboardStore.fetchRooms()
        rooms.value = fetchedRooms
      } catch (err) {
        error.value = 'Failed to load rooms. Please try again.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }
    
    const createRoom = async () => {
      if (!newRoomName.value.trim()) return
      
      creatingRoom.value = true
      error.value = ''
      
      try {
        const result = await whiteboardStore.createRoom(newRoomName.value.trim())
        rooms.value.push(result.room)
        showCreateRoomModal.value = false
        newRoomName.value = ''
        
        // Optionally, redirect to the new room
        router.push(`/whiteboard/${result.room.id}`)
      } catch (err) {
        error.value = 'Failed to create room. Please try again.'
        console.error(err)
      } finally {
        creatingRoom.value = false
      }
    }
    
    const joinRoom = async () => {
      if (!inviteCode.value.trim()) return
      
      joiningRoom.value = true
      error.value = ''
      
      try {
        const result = await whiteboardStore.joinRoomWithInviteCode(inviteCode.value.trim())
        await fetchRooms() // Refresh the rooms list
        showJoinRoomModal.value = false
        inviteCode.value = ''
        
        // Redirect to the joined room
        router.push(`/whiteboard/${result.room.id}`)
      } catch (err) {
        error.value = 'Failed to join room. Please check the invite code and try again.'
        console.error(err)
      } finally {
        joiningRoom.value = false
      }
    }

    const copyInviteLink = async (room) => {
      try {
         // Llamamos al nuevo endpoint que solo devuelve inviteCode si eres owner
        const { inviteCode } = await whiteboardStore.fetchInviteCode(room.id)
        const baseUrl = window.location.origin
        const inviteLink = `${baseUrl}/join?code=${inviteCode}`
        await navigator.clipboard.writeText(inviteLink)
        alert('Enlace de invitación copiado al portapapeles ✅')
        } catch (err) {
        console.error('Error obteniendo o copiando el enlace', err)
        alert('No se pudo obtener el enlace. ¿Eres el creador de la sala?')
        }
    }

    // const copyInviteLink = (room) => {
    //   const baseUrl = window.location.origin
    //   const inviteLink = `${baseUrl}/join?code=${room.invite_code}`
    //
    //   navigator.clipboard.writeText(inviteLink)
    //     .then(() => {
    //       alert('Invite link copied to clipboard!')
    //     })
    //     .catch(err => {
    //       console.error('Failed to copy invite link', err)
    //       alert(`Invite code: ${room.invite_code}`)
    //     })
    // }
    
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    }
    
    onMounted(() => {
      if (!authStore.isLoggedIn) {
        router.push('/login')
        return
      }
      
      fetchRooms()
    })
    
    return {
      rooms,
      loading,
      error,
      showCreateRoomModal,
      showJoinRoomModal,
      newRoomName,
      inviteCode,
      creatingRoom,
      joiningRoom,
      createRoom,
      joinRoom,
      copyInviteLink,
      formatDate,
      authStore
    }
  }
}
</script>

<style scoped>
.dashboard-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.rooms-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.room-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.room-header {
  margin-bottom: 1rem;
}

.room-name {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.room-date {
  font-size: 0.875rem;
  color: #666;
}

.room-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.no-rooms {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.loading {
  text-align: center;
  padding: 2rem;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .dashboard-actions {
    flex-direction: column;
  }
  
  .rooms-list {
    grid-template-columns: 1fr;
  }
}
</style>