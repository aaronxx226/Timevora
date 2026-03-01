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
    comment: 'This helped me process a decision I made 10 years ago. It felt like a weight was lifted, replaced by a quiet understanding.',
    date: '2 days ago'
  },
  {
    id: '2',
    name: 'David K.',
    rating: 5,
    comment: 'The AI narrative was surprisingly deep. It made me appreciate my current life more, seeing the beauty in the path I actually walked.',
    date: '1 week ago'
  },
  {
    id: '3',
    name: 'Elena R.',
    rating: 5,
    comment: 'A beautiful, meditative experience. It didn\'t just show me another life; it showed me the strength I already have.',
    date: '3 weeks ago'
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
    <section className="py-32 px-6 bg-[#0a0502]/80 relative overflow-hidden" id="reviews">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#ff4e00]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center justify-center p-3 bg-[#ff4e00]/10 rounded-2xl mb-6">
              <MessageSquare className="w-6 h-6 text-[#ff4e00]" />
            </div>
            <h2 className="text-5xl font-serif italic text-[#f5f2ed] mb-6">Shared Reflections</h2>
            <p className="text-[#f5f2ed]/60 text-lg font-light leading-relaxed">
              Every life is a collection of stories. Here are a few from those who have paused to look back with us.
            </p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-10 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-[#f5f2ed] text-sm font-medium transition-all border border-white/10 backdrop-blur-sm"
          >
            {showForm ? 'Cancel' : 'Share Your Experience'}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-20 p-10 glass-card"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Your Name</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[#f5f2ed] focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/30 transition-all placeholder:text-white/20"
                    placeholder="How should we address you?"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Rating</label>
                  <div className="flex gap-3 pt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={`w-7 h-7 ${star <= newReview.rating ? 'text-[#ff4e00] fill-[#ff4e00]' : 'text-white/10'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Your Reflection</label>
                <textarea
                  required
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-[#f5f2ed] focus:outline-none focus:ring-2 focus:ring-[#ff4e00]/30 transition-all h-40 resize-none placeholder:text-white/20"
                  placeholder="What did you discover about your journey?"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 rounded-2xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-[#ff4e00]/20"
              >
                {isSubmitting ? 'Sharing...' : (
                  <>
                    Post Reflection <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:border-[#ff4e00]/20 transition-all group flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff4e00]/10 flex items-center justify-center border border-[#ff4e00]/10">
                    <User className="w-6 h-6 text-[#ff4e00]" />
                  </div>
                  <div>
                    <h4 className="text-[#f5f2ed] font-medium tracking-tight">{review.name}</h4>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">{review.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-[#ff4e00] fill-[#ff4e00]' : 'text-white/5'}`} />
                ))}
              </div>
              <p className="text-[#f5f2ed]/80 text-lg font-serif italic leading-relaxed flex-grow">
                "{review.comment}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
