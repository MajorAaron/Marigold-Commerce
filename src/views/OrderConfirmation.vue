<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/supabase'

type Order = Database['public']['Tables']['orders']['Row']
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  products: Database['public']['Tables']['products']['Row']
}

const route = useRoute()
const loading = ref(true)
const error = ref<string | null>(null)
const order = ref<Order | null>(null)
const orderItems = ref<OrderItem[]>([])

onMounted(async () => {
  try {
    const orderId = route.params.id as string
    
    // Fetch order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select()
      .eq('id', orderId)
      .single()
    
    if (orderError) throw orderError
    if (!orderData) throw new Error('Order not found')
    
    order.value = orderData
    
    // Fetch order items with products
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products (*)
      `)
      .eq('order_id', orderId)
    
    if (itemsError) throw itemsError
    orderItems.value = itemsData
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div v-if="loading" class="text-center py-8">
      Loading order details...
    </div>
    
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded">
      {{ error }}
    </div>
    
    <div v-else-if="order" class="space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p class="text-gray-600">Thank you for your order</p>
      </div>
      
      <div class="border rounded-lg p-6 space-y-4">
        <div class="flex justify-between border-b pb-4">
          <div>
            <p class="font-semibold">Order Number</p>
            <p class="text-gray-600">{{ order.id }}</p>
          </div>
          <div class="text-right">
            <p class="font-semibold">Order Date</p>
            <p class="text-gray-600">{{ new Date(order.created_at!).toLocaleDateString() }}</p>
          </div>
        </div>
        
        <div>
          <h2 class="font-semibold mb-2">Order Details</h2>
          <div class="space-y-2">
            <div v-for="item in orderItems" :key="item.id" class="flex justify-between">
              <span>{{ item.products.name }} × {{ item.quantity }}</span>
              <span>${{ (item.price_at_time * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <div class="flex justify-between font-bold">
            <span>Total</span>
            <span>${{ order.total_amount.toFixed(2) }}</span>
          </div>
        </div>
      </div>
      
      <div class="border rounded-lg p-6">
        <h2 class="font-semibold mb-4">Customer Information</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="font-semibold">Name</p>
            <p class="text-gray-600">{{ order.first_name }} {{ order.last_name }}</p>
          </div>
          <div>
            <p class="font-semibold">Email</p>
            <p class="text-gray-600">{{ order.email }}</p>
          </div>
          <div>
            <p class="font-semibold">Company</p>
            <p class="text-gray-600">{{ order.company_name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>