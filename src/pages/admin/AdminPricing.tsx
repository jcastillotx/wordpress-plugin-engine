import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string;
  features: string[];
  limits: {
    max_plugins: number;
    max_storage_mb: number;
    max_conversions: number;
    max_active_plugins: number;
  };
  is_active: boolean;
  sort_order: number;
}

export function AdminPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setPlans(data);
    }

    setLoading(false);
  };

  const handleEdit = (plan: PricingPlan) => {
    setEditingPlan({ ...plan });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingPlan({
      id: '',
      name: '',
      slug: '',
      description: '',
      price_monthly: '0.00',
      price_yearly: '0.00',
      features: [''],
      limits: {
        max_plugins: 0,
        max_storage_mb: 0,
        max_conversions: 0,
        max_active_plugins: 0,
      },
      is_active: true,
      sort_order: plans.length + 1,
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    const planData = {
      name: editingPlan.name,
      slug: editingPlan.slug,
      description: editingPlan.description,
      price_monthly: editingPlan.price_monthly,
      price_yearly: editingPlan.price_yearly,
      features: editingPlan.features.filter(f => f.trim() !== ''),
      limits: editingPlan.limits,
      is_active: editingPlan.is_active,
      sort_order: editingPlan.sort_order,
    };

    if (isCreating) {
      const { error } = await supabase
        .from('pricing_plans')
        .insert(planData);

      if (error) {
        alert('Failed to create plan: ' + error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from('pricing_plans')
        .update(planData)
        .eq('id', editingPlan.id);

      if (error) {
        alert('Failed to update plan: ' + error.message);
        return;
      }
    }

    setEditingPlan(null);
    setIsCreating(false);
    loadPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;

    const { error } = await supabase
      .from('pricing_plans')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete plan: ' + error.message);
      return;
    }

    loadPlans();
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingPlan) return;
    const newFeatures = [...editingPlan.features];
    newFeatures[index] = value;
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, features: [...editingPlan.features, ''] });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    const newFeatures = editingPlan.features.filter((_, i) => i !== index);
    setEditingPlan({ ...editingPlan, features: newFeatures });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (editingPlan) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isCreating ? 'Create Pricing Plan' : 'Edit Pricing Plan'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Pro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editingPlan.slug}
                onChange={(e) => setEditingPlan({ ...editingPlan, slug: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., pro"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={editingPlan.description}
              onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the plan"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={editingPlan.price_monthly}
                onChange={(e) => setEditingPlan({ ...editingPlan, price_monthly: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="29.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yearly Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={editingPlan.price_yearly}
                onChange={(e) => setEditingPlan({ ...editingPlan, price_yearly: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="290.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="space-y-2">
              {editingPlan.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Feature description"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Feature
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Plugins (-1 for unlimited)
              </label>
              <input
                type="number"
                value={editingPlan.limits.max_plugins}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, max_plugins: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Active Plugins (-1 for unlimited)
              </label>
              <input
                type="number"
                value={editingPlan.limits.max_active_plugins}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, max_active_plugins: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Conversions (-1 for unlimited)
              </label>
              <input
                type="number"
                value={editingPlan.limits.max_conversions}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, max_conversions: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Storage (MB)
              </label>
              <input
                type="number"
                value={editingPlan.limits.max_storage_mb}
                onChange={(e) => setEditingPlan({
                  ...editingPlan,
                  limits: { ...editingPlan.limits, max_storage_mb: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editingPlan.is_active}
                onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Active Plan</span>
            </label>

            <div className="flex-1" />

            <label className="block text-sm font-medium text-gray-700">
              Sort Order
            </label>
            <input
              type="number"
              value={editingPlan.sort_order}
              onChange={(e) => setEditingPlan({ ...editingPlan, sort_order: parseInt(e.target.value) })}
              className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Plan
            </button>
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsCreating(false);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Plans</h1>
          <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-lg shadow border-2 transition-all ${
              plan.is_active ? 'border-blue-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                </div>
                {!plan.is_active && (
                  <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded">
                    Inactive
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    ${parseFloat(plan.price_monthly).toFixed(0)}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  or ${parseFloat(plan.price_yearly).toFixed(0)}/year
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(plan)}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(plan.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
