import { useState } from 'react';
import { Button, Input } from '@heroui/react';

interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  pastOrders: { id: number; date: string; items: string; total: number }[];
}

export default function ReturningCustomer() {
  const [lookup, setLookup] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const handleLookup = async () => {
    if (!lookup.trim()) {
      setLookupError('Please enter phone or email');
      return;
    }
    setLookupError(null);
    setLoading(true);
    setNotFound(false);
    setProfile(null);
    // Replace with your backend API call
    const res = await fetch(`/api/customer?lookup=${encodeURIComponent(lookup)}`);
    if (res.ok) {
      const data = await res.json();
      setProfile(data);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleRedeem = async () => {
    if (!profile) return;
    // Replace with your backend API call to redeem points
    const res = await fetch('/api/redeem-loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: lookup, points: 100 })
    });
    if (res.ok) {
      setProfile({ ...profile, loyaltyPoints: profile.loyaltyPoints - 100 });
      setRedeemed(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h3 className="font-playfair font-semibold text-lg mb-2">Returning customer?</h3>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1">
          <Input
            placeholder="Enter phone or email"
            value={lookup}
            onChange={e => setLookup(e.target.value)}
            className="block w-full rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-desi-orange focus:outline-none transition-all px-.5 py-.8"
          />
        </div>
        <Button
          onClick={handleLookup}
          className="bg-orange-500 text-black hover:bg-black hover:text-orange-500 transition-colors rounded-xl px-6"
        >
          {loading ? 'Looking up...' : 'Look up'}
        </Button>
      </div>
      {lookupError && <p className="text-red-500 text-sm mt-1">{lookupError}</p>}
      {notFound && <div className="text-red-500 text-sm">No profile found for that phone or email.</div>}
      {profile && (
        <div className="mt-3">
          <div className="mb-2 text-gray-700">Welcome back, <b>{profile.name}</b>!</div>
          <div className="mb-2 text-desi-orange font-semibold">Loyalty Points: {profile.loyaltyPoints}</div>
          {profile.loyaltyPoints >= 100 && !redeemed && (
            <Button onClick={handleRedeem} className="mb-2 rounded-xl">Redeem 100 points for $10 off</Button>
          )}
          {redeemed && <div className="text-green-600 text-sm mb-2">$10 discount will be applied to your order!</div>}
          <div className="mt-2">
            <div className="font-medium mb-1">Past Orders:</div>
            <ul className="text-sm text-gray-600 list-disc ml-5">
              {profile.pastOrders.map(order => (
                <li key={order.id}>
                  {order.date}: {order.items} (${order.total.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 
