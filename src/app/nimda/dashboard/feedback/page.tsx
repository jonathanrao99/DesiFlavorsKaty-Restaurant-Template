'use client';

import { useState, useEffect } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ExternalLink, Reply, Filter, Search, ThumbsUp, AlertCircle } from 'lucide-react';

interface FeedbackItem {
  id: string;
  customer: string;
  rating: number;
  comment: string;
  source: 'google' | 'facebook' | 'website' | 'email';
  date: string;
  responded: boolean;
  response?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'food' | 'service' | 'delivery' | 'general';
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    async function fetchFeedback() {
      try {
        // Mock feedback data - replace with actual API calls
        const mockFeedback: FeedbackItem[] = [
          {
            id: '1',
            customer: 'Sarah Martinez',
            rating: 5,
            comment: 'Amazing biryani! The flavors were incredible and the delivery was super fast. The portion sizes are generous and the spice level was perfect. Will definitely order again!',
            source: 'google',
            date: '2024-12-24T18:30:00Z',
            responded: false,
            sentiment: 'positive',
            category: 'food'
          },
          {
            id: '2',
            customer: 'John Davis',
            rating: 4,
            comment: 'Great food truck! The chicken curry was delicious and authentic. Only wish you had more vegetarian options available. The staff was very friendly.',
            source: 'facebook',
            date: '2024-12-23T19:15:00Z',
            responded: true,
            response: 'Thank you for the feedback! We\'re adding more vegetarian options to our menu soon.',
            sentiment: 'positive',
            category: 'food'
          },
          {
            id: '3',
            customer: 'Maria Lopez',
            rating: 5,
            comment: 'Best Indian food in Katy! The spice levels are perfect and the portions are generous. Love the convenience of ordering online.',
            source: 'google',
            date: '2024-12-22T20:45:00Z',
            responded: false,
            sentiment: 'positive',
            category: 'food'
          },
          {
            id: '4',
            customer: 'Ahmed Khan',
            rating: 4,
            comment: 'Authentic flavors that remind me of home. The samosas were crispy and fresh. Delivery took a bit longer than expected but worth the wait.',
            source: 'website',
            date: '2024-12-21T17:20:00Z',
            responded: true,
            response: 'Thank you for your patience! We\'re working on improving our delivery times.',
            sentiment: 'positive',
            category: 'delivery'
          },
          {
            id: '5',
            customer: 'Jennifer Wilson',
            rating: 2,
            comment: 'Food was cold when it arrived and took over an hour for delivery. The flavors were good but the experience was disappointing.',
            source: 'google',
            date: '2024-12-20T19:30:00Z',
            responded: false,
            sentiment: 'negative',
            category: 'delivery'
          },
          {
            id: '6',
            customer: 'Robert Chen',
            rating: 3,
            comment: 'Food was okay, nothing special. Service was friendly but the wait time was longer than expected. Prices are reasonable.',
            source: 'facebook',
            date: '2024-12-19T18:10:00Z',
            responded: false,
            sentiment: 'neutral',
            category: 'service'
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

  const getSourceIcon = (source: string) => {
    const icons = {
      google: <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>,
      facebook: <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center text-white text-xs font-bold">F</div>,
      website: <div className="w-6 h-6 bg-desi-orange rounded-full flex items-center justify-center text-white text-xs font-bold">W</div>,
      email: <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">E</div>
    };
    return icons[source as keyof typeof icons] || <MessageSquare className="w-6 h-6 text-gray-500" />;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      neutral: 'bg-yellow-100 text-yellow-800',
      negative: 'bg-red-100 text-red-800'
    };
    return colors[sentiment as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: 'bg-blue-100 text-blue-800',
      service: 'bg-purple-100 text-purple-800',
      delivery: 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' || item.source === sourceFilter;
    const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    
    return matchesSearch && matchesSource && matchesSentiment;
  });

  const averageRating = feedback.length > 0 
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length 
    : 0;

  const unrespondedCount = feedback.filter(item => !item.responded).length;
  const negativeCount = feedback.filter(item => item.sentiment === 'negative').length;

  const handleRespond = async (feedbackId: string) => {
    if (!responseText.trim()) return;
    
    // In a real implementation, you'd make an API call here
    setFeedback(prev => prev.map(item => 
      item.id === feedbackId 
        ? { ...item, responded: true, response: responseText }
        : item
    ));
    
    setResponseText('');
    setSelectedFeedback(null);
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Customer Feedback" />
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Customer Feedback" />
      
      <div className="p-6 space-y-6">
        {/* Feedback Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold">{feedback.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Needs Response</p>
                  <p className="text-2xl font-bold text-red-600">{unrespondedCount}</p>
                </div>
                <Reply className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Negative Reviews</p>
                  <p className="text-2xl font-bold text-orange-600">{negativeCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-desi-orange focus:border-transparent"
                />
              </div>
              
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-desi-orange focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="google">Google</option>
                <option value="facebook">Facebook</option>
                <option value="website">Website</option>
                <option value="email">Email</option>
              </select>
              
              <select
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-desi-orange focus:border-transparent"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setSourceFilter('all');
                  setSentimentFilter('all');
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feedback List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews ({filteredFeedback.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFeedback.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No reviews found matching your criteria</p>
              ) : (
                filteredFeedback.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg ${
                      !item.responded ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getSourceIcon(item.source)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{item.customer}</span>
                            {renderStars(item.rating)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                              {item.sentiment}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {!item.responded && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Needs Response
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-3">{item.comment}</p>
                    
                    {item.response && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">Your Response</span>
                        </div>
                        <p className="text-sm text-blue-700">{item.response}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="capitalize">{item.source}</span>
                        {(item.source === 'google' || item.source === 'facebook') && (
                          <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      
                      {!item.responded && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedFeedback(item)}
                          className="bg-desi-orange hover:bg-desi-orange/90"
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Modal */}
        {selectedFeedback && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Respond to {selectedFeedback.customer}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{selectedFeedback.comment}</p>
              </div>
              
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-desi-orange focus:border-transparent"
              />
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleRespond(selectedFeedback.id)}
                  disabled={!responseText.trim()}
                  className="bg-desi-orange hover:bg-desi-orange/90"
                >
                  Send Response
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 