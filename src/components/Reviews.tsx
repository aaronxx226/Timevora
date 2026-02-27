import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, Send, User } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const initialReviews: Review[] = [
  {
    id: '1',
    name: 'Sarah M.',
    rating: 5,
    comment: 'This helped me process a decision I made 10 years ago. It felt like a weight was lifted.',
    date: '2 days ago'
  },
  {
    id: '2',
    name: 'David K.',
    rating: 4,
    comment: 'The AI narrative was surprisingly deep. It made me appreciate my current life more.',
    date: '1 week ago'
  }
];

export const ReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const review: Review = {
        id: Date.now().toString(),
        name: newReview.name || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        date: 'Just now'
      };
      setReviews([review, ...reviews]);
      setNewReview({ name: '', rating: 5, comment: '' });
      setIsSubmitting(false);
      setShowForm(false);
    }, 1000);
  };

  return (
    <section className="py-24 px-6 bg-[#0a0502]/50" id="reviews">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-[#ff4e00]/10 rounded-2xl mb-6">
              <MessageSquare className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <h2 className="text-4xl font-light text-[#f5f2ed] mb-4">Community Reflections</h2>
            <p className="text-[#f5f2ed]/60">Hear from others who have explored their alternate timelines.</p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-[#f5f2ed] text-sm font-medium transition-all border border-white/10"
          >
            {showForm ? 'Cancel' : 'Leave a Review'}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 p-8 bg-[#151619] border border-white/10 rounded-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Your Name</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f5f2ed] focus:outline-none focus:border-[#ff4e00]/50 transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1"
                      >
                        <Star className={`w-6 h-6 ${star <= newReview.rating ? 'text-[#ff4e00] fill-[#ff4e00]' : 'text-white/10'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Your Experience</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#f5f2ed] focus:outline-none focus:border-[#ff4e00]/50 transition-colors h-32 resize-none"
                  placeholder="How did Timevora help you?"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : (
                  <>
                    Post Review <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 bg-[#151619]/30 border border-white/5 rounded-3xl hover:border-white/10 transition-all group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff4e00]/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-[#ff4e00]" />
                  </div>
                  <div>
                    <h4 className="text-[#f5f2ed] font-medium">{review.name}</h4>
                    <p className="text-xs text-white/30">{review.date}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-[#ff4e00] fill-[#ff4e00]' : 'text-white/10'}`} />
                  ))}
                </div>
              </div>
              <p className="text-[#f5f2ed]/70 text-sm leading-relaxed italic">"{review.comment}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
