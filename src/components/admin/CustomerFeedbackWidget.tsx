'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, ExternalLink } from 'lucide-react';
import { logAnalyticsEvent } from '@/utils/loyaltyAndAnalytics';

interface FeedbackItem {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  source: 'google' | 'facebook' | 'website';
  date: string;
  responded: boolean;
}

export function CustomerFeedbackWidget() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        // Mock feedback data - replace with actual API calls to Google Reviews, Facebook, etc.
        const mockFeedback: FeedbackItem[] = [
          {
            id: '1',
            customer: 'Sarah M.',
            rating: 5,
            comment: 'Amazing biryani! The flavors were incredible and the delivery was super fast. Will definitely order again!',
            source: 'google',
            date: '2024-12-24',
            responded: false
          },
          {
            id: '2',
            customer: 'John D.',
            rating: 4,
            comment: 'Great food truck! The chicken curry was delicious. Only wish you had more vegetarian options.',
            source: 'facebook',
            date: '2024-12-23',
            responded: true
          },
          {
            id: '3',
            customer: 'Maria L.',
            rating: 5,
            comment: 'Best Indian food in Katy! The spice levels are perfect and the portions are generous.',
            source: 'google',
            date: '2024-12-22',
            responded: false
          }
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFeedback(mockFeedback);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0;

  // Add a function to log feedback submission (to be called when real feedback is submitted)
  function handleFeedbackSubmit(feedback: FeedbackItem) {
    logAnalyticsEvent('feedback_submitted', feedback);
    if (typeof window !== 'undefined') {
      window.gtag && window.gtag('event', 'feedback_submitted', { rating: feedback.rating, source: feedback.source });
      window.umami && window.umami('feedback_submitted', { rating: feedback.rating, source: feedback.source });
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold">{feedback.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {feedback.map((item) => (
          <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="font-medium">{item.customer}</span>
                {renderStars(item.rating)}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 