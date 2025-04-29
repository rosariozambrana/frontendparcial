import { defineStore } from 'pinia'
import axios from 'axios'
import { io } from 'socket.io-client'
import { useAuthStore } from './auth'

export const useWhiteboardStore = defineStore('whiteboard', {
  state: () => ({
    socket: null,
    currentRoom: null,
    components: {},
    loading: false,
    error: null,
    generatedCode: null,
    generatedComponents: [],
    connectedUsers: [],
    currentEditor: null
  }),

  getters: {
    getComponents: (state) => state.components,
    getCurrentRoom: (state) => state.currentRoom,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getGeneratedCode: (state) => state.generatedCode,
    getGeneratedComponents: (state) => state.generatedComponents,
    getConnectedUsers: (state) => state.connectedUsers,
    getCurrentEditor: (state) => state.currentEditor
  },

  actions: {
    initializeSocket() {
      if (!this.socket) {
        this.socket = io('https://pizarrabackend3-production.up.railway.app/', {
          autoConnect: true,
          reconnection: true
        })

        this.setupSocketListeners()
      }
    },

    setupSocketListeners() {
      this.socket.on('connect', () => {
        console.log('Connected to socket server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from socket server')
      })

      this.socket.on('whiteboardUpdated', (data) => {
        this.components = data.components
        this.currentEditor = data.editedBy
      })

      this.socket.on('angularCodeGenerated', (response) => {
        this.generatedCode = response.main
        this.generatedComponents = response.components || []
      })

      this.socket.on('userJoined', (user) => {
        console.log(`User joined: ${user.username}`)
        // Add user to connected users if not already in the list
        if (!this.connectedUsers.some(u => u.userId === user.userId)) {
          this.connectedUsers.push(user)
        }
      })

      this.socket.on('userLeft', (user) => {
        console.log(`User left: ${user.username}`)
        // Remove user from connected users
        this.connectedUsers = this.connectedUsers.filter(u => u.userId !== user.userId)

        // Clear current editor if it was this user
        if (this.currentEditor && this.currentEditor.userId === user.userId) {
          this.currentEditor = null
        }
      })

      this.socket.on('connectedUsers', (users) => {
        console.log('Connected users:', users)
        this.connectedUsers = users
      })
    },

    joinRoom(roomId) {
      if (this.socket && roomId) {
        const authStore = useAuthStore()
        this.socket.emit('joinRoom', {
          roomId,
          token: authStore.getToken
        })
        this.currentRoom = roomId
      }
    },

    async fetchRooms() {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        const response = await axios.get('https://pizarrabackend3-production.up.railway.app/api/rooms', {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        })

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch rooms'
        throw error
      } finally {
        this.loading = false
      }
    },
//////////nuevooooo
    async fetchInviteCode(roomId) {
      this.loading = true
      this.error = null
        try {
           const authStore = useAuthStore()
           const response = await axios.get(`https://pizarrabackend3-production.up.railway.app/api/rooms/${roomId}/invite-code`,
             {
               headers: {
                 Authorization: `Bearer ${authStore.getToken}`
               }
             }
            )
         // devuelve { inviteCode: 'abcd1234' }
             return response.data
        } catch (err) {
          this.error = err.response?.data?.message || 'No autorizado o sala no encontrada'
          throw err
        } finally {
           this.loading = false
        }
    },

    async createRoom(name) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        const response = await axios.post('https://pizarrabackend3-production.up.railway.app/api/rooms',
          { name },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`
            }
          }
        )

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create room'
        throw error
      } finally {
        this.loading = false
      }
    },

    async joinRoomWithInviteCode(inviteCode) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        const response = await axios.post('https://pizarrabackend3-production.up.railway.app/api/rooms/join',
          { inviteCode },
          {
            headers: {
              Authorization: `Bearer ${authStore.getToken}`
            }
          }
        )

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to join room'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchWhiteboardData(roomId) {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        const response = await axios.get(`https://pizarrabackend3-production.up.railway.app/api/rooms/${roomId}/whiteboard`, {
          headers: {
            Authorization: `Bearer ${authStore.getToken}`
          }
        })

        this.components = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch whiteboard data'
        throw error
      } finally {
        this.loading = false
      }
    },

    updateWhiteboard(components, editedComponentId = null) {
      if (this.socket && this.currentRoom) {
        const authStore = useAuthStore()

        this.components = components
        // Set current editor to self with the component being edited
        this.currentEditor = {
          userId: authStore.getUser.id,
          username: authStore.getUser.username,
          componentId: editedComponentId
        }

        this.socket.emit('whiteboardUpdate', {
          roomId: this.currentRoom,
          components,
          editedComponentId,
          token: authStore.getToken
        })
      }
    },

    addComponent(component) {
      const componentId = `component-${Date.now()}`
      const newComponent = {
        ...component,
        id: componentId
      }

      const updatedComponents = {
        ...this.components,
        [componentId]: newComponent
      }

      this.updateWhiteboard(updatedComponents, componentId)
    },

    updateComponent(componentId, updates) {
      if (this.components[componentId]) {
        const updatedComponent = {
          ...this.components[componentId],
          ...updates
        }

        const updatedComponents = {
          ...this.components,
          [componentId]: updatedComponent
        }

        this.updateWhiteboard(updatedComponents, componentId)
      }
    },

    removeComponent(componentId) {
      if (this.components[componentId]) {
        const updatedComponents = { ...this.components }
        delete updatedComponents[componentId]

        this.updateWhiteboard(updatedComponents, null)
      }
    },

    generateAngularCode() {
      if (this.socket && this.currentRoom) {
        const authStore = useAuthStore()

        this.socket.emit('generateAngularCode', {
          roomId: this.currentRoom,
          token: authStore.getToken
        })
      }
    },

    cleanup() {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }

      this.currentRoom = null
      this.components = {}
      this.generatedCode = null
    }
  }
})
