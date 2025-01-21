import type { Product } from '../types/supabase'

declare global {
  interface Window {
    Signals?: any;
  }
}

export class SignalsService {
  private static instance: SignalsService;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): SignalsService {
    if (!SignalsService.instance) {
      SignalsService.instance = new SignalsService();
    }
    return SignalsService.instance;
  }

  public async initialize(authKey: string): Promise<void> {
    if (this.initialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = new Promise<void>((resolve, reject) => {
      try {
        // Load the Signals SDK script
        const script = document.createElement('script');
        script.src = 'https://mmx-us-signals-js.s3.us-east-1.amazonaws.com/us/public/index.js';
        script.defer = true;
        script.onerror = (error) => {
          console.error('Failed to load Signals SDK:', error);
          reject(error);
        };
        
        script.onload = () => {
          if (window.Signals) {
            try {
              window.Signals.setAuthKey(authKey);
              this.initialized = true;
              console.log('Signals SDK initialized successfully');
              resolve();
            } catch (error) {
              console.error('Failed to initialize Signals SDK:', error);
              reject(error);
            }
          } else {
            const error = new Error('Signals SDK not available after script load');
            console.error(error);
            reject(error);
          }
        };

        document.head.appendChild(script);
      } catch (error) {
        console.error('Error during Signals SDK initialization:', error);
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized && this.initializationPromise) {
      await this.initializationPromise;
    }
    if (!this.initialized) {
      throw new Error('Signals SDK not initialized');
    }
  }

  public async trackAddToCart(product: Product, quantity: number): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!window.Signals) return;

      await window.Signals.addToCart({
        cartId: 'cart',
        email: 'user@email.com', // This should come from your auth system
        items: [{
          sku: product.id,
          quantity: quantity,
          name: product.name,
          baseprice: product.price,
          netprice: product.price * quantity
        }]
      });
    } catch (error) {
      console.error('Error tracking add to cart:', error);
    }
  }

  public async trackRemoveFromCart(productId: string): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!window.Signals) return;

      await window.Signals.removeFromCart({
        cartId: 'cart',
        email: 'user@email.com', // This should come from your auth system
        items: [{
          sku: productId,
          quantity: 0
        }]
      });
    } catch (error) {
      console.error('Error tracking remove from cart:', error);
    }
  }

  public async trackUpdateCart(product: Product, quantity: number): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!window.Signals) return;

      await window.Signals.replaceCart({
        cartId: 'cart',
        email: 'user@email.com', // This should come from your auth system
        items: [{
          sku: product.id,
          quantity: quantity,
          name: product.name,
          baseprice: product.price,
          netprice: product.price * quantity
        }]
      });
    } catch (error) {
      console.error('Error tracking update cart:', error);
    }
  }

  public async trackClearCart(): Promise<void> {
    try {
      await this.ensureInitialized();
      if (!window.Signals) return;

      await window.Signals.clearCart({
        cartId: 'cart',
        email: 'user@email.com', // This should come from your auth system
        items: []
      });
    } catch (error) {
      console.error('Error tracking clear cart:', error);
    }
  }
}

export const signalsService = SignalsService.getInstance(); 