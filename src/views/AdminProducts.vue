<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import type { Product } from '../types/supabase'

const products = ref<Product[]>([])
const newProduct = ref({
  name: '',
  description: '',
  price: 0,
  sku: '',
  category: '',
  image_url: ''
})
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const loading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const editingProduct = ref<Product | null>(null)

async function loadProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    products.value = data
  } catch (error) {
    console.error('Error loading products:', error)
    errorMessage.value = 'Failed to load products. Please try again.'
  }
}

async function uploadImage(file: File) {
  try {
    errorMessage.value = ''
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // Simple upload without progress tracking
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    uploadProgress.value = 100
    return publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    errorMessage.value = 'Failed to upload image. Please try again.'
    throw error
  }
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    selectedFile.value = file
    
    // Create preview URL
    imagePreview.value = URL.createObjectURL(file)
    
    // Reset error and progress
    errorMessage.value = ''
    uploadProgress.value = 0
  }
}

async function addProduct() {
  try {
    loading.value = true
    errorMessage.value = ''
    let imageUrl = ''

    if (selectedFile.value) {
      imageUrl = await uploadImage(selectedFile.value)
    }

    const { error } = await supabase
      .from('products')
      .insert([{
        ...newProduct.value,
        image_url: imageUrl
      }])

    if (error) throw error

    // Reset form
    newProduct.value = {
      name: '',
      description: '',
      price: 0,
      sku: '',
      category: '',
      image_url: ''
    }
    selectedFile.value = null
    imagePreview.value = null
    uploadProgress.value = 0
    await loadProducts()
  } catch (error) {
    console.error('Error adding product:', error)
    errorMessage.value = 'Failed to add product. Please try again.'
  } finally {
    loading.value = false
  }
}

async function updateProduct(product: Product) {
  try {
    loading.value = true
    errorMessage.value = ''
    let imageUrl = product.image_url

    if (selectedFile.value) {
      imageUrl = await uploadImage(selectedFile.value)
      console.log('New image URL:', imageUrl)
    }

    // Create update object with all fields
    const updateData = {
      name: product.name,
      description: product.description,
      price: product.price,
      sku: product.sku,
      category: product.category,
      image_url: imageUrl
    }

    console.log('Updating product with:', updateData)

    // First update the product
    const { error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', product.id)

    if (updateError) throw updateError

    // Then fetch the updated product
    const { data: updatedProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product.id)
      .single()

    if (fetchError) throw fetchError

    // Update the product in the local state immediately
    const index = products.value.findIndex(p => p.id === product.id)
    if (index !== -1) {
      products.value[index] = updatedProduct
      // Force Vue to recognize the change
      products.value = [...products.value]
    }

    // Reset states
    editingProduct.value = null
    imagePreview.value = null
    selectedFile.value = null
    uploadProgress.value = 0
    
    // Reload products to ensure sync
    await loadProducts()
  } catch (error) {
    console.error('Error updating product:', error)
    errorMessage.value = 'Failed to update product. Please try again.'
  } finally {
    loading.value = false
  }
}

async function deleteProduct(id: string) {
  if (!confirm('Are you sure you want to delete this product?')) return

  try {
    errorMessage.value = ''
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    await loadProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    errorMessage.value = 'Failed to delete product. Please try again.'
  }
}

// Cleanup preview URL when component unmounts
onUnmounted(() => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
})

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Product Management</h1>

    <!-- Error Message -->
    <div v-if="errorMessage" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span class="block sm:inline">{{ errorMessage }}</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="errorMessage = ''">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
        </svg>
      </span>
    </div>

    <!-- Add New Product Form -->
    <div class="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 class="text-xl font-semibold mb-4">Add New Product</h2>
      <form @submit.prevent="addProduct" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input v-model="newProduct.name" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">SKU</label>
            <input v-model="newProduct.sku" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Price</label>
            <input v-model="newProduct.price" required type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <input v-model="newProduct.category" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea v-model="newProduct.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Product Image</label>
            <div class="mt-1 flex items-center space-x-4">
              <input type="file" accept="image/*" @change="handleFileSelect" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
              <div v-if="imagePreview" class="relative w-24 h-24">
                <img :src="imagePreview" class="w-24 h-24 object-cover rounded-md">
                <button type="button" @click="imagePreview = null; selectedFile = null" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
              <div class="bg-gray-200 rounded-full h-2.5">
                <div class="bg-indigo-600 h-2.5 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <span class="text-sm text-gray-500">Uploading: {{ uploadProgress }}%</span>
            </div>
          </div>
        </div>
        <button type="submit" :disabled="loading" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Adding...' : 'Add Product' }}
        </button>
      </form>
    </div>

    <!-- Products List -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <img v-if="product.image_url" :src="product.image_url" alt="Product" class="h-12 w-12 object-cover rounded">
                <div v-else class="h-12 w-12 bg-gray-200 rounded"></div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.sku }}</td>
              <td class="px-6 py-4 whitespace-nowrap">${{ product.price.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="editingProduct = product" class="text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
                <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div v-if="editingProduct" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 class="text-xl font-semibold mb-4">Edit Product</h2>
        <form @submit.prevent="updateProduct(editingProduct)" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input v-model="editingProduct.name" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">SKU</label>
              <input v-model="editingProduct.sku" required type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Price</label>
              <input v-model="editingProduct.price" required type="number" step="0.01" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Category</label>
              <input v-model="editingProduct.category" type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="editingProduct.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"></textarea>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Current Image</label>
              <div class="mt-2 flex items-center space-x-4">
                <img v-if="editingProduct.image_url" :src="editingProduct.image_url" alt="Current product image" class="h-24 w-24 object-cover rounded-md">
                <div v-else class="h-24 w-24 bg-gray-200 rounded-md flex items-center justify-center">
                  <span class="text-gray-400">No image</span>
                </div>
              </div>
              
              <label class="block text-sm font-medium text-gray-700 mt-4">New Product Image (optional)</label>
              <div class="mt-1 flex items-center space-x-4">
                <input type="file" accept="image/*" @change="handleFileSelect" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
                <div v-if="imagePreview" class="relative w-24 h-24">
                  <img :src="imagePreview" class="w-24 h-24 object-cover rounded-md">
                  <button type="button" @click="imagePreview = null; selectedFile = null" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Upload Progress -->
              <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-2">
                <div class="bg-gray-200 rounded-full h-2.5">
                  <div class="bg-indigo-600 h-2.5 rounded-full" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <span class="text-sm text-gray-500">Uploading: {{ uploadProgress }}%</span>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="editingProduct = null; imagePreview = null; selectedFile = null" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {{ loading ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 