<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: (Database['public']['Tables']['order_items']['Row'] & {
    products: Database['public']['Tables']['products']['Row']
  })[]
}

const orders = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data: ordersData, error: err } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (err) throw err
    orders.value = ordersData
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Order History</h1>
    
    <div v-if="loading" class="text-center py-8">
      Loading orders...
    </div>
    
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
      {{ error }}
    </div>
    
    <div v-else-if="orders.length === 0" class="text-center py-8 text-gray-500">
      You haven't placed any orders yet.
    </div>
    
    <div v-else class="space-y-6">
      <div v-for="order in orders" :key="order.id" 
        class="bg-white rounded-lg shadow-md p-6"
      >
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-lg font-semibold">Order #{{ order.id.slice(0, 8) }}</h3>
            <p class="text-gray-500">
              {{ new Date(order.created_at!).toLocaleDateString() }}
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold">Total: ${{ order.total_amount.toFixed(2) }}</p>
            <p class="text-sm text-gray-500">Status: {{ order.status }}</p>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <h4 class="font-medium mb-2">Items</h4>
          <div class="space-y-2">
            <div v-for="item in order.order_items" :key="item.id" 
              class="flex justify-between items-center"
            >
              <div class="flex items-center">
                <img 
                  v-if="item.products.image_url"
                  :src="item.products.image_url"
                  :alt="item.products.name"
                  class="w-12 h-12 object-cover rounded mr-3"
                >
                <div>
                  <p class="font-medium">{{ item.products.name }}</p>
                  <p class="text-sm text-gray-500">
                    Quantity: {{ item.quantity }} × ${{ item.price_at_time.toFixed(2) }}
                  </p>
                </div>
              </div>
              <p class="font-medium">
                ${{ (item.quantity * item.price_at_time).toFixed(2) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>