import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { createCheckoutSession } from '../../lib/stripe'
import type { StripeProduct } from '../../stripe-config'
import { Alert } from '../ui/Alert'

interface PricingCardProps {
  product: StripeProduct
  popular?: boolean
}

export const PricingCard: React.FC<PricingCardProps> = ({ product, popular }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setLoading(true)
    setError(null)

    try {
      const successUrl = `${window.location.origin}/success`
      const cancelUrl = `${window.location.origin}/pricing`
      
      const { url } = await createCheckoutSession(product, successUrl, cancelUrl)
      
      if (url) {
        window.location.href = url
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout')
      setLoading(false)
    }
  }

  const features = getFeaturesByPlan(product.name)

  return (
    <div className={`relative bg-white rounded-2xl shadow-lg border-2 ${
      popular ? 'border-blue-500' : 'border-gray-200'
    } p-8`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">{product.description}</p>
        <div className="flex items-baseline justify-center">
          <span className="text-4xl font-bold text-gray-900">${product.price}</span>
          <span className="text-gray-600 ml-1">/{product.interval}</span>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </div>
      )}

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          popular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Loading...' : 'Get Started'}
      </button>
    </div>
  )
}

const getFeaturesByPlan = (planName: string): string[] => {
  switch (planName) {
    case 'Pro Plugin Subscription':
      return [
        'Up to 10 plugin requests per month',
        'Advanced AI-powered generation',
        'Priority email support',
        'Custom plugin features',
        'Theme compatibility testing',
        'Download source code'
      ]
    case 'Enterprise Plugin Subscription':
      return [
        'Unlimited plugin requests',
        'Advanced AI-powered generation',
        'Dedicated support channel',
        'Custom plugin features',
        'Theme compatibility testing',
        'Download source code',
        'Priority processing',
        'Custom integrations',
        'Team collaboration tools'
      ]
    default:
      return []
  }
}