<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()

const cartItems = computed(() => cartStore.items)
const total = computed(() => cartStore.total)

function updateQuantity(productId: string, quantity: number) {
  if (quantity < 1) {
    cartStore.removeItem(productId)
  } else {
    cartStore.updateQuantity(productId, quantity)
  }
}

function checkout() {
  router.push('/checkout')
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>
    
    <div v-if="cartItems.length === 0" class="text-center py-8">
      Your cart is empty
    </div>
    
    <div v-else>
      <div class="space-y-4">
        <div v-for="item in cartItems" :key="item.product.id" class="flex items-center justify-between border-b pb-4">
          <div class="flex items-center space-x-4">
            <img 
              v-if="item.product.image_url" 
              :src="item.product.image_url" 
              :alt="item.product.name"
              class="w-16 h-16 object-cover rounded"
            >
            <div>
              <h3 class="font-semibold">{{ item.product.name }}</h3>
              <p class="text-gray-600">${{ item.product.price.toFixed(2) }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <button 
                @click="updateQuantity(item.product.id, item.quantity - 1)"
                class="px-2 py-1 border rounded"
              >
                -
              </button>
              <span>{{ item.quantity }}</span>
              <button 
                @click="updateQuantity(item.product.id, item.quantity + 1)"
                class="px-2 py-1 border rounded"
              >
                +
              </button>
            </div>
            
            <p class="font-semibold">${{ (item.product.price * item.quantity).toFixed(2) }}</p>
            
            <button 
              @click="cartStore.removeItem(item.product.id)"
              class="text-red-500"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div class="mt-8 flex justify-between items-center">
        <p class="text-xl font-bold">Total: ${{ total.toFixed(2) }}</p>
        <button 
          @click="checkout"
          class="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>