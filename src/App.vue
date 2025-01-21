<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { computed, ref } from 'vue'
import { MutationType } from 'pinia'

const authStore = useAuthStore()
const cartStore = useCartStore()

const cartItemCount = computed(() => {
  return cartStore.items.reduce((sum, item) => sum + item.quantity, 0)
})

const cartTotal = computed(() => cartStore.total)

const isCartOpen = ref(false)
const showAddedNotification = ref(false)
const lastAddedItem = ref('')

// Listen for cart updates
cartStore.$subscribe((mutation, _state) => {
  if (mutation.type === MutationType.direct) {
    const storeEvent = mutation.events as unknown as { type: string; payload: { product: { name: string } } }
    if (storeEvent?.type === 'addItem') {
      lastAddedItem.value = storeEvent.payload.product.name
      showAddedNotification.value = true
      setTimeout(() => {
        showAddedNotification.value = false
      }, 2000)
    }
  }
})
</script>

<template>
  <nav class="bg-gray-800 text-white p-4 mb-8">
    <div class="container mx-auto flex justify-between items-center">
      <router-link to="/" class="text-xl font-bold">Store</router-link>
      <div class="flex items-center space-x-4">
        <router-link to="/" class="hover:text-gray-300">Home</router-link>
        <router-link to="/products" class="hover:text-gray-300">Products</router-link>        
        
        <!-- Orders Link (only shown when logged in) -->
        <router-link 
          v-if="authStore.user" 
          to="/orders" 
          class="hover:text-gray-300"
        >
          Orders
        </router-link>
        
        <!-- User Info -->
        <div v-if="authStore.user" class="flex items-center space-x-2">
          <span class="text-gray-300">
            {{ authStore.user.email }}
          </span>
        </div>
        
        <div class="relative">
          <button 
            @click="isCartOpen = !isCartOpen"
            class="flex items-center hover:text-gray-300"
          >
            <span class="mr-2">Cart</span>
            <span v-if="cartItemCount > 0" 
              class="bg-blue-500 text-white text-xs rounded-full px-2 py-1 transition-all duration-300 animate-bounce"
            >
              {{ cartItemCount }}
            </span>
          </button>
          
          <!-- Cart Preview Dropdown -->
          <div v-if="isCartOpen" 
            class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl text-gray-800 z-50"
          >
            <div class="p-4">
              <h3 class="font-bold mb-2">Cart Summary</h3>
              <div v-if="cartStore.items.length === 0" class="text-gray-500">
                Your cart is empty
              </div>
              <div v-else>
                <div class="space-y-2 mb-4 max-h-60 overflow-auto">
                  <div v-for="item in cartStore.items" 
                    :key="item.product.id"
                    class="flex justify-between items-center text-sm"
                  >
                    <div class="flex items-center">
                      <img 
                        v-if="item.product.image_url"
                        :src="item.product.image_url"
                        :alt="item.product.name"
                        class="w-10 h-10 object-cover rounded mr-2"
                      >
                      <div>
                        <div class="font-medium">{{ item.product.name }}</div>
                        <div class="text-gray-500">
                          {{ item.quantity }} × ${{ item.product.price.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                    <button 
                      @click="cartStore.removeItem(item.product.id)"
                      class="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div class="border-t pt-2">
                  <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${{ cartTotal.toFixed(2) }}</span>
                  </div>
                  <router-link 
                    to="/cart"
                    class="block w-full text-center bg-blue-500 text-white rounded py-2 px-4 mt-2 hover:bg-blue-600"
                    @click="isCartOpen = false"
                  >
                    View Cart
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <template v-if="!authStore.user">
            <router-link to="/login" class="hover:text-gray-300">Login</router-link>
            <router-link to="/register" class="hover:text-gray-300">Register</router-link>
          </template>
          <button 
            v-else 
            @click="authStore.logout" 
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
  
  <!-- Added to Cart Notification -->
  <Transition name="notification">
    <div v-if="showAddedNotification" 
      class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      <span>Added {{ lastAddedItem }} to cart</span>
    </div>
  </Transition>
  
  <div class="container mx-auto px-4">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}</style>

<style>
body {
  min-height: 100vh;
  margin: 0;
  background-color: #f9fafb;
}

/* Notification Animation */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Cart Counter Animation */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-25%);
  }
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out;
}
</style>
