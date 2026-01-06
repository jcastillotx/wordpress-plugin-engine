import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Check, Crown, Zap } from 'lucide-react';

interface Profile {
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
}

const PLANS = [
  {
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '1 plugin per month',
      'Basic features',
      'Community support',
      'Standard themes compatibility',
    ],
    icon: Package,
    color: 'blue',
  },
  {
    name: 'Pro',
    price: 29,
    interval: 'month',
    features: [
      '10 plugins per month',
      'Advanced features',
      'Priority support',
      'All themes compatibility',
      'Test environment access',
      'Auto-updates included',
    ],
    icon: Zap,
    color: 'blue',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited plugins',
      'Custom features',
      'Dedicated support',
      'White-label options',
      'API access',
      'Custom integrations',
      'Team collaboration',
    ],
    icon: Crown,
    color: 'blue',
  },
];

function Package() {
  return <CreditCard className="w-6 h-6" />;
}

export function Billing() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_status, trial_ends_at')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }

    setLoading(false);
  };

  const handleUpgrade = () => {
    alert('To implement payments in your application, we need to use Stripe.\n\nPlease visit https://bolt.new/setup/stripe to configure Stripe integration.');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600">Select the perfect plan for your WordPress plugin needs</p>
      </div>

      {profile?.subscription_status === 'trial' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-center">
          <p className="text-blue-800">
            You are currently on a free trial. Upgrade to continue building plugins after your trial ends.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {PLANS.map((plan) => {
          const PlanIcon = plan.icon;
          const isCurrentPlan = profile?.subscription_tier?.toLowerCase() === plan.name.toLowerCase();

          return (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg border-2 ${
                plan.popular ? 'border-blue-600 relative' : 'border-gray-200'
              } overflow-hidden`}
            >
              {plan.popular && (
                <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`bg-${plan.color}-100 rounded-full p-3`}>
                    <PlanIcon className={`text-${plan.color}-600`} />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>

                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleUpgrade}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center text-sm text-gray-600">
        <p>All plans include 14-day free trial. Cancel anytime.</p>
      </div>
    </div>
  );
}
