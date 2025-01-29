<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useCartStore } from '../stores/cart'
import type { Database } from '../types/supabase'

type Product = Database['public']['Tables']['products']['Row']

const route = useRoute()
const cartStore = useCartStore()
const product = ref<Product | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const quantity = ref(1)

onMounted(async () => {
  try {
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (err) throw err
    product.value = data
  } catch (err) {
    console.error('Error loading product:', err)
    error.value = 'Failed to load product details'
  } finally {
    loading.value = false
  }
})

function addToCart() {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="text-center py-8">
      Loading product details...
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error }}
    </div>
    
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <img 
          v-if="product.image_url" 
          :src="product.image_url" 
          :alt="product.name"
          class="w-full rounded-lg shadow-lg object-cover"
        >
        <div v-else class="w-full h-96 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div class="space-y-6">
        <h1 class="text-3xl font-bold">{{ product.name }}</h1>
        <p class="text-gray-600">{{ product.description }}</p>
        <p class="text-2xl font-bold">${{ product.price.toFixed(2) }}</p>
        
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <label class="font-medium">Quantity:</label>
            <div class="flex items-center space-x-2">
              <button 
                @click="quantity = Math.max(1, quantity - 1)"
                class="px-2 py-1 border rounded hover:bg-gray-100"
              >
                -
              </button>
              <span class="w-8 text-center">{{ quantity }}</span>
              <button 
                @click="quantity++"
                class="px-2 py-1 border rounded hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          
          <button 
            @click="addToCart"
            class="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
        
        <div class="border-t pt-6 mt-6">
          <h2 class="text-lg font-semibold mb-2">Product Details</h2>
          <dl class="space-y-2">
            <div class="flex">
              <dt class="font-medium w-24">SKU:</dt>
              <dd>{{ product.sku }}</dd>
            </div>
            <div class="flex">
              <dt class="font-medium w-24">Category:</dt>
              <dd>{{ product.category }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-8">
      Product not found
    </div>
  </div>
</template> 