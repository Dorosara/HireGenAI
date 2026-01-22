import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { ThemeMode, UserProfile, Subscription } from '../types';
import { PRICING_PLANS } from '../constants';

interface SubscriptionPanelProps {
  theme: ThemeMode;
  userProfile: UserProfile;
}

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ theme, userProfile }) => {
  const [currentSub, setCurrentSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const isGradient = theme === 'gradient';

  const cardClass = isDark 
    ? 'bg-slate-900 border-slate-800 text-slate-100' 
    : isGradient 
      ? 'bg-white/40 backdrop-blur-md border-white/30 text-slate-900' 
      : 'bg-white border-slate-200 text-slate-900';

  const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';

  useEffect(() => {
    fetchSubscription();
  }, [userProfile]);

  const fetchSubscription = async () => {
    setLoading(true);
    // Fetch the most recent active subscription
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userProfile.id)
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .single();

    if (!error && data) {
      setCurrentSub(data);
    }
    setLoading(false);
  };

  const handleUpgrade = async (planId: string, planName: string) => {
    if (processingId) return;
    setProcessingId(planId);

    try {
      // Simulate API delay for payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 1. Cancel existing active subscriptions (if any)
      if (currentSub) {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', end_date: new Date().toISOString() })
          .eq('user_id', userProfile.id);
      }

      // 2. Create new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userProfile.id,
          plan_id: planId,
          status: 'active',
          start_date: new Date().toISOString()
        });

      if (error) throw error;

      alert(`Success! You have upgraded to the ${planName} plan.`);
      fetchSubscription(); // Refresh state

    } catch (err: any) {
      console.error(err);
      alert("Payment failed: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-primary mb-4"></i>
        <p className={textMuted}>Loading plan details...</p>
      </div>
    );
  }

  // Filter only Seeker plans
  const seekerPlans = PRICING_PLANS.filter(p => p.target === 'SEEKER');
  // Default to 'free' if no sub found
  const activePlanId = currentSub?.plan_id || 'free';

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className={`text-2xl font-bold mb-2 ${textTitle}`}>Manage Your Membership</h2>
        <p className={textMuted}>Upgrade your plan to unlock AI Resume Building, Priority Applications, and more.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {seekerPlans.map((plan) => {
          const isCurrent = activePlanId === plan.id;
          const isPro = plan.id !== 'free';
          const isProcessing = processingId === plan.id;

          return (
            <div 
              key={plan.id} 
              className={`relative flex flex-col p-6 rounded-2xl border transition-all ${cardClass} ${isCurrent ? 'ring-2 ring-primary border-transparent' : 'hover:shadow-lg'}`}
            >
              {plan.recommended && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  RECOMMENDED
                </div>
              )}
              
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${textTitle}`}>{plan.name}</h3>
                <div className="flex items-baseline mt-2">
                  <span className={`text-3xl font-extrabold ${textTitle}`}>{plan.price}</span>
                  {isPro && <span className={`ml-1 text-sm ${textMuted}`}>/mo</span>}
                </div>
              </div>

              <ul className="flex-1 space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-sm">
                    <i className={`fa-solid fa-check mt-1 mr-2 ${isCurrent ? 'text-primary' : 'text-green-500'}`}></i>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={isCurrent || isProcessing}
                onClick={() => handleUpgrade(plan.id, plan.name)}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-sm ${
                  isCurrent 
                    ? 'bg-green-500/10 text-green-600 cursor-default border border-green-500/20' 
                    : isPro 
                      ? 'bg-primary hover:bg-blue-600 text-white shadow-blue-500/20' 
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                }`}
              >
                {isProcessing ? (
                  <span><i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Processing...</span>
                ) : isCurrent ? (
                  <span><i className="fa-solid fa-circle-check mr-2"></i> Current Plan</span>
                ) : (
                  <span>{isPro ? 'Upgrade Now' : 'Downgrade to Free'}</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className={`p-4 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
        <p className="flex items-center justify-center">
          <i className="fa-solid fa-lock mr-2"></i>
          Payments are secured by Razorpay (India) & Stripe (Global). This is a demo mode; no actual charge will be made.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPanel;