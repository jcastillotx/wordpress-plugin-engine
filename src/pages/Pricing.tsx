import React from 'react'
import { Navigate } from 'react-router-dom'
import { PricingCard } from '../components/pricing/PricingCard'
import { stripeProducts } from '../stripe-config'
import { useAuth } from '../hooks/useAuth'

export const Pricing: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan for your WordPress plugin development needs.
            All plans include AI-powered generation and premium support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {stripeProducts.map((product, index) => (
            <PricingCard
              key={product.priceId}
              product={product}
              popular={index === 0} // Make Pro plan popular
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            Need a custom solution?{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-500">
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}