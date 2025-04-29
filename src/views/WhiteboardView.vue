<template>
  <div class="whiteboard-view">
    <div class="whiteboard-header">
      <div class="header-left">
        <h1 class="room-name">{{ roomName }}</h1>
        <div class="connected-users">
          <span class="users-label">Connected Users:</span>
          <div class="user-badges">
            <div v-for="user in connectedUsers" :key="user.userId" class="user-badge">
              {{ user.username }}
            </div>
          </div>
        </div>
      </div>

      <div class="whiteboard-actions">
        <button class="btn btn-primary" @click="generateCode">
          Generate Angular Code
        </button>
        <router-link to="/dashboard" class="btn btn-secondary">
          Back to Dashboard
        </router-link>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="loading" class="loading">
      Loading whiteboard...
    </div>

    <div v-else class="whiteboard-container">
      <!-- Components Panel -->
      <div class="components-panel">
        <h2>Components</h2>
        <div class="component-list">
          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'navbar')"
          >
            <div class="component-preview navbar-preview"></div>
            <span>Navbar</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'input')"
          >
            <div class="component-preview input-preview"></div>
            <span>Input</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'button')"
          >
            <div class="component-preview button-preview"></div>
            <span>Button</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'card')"
          >
            <div class="component-preview card-preview"></div>
            <span>Card</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'image')"
          >
            <div class="component-preview image-preview"></div>
            <span>Image</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'text')"
          >
            <div class="component-preview text-preview"></div>
            <span>Text</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'checkbox')"
          >
            <div class="component-preview checkbox-preview"></div>
            <span>Checkbox</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'select')"
          >
            <div class="component-preview select-preview"></div>
            <span>Select</span>
          </div>

          <div 
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, 'table')"
          >
            <div class="component-preview table-preview"></div>
            <span>Table</span>
          </div>
        </div>
      </div>

      <!-- Whiteboard Canvas -->
      <div 
        class="whiteboard-canvas"
        @dragover.prevent
        @drop="onDrop"
      >
        <div v-if="Object.keys(components).length === 0" class="empty-canvas">
          <p>Drag and drop components here to start designing</p>
        </div>

        <template v-else>
          <div 
            v-for="(component, id) in components" 
            :key="id"
            class="canvas-component"
            :class="[
              { 'selected': selectedComponent === id },
              getComponentClasses(component)
            ]"
            :style="getComponentCustomProperties(component)"
            @click="selectComponent(id)"
            @mousedown="startDrag($event, id)"
          >
            <!-- Editor indicator -->
            <div v-if="currentEditor && currentEditor.componentId === id" class="editor-indicator">
              {{ currentEditor.username }} is editing
            </div>
            <!-- Navbar Component -->
            <div v-if="component.type === 'navbar'" class="preview-navbar">
              <div class="preview-navbar-brand">{{ component.brand || 'Brand' }}</div>
              <div class="preview-navbar-links">
                <div class="preview-navbar-link">Home</div>
                <div class="preview-navbar-link">About</div>
                <div class="preview-navbar-link">Contact</div>
              </div>
            </div>

            <!-- Input Component -->
            <div v-else-if="component.type === 'input'" class="preview-input">
              <label class="preview-input-label">{{ component.label || 'Input Label' }}</label>
              <input type="text" class="preview-input-field" :placeholder="component.placeholder || 'Enter text...'">
            </div>

            <!-- Button Component -->
            <div v-else-if="component.type === 'button'" class="preview-button">
              {{ component.text || 'Button' }}
            </div>

            <!-- Card Component -->
            <div v-else-if="component.type === 'card'" class="preview-card">
              <div class="preview-card-header">{{ component.title || 'Card Title' }}</div>
              <div class="preview-card-body">
                <p>{{ component.content || 'Card content goes here. This is a sample text.' }}</p>
              </div>
              <div v-if="component.hasFooter" class="preview-card-footer">
                <button class="preview-card-btn">{{ component.buttonText || 'Action' }}</button>
              </div>
            </div>

            <!-- Image Component -->
            <div v-else-if="component.type === 'image'" class="preview-image">
              <div class="preview-image-placeholder">
                <span>{{ component.altText || 'Image' }}</span>
              </div>
            </div>

            <!-- Text Component -->
            <div v-else-if="component.type === 'text'" class="preview-text">
              <p>{{ component.content || 'This is a paragraph of text. You can edit this text to add your own content.' }}</p>
            </div>

            <!-- Checkbox Component -->
            <div v-else-if="component.type === 'checkbox'" class="preview-checkbox">
              <div v-for="(option, index) in (component.options || ['Option 1', 'Option 2', 'Option 3'])" :key="index" class="preview-checkbox-item">
                <input type="checkbox" :id="`checkbox-${id}-${index}`" :checked="component.checkedOptions && component.checkedOptions.includes(index)">
                <label :for="`checkbox-${id}-${index}`">{{ option }}</label>
              </div>
            </div>

            <!-- Select Component -->
            <div v-else-if="component.type === 'select'" class="preview-select">
              <label v-if="component.label" class="preview-select-label">{{ component.label }}</label>
              <select class="preview-select-dropdown">
                <option disabled selected>{{ component.placeholder || 'Select an option' }}</option>
                <option v-for="(option, index) in (component.options || ['Option 1', 'Option 2', 'Option 3'])" :key="index">
                  {{ option }}
                </option>
              </select>
            </div>

            <!-- Table Component -->
            <div v-else-if="component.type === 'table'" class="preview-table">
              <h2 v-if="component.showTitle !== false" class="preview-table-title">{{ component.tableTitle || 'Data Table' }}</h2>
              <table>
                <thead class="table-header" :style="{ '--header-bg-color': component.headerBgColor || '#f5f5f5' }">
                  <tr>
                    <th v-for="(header, index) in (component.headers || ['Header 1', 'Header 2', 'Header 3'])" :key="index">
                      {{ header }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in (component.rows || [['Cell 1', 'Cell 2', 'Cell 3'], ['Cell 4', 'Cell 5', 'Cell 6']])" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                      {{ cell }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Component Controls -->
            <div v-if="selectedComponent === id" class="component-controls">
              <button class="control-btn delete-btn" @click.stop="removeComponent(id)">
                &times;
              </button>
              <button 
                class="control-btn edit-btn" 
                @click.stop="editComponent(id)"
              >
                ✎
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Component Edit Modal -->
    <div v-if="showEditModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit {{ editingComponent ? editingComponent.type : '' }} Component</h2>
          <button class="close-btn" @click="showEditModal = false">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Common Edit Fields for All Components -->
          <div v-if="editingComponent" class="common-edit-fields">
            <div class="form-group">
              <label class="form-label">Width (px)</label>
              <input type="number" v-model="editingComponent.width" class="form-input" min="10" max="1000">
            </div>

            <div class="form-group">
              <label class="form-label">Height (px)</label>
              <input type="number" v-model="editingComponent.height" class="form-input" min="10" max="1000">
            </div>

            <hr class="edit-divider">
          </div>

          <!-- Navbar Edit Form -->
          <div v-if="editingComponent && editingComponent.type === 'navbar'">
            <div class="form-group">
              <label class="form-label">Brand Text</label>
              <input type="text" v-model="editingComponent.brand" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Input Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'input'">
            <div class="form-group">
              <label class="form-label">Label</label>
              <input type="text" v-model="editingComponent.label" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Placeholder</label>
              <input type="text" v-model="editingComponent.placeholder" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Input Type</label>
              <select v-model="editingComponent.inputType" class="form-input">
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Button Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'button'">
            <div class="form-group">
              <label class="form-label">Button Text</label>
              <input type="text" v-model="editingComponent.text" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Button Type</label>
              <select v-model="editingComponent.buttonType" class="form-input">
                <option value="btn-primary">Primary</option>
                <option value="btn-secondary">Secondary</option>
                <option value="btn-danger">Danger</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Card Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'card'">
            <div class="form-group">
              <label class="form-label">Card Title</label>
              <input type="text" v-model="editingComponent.title" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Card Content</label>
              <textarea v-model="editingComponent.content" class="form-input" rows="4"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" v-model="editingComponent.hasFooter">
                Show Footer with Button
              </label>
            </div>

            <div v-if="editingComponent.hasFooter" class="form-group">
              <label class="form-label">Button Text</label>
              <input type="text" v-model="editingComponent.buttonText" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Image Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'image'">
            <div class="form-group">
              <label class="form-label">Alt Text</label>
              <input type="text" v-model="editingComponent.altText" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Image URL (optional)</label>
              <input type="text" v-model="editingComponent.imageUrl" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>
          </div>

          <!-- Text Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'text'">
            <div class="form-group">
              <label class="form-label">Text Content</label>
              <textarea v-model="editingComponent.content" class="form-input" rows="6"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Font Size</label>
              <select v-model="editingComponent.fontSize" class="form-input">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Checkbox Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'checkbox'">
            <div class="form-group">
              <label class="form-label">Options (one per line)</label>
              <textarea 
                v-model="checkboxOptionsText" 
                class="form-input" 
                rows="5"
                @input="updateCheckboxOptions"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Default Checked Options</label>
              <div v-for="(option, index) in editingComponent.options" :key="index" class="checkbox-option">
                <input 
                  type="checkbox" 
                  :id="`edit-checkbox-${index}`" 
                  :value="index"
                  v-model="editingComponent.checkedOptions"
                >
                <label :for="`edit-checkbox-${index}`">{{ option }}</label>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Select Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'select'">
            <div class="form-group">
              <label class="form-label">Label</label>
              <input type="text" v-model="editingComponent.label" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Placeholder</label>
              <input type="text" v-model="editingComponent.placeholder" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Options (one per line)</label>
              <textarea 
                v-model="selectOptionsText" 
                class="form-input" 
                rows="5"
                @input="updateSelectOptions"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>

          <!-- Table Edit Form -->
          <div v-else-if="editingComponent && editingComponent.type === 'table'">
            <div class="form-group">
              <label class="form-label">Table Title</label>
              <input type="text" v-model="editingComponent.tableTitle" class="form-input" placeholder="Data Table">
            </div>

            <div class="form-group">
              <label class="form-label">
                <input type="checkbox" v-model="editingComponent.showTitle">
                Show Title
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Headers (comma separated)</label>
              <div class="input-with-button">
                <input 
                  type="text" 
                  v-model="tableHeadersText" 
                  class="form-input"
                  @input="updateTableHeaders"
                >
                <button type="button" class="btn btn-sm btn-primary" @click="addTableColumn">
                  + Add Column
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Rows (one row per line, cells comma separated)</label>
              <div class="textarea-with-button">
                <textarea 
                  v-model="tableRowsText" 
                  class="form-input" 
                  rows="5"
                  @input="updateTableRows"
                ></textarea>
                <button type="button" class="btn btn-sm btn-primary" @click="addTableRow">
                  + Add Row
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Table Header Background Color</label>
              <input type="color" v-model="editingComponent.headerBgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Table Background Color</label>
              <input type="color" v-model="editingComponent.bgColor" class="form-input">
            </div>

            <div class="form-group">
              <label class="form-label">Text Color</label>
              <input type="color" v-model="editingComponent.textColor" class="form-input">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showEditModal = false">
            Cancel
          </button>
          <button class="btn btn-primary" @click="saveComponentChanges">
            Save Changes
          </button>
        </div>
      </div>
    </div>

    <!-- Generated Code Modal -->
    <div v-if="showCodeModal" class="modal">
      <div class="modal-content code-modal">
        <div class="modal-header">
          <h2>Generated Angular Code</h2>
          <button class="close-btn" @click="showCodeModal = false">&times;</button>
        </div>

        <div class="modal-body">
          <div class="code-tabs">
            <button 
              class="code-tab" 
              :class="{ 'active': activeCodeTab === 'html' }"
              @click="activeCodeTab = 'html'"
            >
              HTML
            </button>
            <button 
              class="code-tab" 
              :class="{ 'active': activeCodeTab === 'css' }"
              @click="activeCodeTab = 'css'"
            >
              CSS
            </button>
            <button 
              class="code-tab" 
              :class="{ 'active': activeCodeTab === 'ts' }"
              @click="activeCodeTab = 'ts'"
            >
              TypeScript
            </button>
            <button 
              class="code-tab" 
              :class="{ 'active': activeCodeTab === 'components' }"
              @click="activeCodeTab = 'components'"
            >
              Components
            </button>
          </div>

          <div class="code-content">
            <pre v-if="activeCodeTab === 'html' && generatedCode">{{ generatedCode.html }}</pre>
            <pre v-else-if="activeCodeTab === 'css' && generatedCode">{{ generatedCode.css }}</pre>
            <pre v-else-if="activeCodeTab === 'ts' && generatedCode">{{ generatedCode.ts }}</pre>
            <div v-else-if="activeCodeTab === 'components'" class="components-code">
              <div v-if="generatedComponents && generatedComponents.length > 0">
                <div v-for="(component, index) in generatedComponents" :key="index" class="component-code-section">
                  <h3>{{ component.name }}</h3>
                  <div class="component-code-tabs">
                    <button 
                      class="component-code-tab" 
                      :class="{ 'active': component.activeTab === 'html' }"
                      @click="component.activeTab = 'html'"
                    >
                      HTML
                    </button>
                    <button 
                      class="component-code-tab" 
                      :class="{ 'active': component.activeTab === 'css' }"
                      @click="component.activeTab = 'css'"
                    >
                      CSS
                    </button>
                    <button 
                      class="component-code-tab" 
                      :class="{ 'active': component.activeTab === 'ts' }"
                      @click="component.activeTab = 'ts'"
                    >
                      TypeScript
                    </button>
                  </div>
                  <pre v-if="component.activeTab === 'html'">{{ component.html }}</pre>
                  <pre v-else-if="component.activeTab === 'css'">{{ component.css }}</pre>
                  <pre v-else-if="component.activeTab === 'ts'">{{ component.ts }}</pre>
                </div>
              </div>
              <div v-else class="no-components">
                <p>No separate components were generated.</p>
              </div>
            </div>
            <div v-else class="loading">Generating code...</div>
          </div>

          <button 
            class="btn btn-primary copy-btn" 
            @click="copyCode"
          >
            Copy Code
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWhiteboardStore } from '../stores/whiteboard'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'WhiteboardView',
  props: {
    roomId: {
      type: [String, Number],
      required: true
    }
  },
  setup(props) {
    const route = useRoute()
    const router = useRouter()
    const whiteboardStore = useWhiteboardStore()
    const authStore = useAuthStore()

    const roomName = ref('Whiteboard')
    const loading = ref(true)
    const error = ref('')
    const selectedComponent = ref(null)
    const showEditModal = ref(false)
    const editingComponent = ref(null)
    const editingComponentId = ref(null)
    const showCodeModal = ref(false)
    const activeCodeTab = ref('html')
    const isDragging = ref(false)
    const dragStartX = ref(0)
    const dragStartY = ref(0)

    // For editing complex component properties
    const checkboxOptionsText = ref('')
    const selectOptionsText = ref('')
    const tableHeadersText = ref('')
    const tableRowsText = ref('')

    // Get data from the store
    const components = computed(() => whiteboardStore.getComponents)
    const generatedCode = computed(() => whiteboardStore.getGeneratedCode)
    const generatedComponents = computed(() => whiteboardStore.getGeneratedComponents)
    const connectedUsers = computed(() => whiteboardStore.getConnectedUsers)
    const currentEditor = computed(() => whiteboardStore.getCurrentEditor)

    // Watch for changes in generatedComponents and initialize activeTab
    watch(generatedComponents, (newComponents) => {
      if (newComponents && newComponents.length > 0) {
        // Initialize activeTab for each component
        newComponents.forEach(component => {
          component.activeTab = 'html';
        });
      }
    });

    // Initialize the whiteboard
    const initializeWhiteboard = async () => {
      if (!authStore.isLoggedIn) {
        router.push('/login')
        return
      }

      loading.value = true
      error.value = ''

      try {
        // Initialize socket connection
        whiteboardStore.initializeSocket()

        // Join the room
        whiteboardStore.joinRoom(props.roomId)

        // Fetch whiteboard data
        await whiteboardStore.fetchWhiteboardData(props.roomId)

        // Fetch room details (for room name)
        const rooms = await whiteboardStore.fetchRooms()
        const currentRoom = rooms.find(room => room.id === parseInt(props.roomId))
        if (currentRoom) {
          roomName.value = currentRoom.name
        }
      } catch (err) {
        error.value = 'Failed to load whiteboard. Please try again.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    // Drag and drop functionality
    const onDragStart = (event, componentType) => {
      event.dataTransfer.setData('componentType', componentType)
    }

    const onDrop = (event) => {
      const componentType = event.dataTransfer.getData('componentType')
      if (!componentType) return

      const rect = event.target.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Create a new component
      const newComponent = {
        type: componentType,
        x: x,
        y: y,
        width: getDefaultWidth(componentType),
        height: getDefaultHeight(componentType)
      }

      // Add default properties based on component type
      if (componentType === 'navbar') {
        newComponent.brand = 'Brand'
        newComponent.bgColor = '#333333'
        newComponent.textColor = '#ffffff'
      } else if (componentType === 'input') {
        newComponent.label = 'Input Label'
        newComponent.placeholder = 'Enter text...'
        newComponent.inputType = 'text'
        newComponent.bgColor = '#ffffff'
        newComponent.textColor = '#333333'
      } else if (componentType === 'button') {
        newComponent.text = 'Button'
        newComponent.buttonType = 'btn-primary'
        newComponent.bgColor = '#4CAF50'
        newComponent.textColor = '#ffffff'
      } else if (componentType === 'card') {
        newComponent.title = 'Card Title'
        newComponent.content = 'Card content goes here. This is a sample text.'
        newComponent.hasFooter = false
        newComponent.buttonText = 'Action'
        newComponent.bgColor = '#ffffff'
        newComponent.textColor = '#333333'
      } else if (componentType === 'image') {
        newComponent.altText = 'Image'
        newComponent.imageUrl = ''
        newComponent.bgColor = '#f5f5f5'
      } else if (componentType === 'text') {
        newComponent.content = 'This is a paragraph of text. You can edit this text to add your own content.'
        newComponent.fontSize = 'medium'
        newComponent.bgColor = '#ffffff'
        newComponent.textColor = '#333333'
      } else if (componentType === 'checkbox') {
        newComponent.options = ['Option 1', 'Option 2', 'Option 3']
        newComponent.checkedOptions = []
        newComponent.bgColor = '#ffffff'
        newComponent.textColor = '#333333'
      } else if (componentType === 'select') {
        newComponent.label = 'Select'
        newComponent.placeholder = 'Select an option'
        newComponent.options = ['Option 1', 'Option 2', 'Option 3']
        newComponent.bgColor = '#ffffff'
        newComponent.textColor = '#333333'
      } else if (componentType === 'table') {
        newComponent.tableTitle = 'Data Table'
        newComponent.showTitle = true
        newComponent.headers = ['Header 1', 'Header 2', 'Header 3']
        newComponent.rows = [
          ['Cell 1', 'Cell 2', 'Cell 3'],
          ['Cell 4', 'Cell 5', 'Cell 6']
        ]
        newComponent.bgColor = '#ffffff'
        newComponent.headerBgColor = '#f5f5f5'
        newComponent.textColor = '#333333'
      }

      whiteboardStore.addComponent(newComponent)
    }

    // Component selection and manipulation
    const selectComponent = (id) => {
      selectedComponent.value = id
    }

    const startDrag = (event, id) => {
      if (selectedComponent.value !== id) return

      // Prevent default browser drag behavior
      event.preventDefault(),

      isDragging.value = true
      dragStartX.value = event.clientX
      dragStartY.value = event.clientY

      const component = components.value[id]
      const startX = component.x
      const startY = component.y

      // Get the canvas element for scroll position
      const canvas = event.currentTarget.closest('.whiteboard-canvas')
      const initialScrollLeft = canvas.scrollLeft
      const initialScrollTop = canvas.scrollTop

      // Use requestAnimationFrame for smoother dragging
      let lastUpdateTime = 0
      let animationFrameId = null

      const updatePosition = (currentTime) => {
        if (!isDragging.value) return

        // Throttle updates to every 16ms (approximately 60fps)
        if (currentTime - lastUpdateTime < 16) {
          animationFrameId = requestAnimationFrame(updatePosition)
          return
        }

        lastUpdateTime = currentTime

        // Calculate the new position, accounting for scroll
        const newX = startX + (event.clientX - dragStartX.value) + (canvas.scrollLeft - initialScrollLeft)
        const newY = startY + (event.clientY - dragStartY.value) + (canvas.scrollTop - initialScrollTop)

        whiteboardStore.updateComponent(id, {
          x: newX,
          y: newY
        })

        animationFrameId = requestAnimationFrame(updatePosition)
      }

      const onMouseMove = (e) => {
        if (!isDragging.value) return
        event = e // Update the event for the animation frame
      }

      const onMouseUp = () => {
        isDragging.value = false
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
        }
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      // Start the animation frame
      animationFrameId = requestAnimationFrame(updatePosition)
    }

    const editComponent = (id) => {
      const component = { ...components.value[id] }

      editingComponent.value = component
      editingComponentId.value = id

      // Initialize complex component properties
      if (component.type === 'checkbox' && component.options) {
        checkboxOptionsText.value = component.options.join('\n')
        if (!component.checkedOptions) {
          component.checkedOptions = []
        }
      } else if (component.type === 'select' && component.options) {
        selectOptionsText.value = component.options.join('\n')
      } else if (component.type === 'table') {
        if (component.headers) {
          tableHeadersText.value = component.headers.join(', ')
        }
        if (component.rows) {
          tableRowsText.value = component.rows.map(row => row.join(', ')).join('\n')
        }
        // Initialize headerBgColor if it doesn't exist
        if (!component.headerBgColor) {
          component.headerBgColor = '#f5f5f5'
        }
      }

      showEditModal.value = true
    }

    // Functions to update complex component properties
    const updateCheckboxOptions = () => {
      if (!editingComponent.value) return
      const options = checkboxOptionsText.value.split('\n').filter(option => option.trim() !== '')
      editingComponent.value.options = options

      // Filter out checked options that no longer exist
      if (editingComponent.value.checkedOptions) {
        editingComponent.value.checkedOptions = editingComponent.value.checkedOptions.filter(
          index => index < options.length
        )
      }
    }

    const updateSelectOptions = () => {
      if (!editingComponent.value) return
      editingComponent.value.options = selectOptionsText.value.split('\n').filter(option => option.trim() !== '')
    }

    const updateTableHeaders = () => {
      if (!editingComponent.value) return
      editingComponent.value.headers = tableHeadersText.value.split(',').map(header => header.trim())
    }

    const updateTableRows = () => {
      if (!editingComponent.value) return
      const rows = tableRowsText.value.split('\n').filter(row => row.trim() !== '')
      editingComponent.value.rows = rows.map(row => row.split(',').map(cell => cell.trim()))
    }

    const addTableColumn = () => {
      if (!editingComponent.value) return

      // Add a new header
      const headers = tableHeadersText.value ? tableHeadersText.value.split(',').map(header => header.trim()) : []
      headers.push(`Header ${headers.length + 1}`)
      tableHeadersText.value = headers.join(', ')

      // Add a new cell to each row
      const rows = tableRowsText.value ? tableRowsText.value.split('\n').filter(row => row.trim() !== '') : []
      const updatedRows = rows.map(row => {
        const cells = row.split(',').map(cell => cell.trim())
        cells.push(`Cell ${cells.length + 1}`)
        return cells.join(', ')
      })

      if (rows.length === 0) {
        // If there are no rows, create a default row
        updatedRows.push(`Cell 1, Cell 2, Cell 3, Cell 4`)
      }

      tableRowsText.value = updatedRows.join('\n')

      // Update the component
      updateTableHeaders()
      updateTableRows()
    }

    const addTableRow = () => {
      if (!editingComponent.value) return

      // Get the number of columns from headers
      const headers = tableHeadersText.value ? tableHeadersText.value.split(',').map(header => header.trim()) : []
      const columnCount = Math.max(headers.length, 3) // At least 3 columns

      // Create a new row with the same number of cells as columns
      const newRow = Array.from({ length: columnCount }, (_, i) => `Cell ${i + 1}`).join(', ')

      // Add the new row to the existing rows
      const rows = tableRowsText.value ? tableRowsText.value.split('\n').filter(row => row.trim() !== '') : []
      rows.push(newRow)
      tableRowsText.value = rows.join('\n')

      // Update the component
      updateTableRows()
    }

    const saveComponentChanges = () => {
      if (!editingComponent.value || !editingComponentId.value) return

      // Process complex component properties before saving
      if (editingComponent.value.type === 'checkbox') {
        updateCheckboxOptions()
      } else if (editingComponent.value.type === 'select') {
        updateSelectOptions()
      } else if (editingComponent.value.type === 'table') {
        updateTableHeaders()
        updateTableRows()
      }

      whiteboardStore.updateComponent(editingComponentId.value, editingComponent.value)
      showEditModal.value = false
      editingComponent.value = null
      editingComponentId.value = null
    }

    const removeComponent = (id) => {
      if (confirm('Are you sure you want to remove this component?')) {
        whiteboardStore.removeComponent(id)
        selectedComponent.value = null
      }
    }

    // Generate Angular code
    const generateCode = () => {
      whiteboardStore.generateAngularCode()
      showCodeModal.value = true
    }

    // Copy generated code
    const copyCode = () => {
      if (activeCodeTab.value === 'components') {
        if (!generatedComponents.value || generatedComponents.value.length === 0) return

        // Concatenate all component code
        const componentsCode = generatedComponents.value.map(component => {
          return `// ${component.name}\n\n// HTML\n${component.html}\n\n// CSS\n${component.css}\n\n// TypeScript\n${component.ts}\n\n`;
        }).join('-----------------------------------\n\n');

        navigator.clipboard.writeText(componentsCode)
          .then(() => {
            alert('Components code copied to clipboard!')
          })
          .catch(err => {
            console.error('Failed to copy code', err)
          });
      } else {
        if (!generatedCode.value || !activeCodeTab.value) return

        const codeToCopy = generatedCode.value[activeCodeTab.value]
        navigator.clipboard.writeText(codeToCopy)
          .then(() => {
            alert('Code copied to clipboard!')
          })
          .catch(err => {
            console.error('Failed to copy code', err)
          });
      }
    }

    // Helper functions
    const getDefaultWidth = (componentType) => {
      switch (componentType) {
        case 'navbar': return 600
        case 'input': return 300
        case 'button': return 150
        case 'card': return 350
        case 'image': return 300
        case 'text': return 400
        case 'checkbox': return 250
        case 'select': return 300
        case 'table': return 500
        default: return 200
      }
    }

    const getDefaultHeight = (componentType) => {
      switch (componentType) {
        case 'navbar': return 60
        case 'input': return 80
        case 'button': return 40
        case 'card': return 250
        case 'image': return 200
        case 'text': return 150
        case 'checkbox': return 120
        case 'select': return 80
        case 'table': return 200
        default: return 50
      }
    }

    // Get component type-specific classes
    const getComponentClasses = (component) => {
      return {
        [`component-type-${component.type}`]: true
      }
    }

    // Get component custom properties for dynamic styling
    const getComponentCustomProperties = (component) => {
      const customProps = {
        '--component-x': `${component.x}px`,
        '--component-y': `${component.y}px`,
        '--component-width': `${component.width}px`,
        '--component-height': `${component.height}px`
      }

      // Add background and text color if they exist
      if (component.bgColor) {
        customProps['--component-bg-color'] = component.bgColor
      }

      if (component.textColor) {
        customProps['--component-text-color'] = component.textColor
      }

      // Add header background color for table component
      if (component.type === 'table' && component.headerBgColor) {
        customProps['--header-bg-color'] = component.headerBgColor
      }

      return customProps
    }

    // Keep the original method for backward compatibility
    const getComponentStyle = (component) => {
      const style = {
        left: `${component.x}px`,
        top: `${component.y}px`,
        width: `${component.width}px`,
        height: `${component.height}px`
      }

      // Add background and text color if they exist
      if (component.bgColor) {
        style.backgroundColor = component.bgColor
      }

      if (component.textColor) {
        style.color = component.textColor
      }

      return style
    }

    // Lifecycle hooks
    onMounted(() => {
      initializeWhiteboard()
    })

    onBeforeUnmount(() => {
      whiteboardStore.cleanup()
    })

    return {
      roomName,
      loading,
      error,
      components,
      connectedUsers,
      currentEditor,
      selectedComponent,
      showEditModal,
      editingComponent,
      showCodeModal,
      activeCodeTab,
      generatedCode,
      onDragStart,
      onDrop,
      selectComponent,
      startDrag,
      editComponent,
      saveComponentChanges,
      removeComponent,
      generateCode,
      copyCode,
      getComponentStyle,
      getComponentClasses,
      getComponentCustomProperties,
      // Add table editing variables and functions
      tableHeadersText,
      tableRowsText,
      updateTableHeaders,
      updateTableRows,
      addTableColumn,
      addTableRow,
      // Add checkbox and select editing variables and functions
      checkboxOptionsText,
      selectOptionsText,
      updateCheckboxOptions,
      updateSelectOptions
    }
  }
}
</script>

<style scoped>
.whiteboard-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.whiteboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.room-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.connected-users {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.users-label {
  margin-right: 0.5rem;
  font-weight: bold;
}

.user-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.user-badge {
  background-color: #4CAF50;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.whiteboard-actions {
  display: flex;
  gap: 0.5rem;
}

.whiteboard-container {
  display: flex;
  flex: 1;
  height: calc(100vh - 80px);
}

.components-panel {
  width: 250px;
  padding: 1rem;
  background-color: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: grab;
}

.component-preview {
  width: 100%;
  height: 40px;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.navbar-preview {
  background-color: #333;
  position: relative;
}
.navbar-preview::after {
  content: "";
  position: absolute;
  top: 50%;
  right: 10px;
  width: 50%;
  height: 2px;
  background-color: white;
  transform: translateY(-50%);
}

.input-preview {
  background-color: #f9f9f9;
  position: relative;
  border: 1px solid #ddd;
}
.input-preview::after {
  content: "";
  position: absolute;
  top: 70%;
  left: 10%;
  width: 80%;
  height: 6px;
  background-color: white;
  border: 1px solid #ddd;
}

.button-preview {
  background-color: #4CAF50;
  display: flex;
  justify-content: center;
  align-items: center;
}
.button-preview::after {
  content: "Button";
  color: white;
  font-size: 10px;
}

.card-preview {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}
.card-preview::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 25%;
  background-color: #f0f0f0;
}
.card-preview::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: #ddd;
  box-shadow: 0 4px 0 #ddd, 0 8px 0 #ddd;
}

.image-preview {
  background-color: #f0f0f0;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.image-preview::after {
  content: "🖼️";
  font-size: 16px;
}

.text-preview {
  background-color: white;
  border: 1px solid #ddd;
  position: relative;
}
.text-preview::after {
  content: "";
  position: absolute;
  top: 30%;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: #ddd;
  box-shadow: 0 4px 0 #ddd, 0 8px 0 #ddd, 0 12px 0 #ddd;
}

.checkbox-preview {
  background-color: white;
  border: 1px solid #ddd;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 10px;
}
.checkbox-preview::before {
  content: "";
  width: 12px;
  height: 12px;
  border: 1px solid #333;
  background-color: white;
  margin-right: 5px;
}
.checkbox-preview::after {
  content: "";
  position: absolute;
  left: 30px;
  width: 60%;
  height: 2px;
  background-color: #ddd;
}

.select-preview {
  background-color: white;
  border: 1px solid #ddd;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
}
.select-preview::before {
  content: "";
  width: 60%;
  height: 2px;
  background-color: #ddd;
}
.select-preview::after {
  content: "▼";
  font-size: 10px;
  color: #333;
}

.table-preview {
  background-color: white;
  border: 1px solid #ddd;
  position: relative;
  overflow: hidden;
}
.table-preview::before {
  content: "";
  position: absolute;
  top: 25%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ddd;
  box-shadow: 0 10px 0 #ddd;
}
.table-preview::after {
  content: "";
  position: absolute;
  top: 0;
  left: 33%;
  width: 1px;
  height: 100%;
  background-color: #ddd;
  box-shadow: 10px 0 0 #ddd;
}

.whiteboard-canvas {
  flex: 1;
  position: relative;
  background-color: white;
  overflow: auto;
}

.empty-canvas {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
}

.canvas-component {
  position: absolute;
  left: var(--component-x, 0);
  top: var(--component-y, 0);
  width: var(--component-width, 100px);
  height: var(--component-height, 100px);
  background-color: var(--component-bg-color, white);
  color: var(--component-text-color, inherit);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: move;
  user-select: none;
}

/* Component type-specific styles */
.component-type-navbar {
  /* Add any navbar-specific styles here */
}

.component-type-input {
  /* Add any input-specific styles here */
}

.component-type-button {
  /* Add any button-specific styles here */
}

.component-type-card {
  /* Add any card-specific styles here */
}

.component-type-image {
  /* Add any image-specific styles here */
}

.component-type-text {
  /* Add any text-specific styles here */
}

.component-type-checkbox {
  /* Add any checkbox-specific styles here */
}

.component-type-select {
  /* Add any select-specific styles here */
}

.component-type-table {
  /* Add any table-specific styles here */
}

.canvas-component.selected {
  border: 2px solid #4CAF50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.component-controls {
  position: absolute;
  top: -20px;
  right: 0;
  display: flex;
  gap: 5px;
}

.editor-indicator {
  position: absolute;
  top: -25px;
  left: 0;
  background-color: #2196F3;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
}

.control-btn {
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.edit-btn {
  background-color: #2196F3;
  color: white;
}

/* Component Previews */
.preview-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 1rem;
}

.preview-navbar-brand {
  font-weight: bold;
}

.preview-navbar-links {
  display: flex;
  gap: 1rem;
}

.preview-input {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 0.5rem;
}

.preview-input-label {
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.preview-input-field {
  flex: 1;
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.preview-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.preview-card-header {
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.preview-card-body {
  padding: 0.75rem;
  flex: 1;
  overflow: auto;
}

.preview-card-footer {
  padding: 0.75rem;
  background-color: #f5f5f5;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
}

.preview-card-btn {
  padding: 0.25rem 0.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.preview-image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #666;
  font-size: 0.875rem;
}

.preview-text {
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
}

.preview-text p {
  margin: 0;
  line-height: 1.5;
  font-size: 0.875rem;
}

.preview-checkbox {
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
}

.preview-checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.preview-checkbox-item input[type="checkbox"] {
  margin-right: 0.5rem;
}

.preview-select {
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.preview-select-label {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.preview-select-dropdown {
  width: 100%;
  padding: 0.375rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.preview-table {
  width: 100%;
  height: 100%;
  padding: 0.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

.preview-table-title {
  margin: 0 0 0.5rem 0;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
}

.preview-table table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: 0.375rem;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 0.75rem;
}

.preview-table th {
  background-color: var(--header-bg-color, #f5f5f5);
  font-weight: bold;
}

.table-header {
  background-color: var(--header-bg-color, #f5f5f5);
}

/* Code Modal */
.code-modal {
  width: 90%;
  max-width: 800px;
  height: 80%;
  max-height: 600px;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 1rem;
}

.code-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
}

.code-tab.active {
  border-bottom: 2px solid #4CAF50;
  font-weight: bold;
}

.code-content {
  height: 400px;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
}

.components-code {
  max-height: 500px;
  overflow-y: auto;
}

.component-code-section {
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.component-code-section h3 {
  margin: 0;
  padding: 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.component-code-tabs {
  display: flex;
  background-color: #f8f8f8;
  border-bottom: 1px solid #ddd;
}

.component-code-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.component-code-tab.active {
  background-color: #fff;
  color: #333;
  border-bottom: 2px solid #007bff;
}

.component-code-section pre {
  margin: 0;
  border-radius: 0;
}

.no-components {
  padding: 2rem;
  text-align: center;
  color: #666;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.copy-btn {
  margin-top: 1rem;
}

.edit-divider {
  margin: 1rem 0;
  border: none;
  border-top: 1px solid #ddd;
}

.common-edit-fields {
  margin-bottom: 1rem;
}

.input-with-button,
.textarea-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.input-with-button .form-input,
.textarea-with-button .form-input {
  flex: 1;
}

.input-with-button .btn,
.textarea-with-button .btn {
  white-space: nowrap;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .whiteboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    margin-bottom: 1rem;
    width: 100%;
  }

  .connected-users {
    flex-direction: column;
    align-items: flex-start;
  }

  .users-label {
    margin-bottom: 0.5rem;
  }

  .whiteboard-actions {
    margin-top: 1rem;
    width: 100%;
    flex-wrap: wrap;
  }

  .whiteboard-container {
    flex-direction: column;
    height: auto;
  }

  .components-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #ddd;
  }

  .whiteboard-canvas {
    height: 500px;
  }
}
</style>
