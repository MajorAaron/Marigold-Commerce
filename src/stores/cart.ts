import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Database } from '../types/supabase'
import { signalsService } from '../services/signals'

type Product = Database['public']['Tables']['products']['Row']

interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity)
    }, 0)
  })

  function addItem(product: Product, quantity: number = 1) {
    const existingItem = items.value.find(item => item.product.id === product.id)
    if (existingItem) {
      existingItem.quantity += quantity
      signalsService.trackUpdateCart(product, existingItem.quantity)
    } else {
      items.value.push({ product, quantity })
      signalsService.trackAddToCart(product, quantity)
    }
    saveToLocalStorage()
  }

  function removeItem(productId: string) {
    signalsService.trackRemoveFromCart(productId)
    items.value = items.value.filter(item => item.product.id !== productId)
    saveToLocalStorage()
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity = quantity
      signalsService.trackUpdateCart(item.product, quantity)
      saveToLocalStorage()
    }
  }

  function clearCart() {
    signalsService.trackClearCart()
    items.value = []
    saveToLocalStorage()
  }

  function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      items.value = JSON.parse(savedCart)
    }
  }

  // Load cart from localStorage when store is created
  loadFromLocalStorage()

  return {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  }
})