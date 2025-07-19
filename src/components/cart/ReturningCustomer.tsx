import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, Gift, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';

interface OrderHistory {
  id: number;
  created_at: string;
  total_amount: number;
  status: string;
  order_type: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
  }>;
}

interface LoyaltyReward {
  points_required: number;
  reward_value: number;
  description: string;
  available: boolean;
}

interface CustomerProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  loyalty_points: number;
  loyalty_tier: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  order_history: OrderHistory[];
  available_rewards: LoyaltyReward[];
}

export default function ReturningCustomer() {
  const [lookup, setLookup] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const handleLookup = async () => {
    if (!lookup.trim()) {
      setLookupError('Please enter phone or email');
      return;
    }
    setLookupError(null);
    setLoading(true);
    setNotFound(false);
    setProfile(null);
    
    try {
    const res = await fetch(`/api/customer?lookup=${encodeURIComponent(lookup)}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    } else {
      setNotFound(true);
      }
    } catch (error) {
      setLookupError('Error looking up customer profile');
    }
    setLoading(false);
  };

  const handleRedeem = async (pointsRequired: number, rewardValue: number) => {
    if (!profile || profile.loyalty_points < pointsRequired) return;
    
    try {
    const res = await fetch('/api/redeem-loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customer: lookup, 
          points: pointsRequired,
          reward_value: rewardValue
        })
      });
      
    if (res.ok) {
        setProfile({ 
          ...profile, 
          loyalty_points: profile.loyalty_points - pointsRequired,
          available_rewards: profile.available_rewards.map(reward => 
            reward.points_required === pointsRequired 
              ? { ...reward, available: profile.loyalty_points - pointsRequired >= reward.points_required }
              : reward
          )
        });
      setRedeemed(true);
        setTimeout(() => setRedeemed(false), 5000); // Clear success message after 5 seconds
      }
    } catch (error) {
      console.error('Error redeeming loyalty points:', error);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'gold': return 'default';
      case 'silver': return 'secondary';
      case 'bronze': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <h2 className="font-display font-bold text-lg mb-4 pb-2 border-b text-black">Returning customer?</h2>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Enter phone or email"
          value={lookup}
          onChange={e => setLookup(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleLookup()}
          className="flex-1"
        />
        <Button
          onClick={handleLookup}
          className="bg-desi-orange text-white hover:bg-desi-orange/90"
          disabled={loading}
        >
          {loading ? 'Looking up...' : 'Look up'}
        </Button>
      </div>
      
      {lookupError && (
        <p className="text-red-500 text-sm mb-4">{lookupError}</p>
      )}
      
      {notFound && (
        <div className="text-red-500 text-sm mb-4">
          No profile found for that phone or email.
        </div>
      )}
      
      {redeemed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <p className="text-green-700 text-sm font-medium">
            🎉 Reward redeemed successfully! Discount will be applied to your order.
          </p>
        </div>
      )}
      
      {profile && (
        <div className="space-y-4">
          {/* Customer Welcome & Basic Info */}
          <div className="bg-gradient-to-r from-desi-orange/10 to-orange-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">Welcome back, {profile.name}!</h4>
              <Badge 
                variant={getTierColor(profile.loyalty_tier)}
              >
                {profile.loyalty_tier} Member
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Customer since:</span>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total orders:</span>
                <p className="font-medium">{profile.total_orders}</p>
              </div>
              <div>
                <span className="text-gray-600">Total spent:</span>
                <p className="font-medium text-desi-orange">{formatCurrency(profile.total_spent)}</p>
              </div>
              <div>
                <span className="text-gray-600">Last order:</span>
                <p className="font-medium">{formatDate(profile.last_order_date)}</p>
              </div>
            </div>
          </div>

          {/* Loyalty Points & Rewards */}
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-desi-orange" />
              <h5 className="font-semibold">Loyalty Points & Rewards</h5>
            </div>
            
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Current Points</span>
                <span className="font-bold text-desi-orange text-lg">{profile.loyalty_points}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-desi-orange h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((profile.loyalty_points % 100) / 100 * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {100 - (profile.loyalty_points % 100)} points until next $10 reward
              </p>
            </div>

            {profile.available_rewards && profile.available_rewards.length > 0 && (
              <div className="space-y-2">
                <h6 className="font-medium text-sm">Available Rewards:</h6>
                {profile.available_rewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                    <div>
                      <p className="font-medium text-sm">{reward.description}</p>
                      <p className="text-xs text-gray-500">{reward.points_required} points required</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(reward.points_required, reward.reward_value)}
                      disabled={!reward.available || profile.loyalty_points < reward.points_required}
                      className="bg-desi-orange text-white hover:bg-desi-orange/90 disabled:opacity-50"
                    >
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order History */}
          {profile.order_history && profile.order_history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-desi-orange" />
                  <h5 className="font-semibold">Recent Orders</h5>
                </div>
                {profile.order_history.length > 3 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowFullHistory(!showFullHistory)}
                    className="text-desi-orange"
                  >
                    {showFullHistory ? 'Show Less' : `View All (${profile.order_history.length})`}
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {(showFullHistory ? profile.order_history : profile.order_history.slice(0, 3)).map((order, index) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm">{formatDate(order.created_at)}</span>
                        <Badge 
                          variant={order.status === 'completed' ? 'default' : 'secondary'}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <span className="font-semibold text-desi-orange">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-1">
                        <span className="font-medium">Type:</span> {order.order_type}
                      </p>
                      <p className="font-medium mb-1">Items:</p>
                      <ul className="ml-4 space-y-1">
                        {order.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex justify-between">
                            <span>{item.quantity}x {item.name}</span>
                            <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 
