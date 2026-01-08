import { supabase } from './supabase'
import type { StripeProduct } from '../stripe-config'

export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export const createCheckoutSession = async (
  product: StripeProduct,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSessionResponse> => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session?.access_token) {
    throw new Error('Authentication required')
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      price_id: product.priceId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: product.mode
    })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to create checkout session')
  }

  return response.json()
}

export const getUserSubscription = async () => {
  const { data, error } = await supabase
    .from('stripe_user_subscriptions')
    .select('*')
    .maybeSingle()

  if (error) {
    console.error('Error fetching subscription:', error)
    return null
  }

  return data
}