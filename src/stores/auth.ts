import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

// Initialize auth state
const { data } = await supabase.auth.getSession()

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(data?.session?.user ?? null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null
  })

  async function login(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (err) throw err
      user.value = data.user
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string) {
    try {
      loading.value = true
      error.value = null
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password
      })
      if (err) throw err
      user.value = data.user
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      loading.value = true
      error.value = null
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
      user.value = null
    } catch (err) {
      error.value = (err as Error).message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout
  }
})