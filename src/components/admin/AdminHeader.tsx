'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminHeaderProps {
  title: string;
  backUrl?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
}

export default function AdminHeader({ title, backUrl = '/', actionButton }: AdminHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 mb-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side - Back button */}
        <Link href={backUrl}>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>

        {/* Center - Title */}
        <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          {title}
        </h1>

        {/* Right side - Action button */}
        <div className="flex items-center">
          {actionButton && (
            <Button
              variant={actionButton.variant || 'default'}
              size="sm"
              onClick={actionButton.onClick}
              className="bg-desi-orange hover:bg-desi-orange/90 text-white"
            >
              {actionButton.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 