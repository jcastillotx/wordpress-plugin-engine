import React from 'react'
import { Crown, Clock, AlertCircle } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { stripeProducts } from '../../stripe-config'

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading } = useSubscription()

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Clock className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading subscription...</span>
      </div>
    )
  }

  if (!subscription || !subscription.subscription_id) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">Free Plan</span>
      </div>
    )
  }

  const product = stripeProducts.find(p => p.priceId === subscription.price_id)
  const planName = product?.name || 'Unknown Plan'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600'
      case 'trialing':
        return 'text-blue-600'
      case 'past_due':
      case 'canceled':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Past Due'
      case 'canceled':
        return 'Canceled'
      case 'incomplete':
        return 'Incomplete'
      default:
        return status
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Crown className="w-4 h-4 text-yellow-500" />
      <span className="text-sm font-medium text-gray-900">
        {planName}
      </span>
      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getStatusColor(subscription.subscription_status)}`}>
        {getStatusText(subscription.subscription_status)}
      </span>
    </div>
  )
}