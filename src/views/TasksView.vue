<template>
  <ManagerView v-if="authStore.isManager" />
  <WorkerView v-else />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'
import ManagerView from './ManagerView.vue'
import WorkerView from './WorkerView.vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  // Restore session if needed
  if (!authStore.isAuthenticated) {
    authStore.restoreSession()
  }
  
  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
  }
})
</script>

