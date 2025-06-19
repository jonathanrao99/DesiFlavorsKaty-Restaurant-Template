'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface StatusSelectorProps {
  orderId: number;
  currentStatus: string;
}

export default function StatusSelector({ orderId, currentStatus }: StatusSelectorProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updateStatus = (status: string) => {
    startTransition(async () => {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    });
  };

  const statusLower = currentStatus.toLowerCase();
  if (statusLower !== 'pending') {
    let bg = 'bg-zinc-200 text-black';
    if (statusLower === 'completed') bg = 'bg-green-200 text-green-800';
    if (statusLower === 'failed' || statusLower === 'cancelled') bg = 'bg-red-200 text-red-800';
    const label = statusLower === 'completed'
      ? 'Success'
      : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bg}`}>{label}</span>
    );
  }

  return (
    <select
      value={selectedStatus}
      onChange={(e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);
        updateStatus(newStatus);
      }}
      disabled={isPending}
      className="bg-yellow-100 text-black text-xs font-semibold px-2 py-1 rounded"
    >
      <option value="pending">Pending</option>
      <option value="completed">Success</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
} 