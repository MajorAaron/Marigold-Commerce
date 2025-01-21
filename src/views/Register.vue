<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const validationError = ref<string | null>(null)

async function handleSubmit() {
  validationError.value = null
  
  if (form.value.password !== form.value.confirmPassword) {
    validationError.value = 'Passwords do not match'
    return
  }
  
  await authStore.register(form.value.email, form.value.password)
  if (!authStore.error) {
    router.push('/')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-md">
    <h1 class="text-3xl font-bold mb-8 text-center">Register</h1>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-if="authStore.error || validationError" class="bg-red-100 text-red-700 p-4 rounded mb-4">
        {{ authStore.error || validationError }}
      </div>
      
      <div>
        <label class="block mb-1">Email</label>
        <input 
          v-model="form.email"
          type="email"
          class="w-full p-2 border rounded"
          required
        >
      </div>
      
      <div>
        <label class="block mb-1">Password</label>
        <input 
          v-model="form.password"
          type="password"
          class="w-full p-2 border rounded"
          required
        >
      </div>
      
      <div>
        <label class="block mb-1">Confirm Password</label>
        <input 
          v-model="form.confirmPassword"
          type="password"
          class="w-full p-2 border rounded"
          required
        >
      </div>
      
      <button 
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? 'Creating account...' : 'Register' }}
      </button>
      
      <p class="text-center mt-4">
        Already have an account? 
        <router-link to="/login" class="text-blue-500 hover:text-blue-600">
          Login
        </router-link>
      </p>
    </form>
  </div>
</template>