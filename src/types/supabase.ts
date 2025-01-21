export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Product = Database['public']['Tables']['products']['Row']

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          sku: string
          image_url: string | null
          category: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          sku: string
          image_url?: string | null
          category?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          sku?: string
          image_url?: string | null
          category?: string | null
          created_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          total_amount: number
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          company_name: string
          total_amount: number
          status: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          company_name?: string
          total_amount?: number
          status?: string
          created_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_time: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_time?: number
          created_at?: string | null
        }
      }
    }
  }
}