<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { backend } from 'libs'
import Tree from 'primevue/tree'
import DataView from 'primevue/dataview'
import Card from 'primevue/card'
import ProgressSpinner from 'primevue/progressspinner'
import type { TreeNode } from 'primevue/treenode'

// Types
interface Folder {
  id: string
  name: string
  parentId: string | null
  path: string
  createdAt: Date | null
  updatedAt: Date | null
}

interface File {
  id: string
  name: string
  parentId: string
  path: string
  size: number | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface FolderChildren {
  folders: Folder[]
  files: File[]
}

// Reactive state
const allFolders = ref<Folder[]>([])
const allFiles = ref<File[]>([])
const treeNodes = ref<TreeNode[]>([])
const selectedFolder = ref<string | null>(null)
const selectedKeys = ref<{[key: string]: boolean}>({})
const rightPanelData = ref<FolderChildren>({ folders: [], files: [] })
const loading = ref(true)
const rightPanelLoading = ref(false)

// Build tree structure from folders and files
const buildTree = (folders: Folder[], files: File[]): TreeNode[] => {
  const folderMap = new Map<string, TreeNode>()
  const rootNodes: TreeNode[] = []

  // Create folder nodes first
  folders.forEach((folder) => {
    const node: TreeNode = {
      key: folder.id,
      label: folder.name,
      icon: 'pi pi-folder',
      children: [],
      data: { ...folder, type: 'folder' },
    }
    folderMap.set(folder.id, node)
  })

  // Build parent-child relationships for folders
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)
    if (!node) return

    if (folder.parentId === null) {
      rootNodes.push(node)
    } else {
      const parent = folderMap.get(folder.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(node)
      }
    }
  })

  // Add files as leaf nodes to their parent folders
  files.forEach((file) => {
    const parent = folderMap.get(file.parentId)
    if (parent) {
      parent.children = parent.children || []
      parent.children.push({
        key: `file-${file.id}`,
        label: file.name,
        icon: 'pi pi-file',
        leaf: true,
        data: { ...file, type: 'file' },
      })
    }
  })

  return rootNodes
}

// Load all folders and files, then build tree
const loadFolders = async () => {
  try {
    loading.value = true
    const [foldersResponse, filesResponse] = await Promise.all([
      backend.api.v1.folders.get(),
      backend.api.v1.folders.files.get()
    ])

    if (foldersResponse.data?.success && foldersResponse.data.data) {
      allFolders.value = foldersResponse.data.data
    }

    if (filesResponse.data?.success && filesResponse.data.data) {
      allFiles.value = filesResponse.data.data
    }

    treeNodes.value = buildTree(allFolders.value, allFiles.value)
  } catch (error) {
    console.error('Error loading folders and files:', error)
  } finally {
    loading.value = false
  }
}

// Load children of selected folder
const loadFolderChildren = async (folderId: string) => {
  try {
    rightPanelLoading.value = true
    const response = await backend.api.v1.folders[folderId].children.get()

    if (response.data?.success && response.data.data) {
      rightPanelData.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading folder children:', error)
    rightPanelData.value = { folders: [], files: [] }
  } finally {
    rightPanelLoading.value = false
  }
}

// Handle folder selection in tree
const onNodeSelect = (node: TreeNode) => {
  if (node.key && node.data?.type === 'folder') {
    selectedFolder.value = node.key as string
    selectedKeys.value = { [node.key as string]: true }
    loadFolderChildren(node.key as string)
  }
}

// Handle folder click in right panel
const onFolderClick = (folder: Folder) => {
  selectedFolder.value = folder.id
  selectedKeys.value = { [folder.id]: true }
  loadFolderChildren(folder.id)
}

// Format file size
const formatFileSize = (bytes: number | null): string => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Format date
const formatDate = (date: Date | null): string => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString()
}

// Initialize on mount
onMounted(() => {
  loadFolders()
})
</script>

<template>
  <div class="h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <h1 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <i class="pi pi-folder text-blue-600"></i>
        File Manager
      </h1>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel - Folder Tree -->
      <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div class="px-4 py-3 border-b border-gray-100">
          <h2 class="text-sm font-medium text-gray-600 uppercase tracking-wide">
            File Tree
          </h2>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <div v-if="loading" class="flex justify-center items-center h-32">
            <ProgressSpinner class="w-8 h-8" />
          </div>

          <Tree
            v-else
            :value="treeNodes"
            selectionMode="single"
            v-model:selectionKeys="selectedKeys"
            @node-select="onNodeSelect"
            class="w-full"
          >
            <template #default="{ node }">
              <div class="flex items-center gap-2 py-1">
                <span
                  :class="[
                    'text-sm',
                    node.data?.type === 'file' ? 'text-gray-600' : 'text-gray-700'
                  ]"
                >
                  {{ node.label }}
                </span>
              </div>
            </template>
          </Tree>
        </div>
      </div>

      <!-- Right Panel - Folder Contents -->
      <div class="flex-1 bg-gray-50 flex flex-col">
        <div class="px-6 py-4 bg-white border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-800">
            {{ selectedFolder ? 'Folder Contents' : 'Select a folder to view its contents' }}
          </h2>
          <p v-if="selectedFolder" class="text-sm text-gray-500 mt-1">
            {{ rightPanelData.folders.length }} folders, {{ rightPanelData.files.length }} files
          </p>
        </div>

        <div class="flex-1 overflow-auto p-6">
          <div
            v-if="!selectedFolder"
            class="flex flex-col items-center justify-center h-full text-gray-500"
          >
            <i class="pi pi-folder-open text-6xl mb-4"></i>
            <p class="text-lg">Select a folder from the tree to view its contents</p>
          </div>

          <div v-else-if="rightPanelLoading" class="flex justify-center items-center h-32">
            <ProgressSpinner class="w-8 h-8" />
          </div>

          <div v-else class="space-y-6">
            <!-- Folders Section -->
            <div v-if="rightPanelData.folders.length > 0">
              <h3 class="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">
                Folders
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  v-for="folder in rightPanelData.folders"
                  :key="folder.id"
                  :class="[
                    'cursor-pointer hover:shadow-md transition-shadow',
                    selectedFolder === folder.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  ]"
                  @click="onFolderClick(folder)"
                >
                  <template #content>
                    <div class="flex items-center gap-3">
                      <i class="pi pi-folder text-2xl text-blue-600"></i>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 truncate">{{ folder.name }}</h4>
                        <p class="text-xs text-gray-500 mt-1">
                          {{ formatDate(folder.createdAt) }}
                        </p>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </div>

            <!-- Files Section -->
            <div v-if="rightPanelData.files.length > 0">
              <h3 class="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">Files</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                  v-for="file in rightPanelData.files"
                  :key="file.id"
                  class="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <template #content>
                    <div class="flex items-center gap-3">
                      <i class="pi pi-file text-2xl text-gray-600"></i>
                      <div class="flex-1 min-w-0">
                        <h4 class="font-medium text-gray-800 truncate">{{ file.name }}</h4>
                        <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{{ formatFileSize(file.size) }}</span>
                          <span>•</span>
                          <span>{{ formatDate(file.createdAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="rightPanelData.folders.length === 0 && rightPanelData.files.length === 0"
              class="flex flex-col items-center justify-center h-64 text-gray-500"
            >
              <i class="pi pi-inbox text-4xl mb-3"></i>
              <p class="text-lg">This folder is empty</p>
              <p class="text-sm">No folders or files to display</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better tree appearance */
:deep(.p-tree) {
  border: none;
  background: transparent;
}

:deep(.p-tree .p-tree-container) {
  background: transparent;
}

:deep(.p-tree .p-treenode) {
  padding: 0;
}

:deep(.p-tree .p-treenode-content) {
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

:deep(.p-tree .p-treenode-content:hover) {
  background-color: #f3f4f6;
}

:deep(.p-tree .p-treenode-content.p-highlight) {
  background-color: #dbeafe;
  color: #1e40af;
}

/* Style file nodes differently */
:deep(.p-tree .p-treenode[data-p-highlight="false"] .p-treenode-content:has(.pi-file)) {
  opacity: 0.8;
}

:deep(.p-tree .p-treenode[data-p-highlight="false"] .p-treenode-content:has(.pi-file):hover) {
  background-color: #f9fafb;
  cursor: default;
}

:deep(.p-tree .p-tree-toggler) {
  width: 1.5rem;
  height: 1.5rem;
  color: #6b7280;
}

:deep(.p-tree .p-tree-toggler:hover) {
  color: #374151;
}

/* Card hover effects */
:deep(.p-card) {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

:deep(.p-card:hover) {
  border-color: #d1d5db;
  transform: translateY(-1px);
}

:deep(.p-card .p-card-body) {
  padding: 1rem;
}

:deep(.p-card .p-card-content) {
  padding: 0;
}
</style>
