import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  message: string;
  date: string;
  userId?: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      customerName: 'Ahmed Hassan',
      rating: 5,
      message: 'Excellent quality part! Fits perfectly on my Toyota Hilux. Fast delivery and great service.',
      date: '2024-05-15'
    },
    {
      id: '2',
      customerName: 'Sarah Mohamed',
      rating: 4,
      message: 'Good product, installed easily. Would recommend to others.',
      date: '2024-05-10'
    }
  ]);
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get username from user metadata or fallback to email username
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Try to get name from user metadata first
    const metaName = user.user_metadata?.name;
    if (metaName) return metaName;
    
    // Fallback to the part before @ in email
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Anonymous User';
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }
    
    if (!newReview.message.trim()) {
      toast.error('Please write a review message');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        customerName: getUserDisplayName(),
        rating: newReview.rating,
        message: newReview.message,
        date: new Date().toISOString().split('T')[0],
        userId: user.id
      };
      
      setReviews(prev => [review, ...prev]);
      setNewReview({ rating: 5, message: '' });
      setIsSubmitting(false);
      toast.success('Review submitted successfully!');
    }, 1000);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        fill="none"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ));
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="mt-12 bg-white rounded-lg shadow p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center">
            {renderStars(Math.round(parseFloat(averageRating)))}
          </div>
          <span className="text-lg font-semibold">{averageRating}</span>
          <span className="text-gray-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
        </div>
      </div>

      {/* Add Review Form */}
      <div id="review-form" className="mb-8 border-t pt-8">
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        
        {!user ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">Please login to leave a review</p>
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Login to Review
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Reviewing as: <span className="font-semibold text-blue-700">{getUserDisplayName()}</span>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-6 h-6 ${rating <= newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      fill="none"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="reviewMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <Textarea
                id="reviewMessage"
                value={newReview.message}
                onChange={(e) => setNewReview(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.message}</p>
          </div>
        ))}
        
        {reviews.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
