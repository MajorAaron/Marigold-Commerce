<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { supabase } from '../lib/supabase'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const error = ref<string | null>(null)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  companyName: '',
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

async function handleSubmit() {
  if (loading.value) return
  
  // Basic validation
  if (!form.value.firstName || !form.value.lastName || !form.value.email || 
      !form.value.companyName || !form.value.cardNumber || !form.value.expiryDate || 
      !form.value.cvv) {
    error.value = 'All fields are required'
    return
  }
  
  if (!form.value.email.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        first_name: form.value.firstName,
        last_name: form.value.lastName,
        email: form.value.email,
        company_name: form.value.companyName,
        total_amount: cartStore.total,
        status: 'pending'
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    if (!order) throw new Error('Failed to create order')
    
    // Create order items
    const orderItems = cartStore.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      price_at_time: item.product.price
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    // Clear cart and redirect to confirmation
    cartStore.clearCart()
    router.push(`/order-confirmation/${order.id}`)
  } catch (err) {
    error.value = (err as Error).message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-8">Checkout</h1>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="error" class="bg-red-100 text-red-700 p-4 rounded mb-4">
        {{ error }}
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block mb-1">First Name</label>
          <input 
            v-model="form.firstName"
            type="text"
            class="w-full p-2 border rounded"
            required
          >
        </div>
        
        <div>
          <label class="block mb-1">Last Name</label>
          <input 
            v-model="form.lastName"
            type="text"
            class="w-full p-2 border rounded"
            required
          >
        </div>
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
        <label class="block mb-1">Company Name</label>
        <input 
          v-model="form.companyName"
          type="text"
          class="w-full p-2 border rounded"
          required
        >
      </div>
      
      <div class="border-t pt-6">
        <h2 class="text-xl font-semibold mb-4">Payment Information</h2>
        
        <div>
          <label class="block mb-1">Card Number</label>
          <input 
            v-model="form.cardNumber"
            type="text"
            class="w-full p-2 border rounded"
            required
          >
        </div>
        
        <div class="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label class="block mb-1">Expiry Date</label>
            <input 
              v-model="form.expiryDate"
              type="text"
              placeholder="MM/YY"
              class="w-full p-2 border rounded"
              required
            >
          </div>
          
          <div>
            <label class="block mb-1">CVV</label>
            <input 
              v-model="form.cvv"
              type="text"
              class="w-full p-2 border rounded"
              required
            >
          </div>
        </div>
      </div>
      
      <div class="border-t pt-6">
        <div class="flex justify-between mb-4">
          <span>Total</span>
          <span class="font-bold">${{ cartStore.total.toFixed(2) }}</span>
        </div>
        
        <button 
          type="submit"
          class="w-full bg-blue-500 text-white py-3 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Processing...' : 'Place Order' }}
        </button>
      </div>
    </form>
  </div>
</template>