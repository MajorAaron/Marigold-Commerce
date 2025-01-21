<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'
import { useCartStore } from '../stores/cart'

type Product = Database['public']['Tables']['products']['Row']

const products = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const cartStore = useCartStore()

onMounted(async () => {
  try {
    console.log('Fetching products...')
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('name')
    
    console.log('Supabase response:', { data, error: err })
    
    if (err) throw err
    products.value = data
    console.log('Products loaded:', products.value)
  } catch (err) {
    console.error('Error loading products:', err)
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})

function addToCart(product: Product) {
  cartStore.addItem(product, 1)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Products</h1>
    
    <div v-if="loading" class="text-center py-8">
      Loading products...
    </div>
    
    <div v-else-if="error" class="text-red-500 text-center py-8">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="product in products" :key="product.id" class="border rounded-lg p-4">
        <img 
          v-if="product.image_url" 
          :src="product.image_url" 
          :alt="product.name"
          class="w-full max-w-[500px] h-48 object-cover rounded-lg mb-4 mx-auto"
        >
        <h2 class="text-xl font-semibold mb-2">{{ product.name }}</h2>
        <p class="text-gray-600 mb-2">{{ product.description }}</p>
        <p class="text-lg font-bold mb-4">${{ product.price.toFixed(2) }}</p>
        <button 
          @click="addToCart(product)"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
</template>