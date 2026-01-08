import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

export const Success: React.FC = () => {
  useEffect(() => {
    // Clear any checkout-related data from localStorage if needed
    localStorage.removeItem('checkout-session-id')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 mb-8">
            Thank you for your subscription. Your account has been upgraded and you can now access all premium features.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              Go to Dashboard
            </Link>
            
            <Link
              to="/pricing"
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-block"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}