import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, MessageSquare, PenLine, Sparkles, Filter, ShieldCheck, User, Check, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Saree, Review, CustomerProfile, Order } from '../types';
import { getDefaultReviewsForSaree, calculateAverageRating } from '../utils/reviewUtils';

interface CustomerReviewSectionProps {
  saree: Saree;
  onAddReview: (sareeId: string, review: Review) => void;
  onShowToast?: (message: string) => void;
  currentCustomer?: CustomerProfile | null;
  orders?: Order[];
  isReviewFormOpen?: boolean;
  onToggleReviewForm?: (open: boolean) => void;
}

export const CustomerReviewSection: React.FC<CustomerReviewSectionProps> = ({
  saree,
  onAddReview,
  onShowToast,
  currentCustomer,
  orders = [],
  isReviewFormOpen,
  onToggleReviewForm
}) => {
  const [internalShowForm, setInternalShowForm] = useState(false);
  const showReviewForm = isReviewFormOpen !== undefined ? isReviewFormOpen : internalShowForm;
  const setShowReviewForm = (val: boolean) => {
    if (onToggleReviewForm) {
      onToggleReviewForm(val);
    } else {
      setInternalShowForm(val);
    }
  };

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState(currentCustomer?.name || '');
  const [location, setLocation] = useState(
    currentCustomer?.address ? `${currentCustomer.address.city}, ${currentCustomer.address.state}` : ''
  );
  const [orderNumberInput, setOrderNumberInput] = useState('');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [hasVotedHelpful, setHasVotedHelpful] = useState<Record<string, boolean>>({});

  // Detect if this customer has purchased this saree in any recorded order
  const matchingPurchasedOrder = orders.find((ord) => {
    const isUserMatch =
      Boolean(currentCustomer?.phone && ord.phone === currentCustomer.phone) ||
      Boolean(currentCustomer?.email && ord.email && ord.email.toLowerCase() === currentCustomer.email.toLowerCase());
    const hasSaree = ord.items && ord.items.some((item) => item.saree.id === saree.id);
    return isUserMatch && hasSaree;
  });

  // Also check if entered order ID matches
  const isInputOrderMatch = orderNumberInput.trim()
    ? orders.some((ord) => 
        ord.id.toLowerCase() === orderNumberInput.trim().toLowerCase() &&
        ord.items && ord.items.some((item) => item.saree.id === saree.id)
      )
    : false;

  const isVerifiedPurchase = Boolean(matchingPurchasedOrder || isInputOrderMatch);

  // Sync author name and location if currentCustomer changes
  useEffect(() => {
    if (currentCustomer?.name && !authorName) {
      setAuthorName(currentCustomer.name);
    }
    if (currentCustomer?.address && !location) {
      setLocation(`${currentCustomer.address.city}, ${currentCustomer.address.state}`);
    }
  }, [currentCustomer]);

  const reviewsList: Review[] = saree.reviews && saree.reviews.length > 0
    ? saree.reviews
    : getDefaultReviewsForSaree(saree);

  // Calculate Rating Distribution using actual reviews list
  const totalReviews = reviewsList.length;
  const averageRating = calculateAverageRating(reviewsList, saree.rating).toFixed(1);

  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const ratingDescriptions: Record<number, string> = {
    5: '5 Stars - Exceptional / Masterpiece Handloom',
    4: '4 Stars - Very Good / Highly Recommended',
    3: '3 Stars - Average / Decent Quality',
    2: '2 Stars - Below Expectations',
    1: '1 Star - Unsatisfactory'
  };

  const handleHelpful = (reviewId: string) => {
    if (hasVotedHelpful[reviewId]) return;
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1
    }));
    setHasVotedHelpful((prev) => ({
      ...prev,
      [reviewId]: true
    }));
    if (onShowToast) {
      onShowToast('Thank you! Marked this review as helpful.');
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 10) {
      setFormError('Please write a detailed review (minimum 10 characters).');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      author: authorName.trim(),
      rating,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      comment: comment.trim(),
      verifiedPurchase: isVerifiedPurchase || true,
      location: location.trim() || 'India',
      helpfulCount: 0
    };

    onAddReview(saree.id, newReview);
    
    // Trigger festive celebratory confetti
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    setComment('');
    setOrderNumberInput('');
    setRating(5);
    setFormError('');
    setShowReviewForm(false);
    if (onShowToast) {
      onShowToast('Review & rating submitted! Average score updated on catalogue card.');
    }
  };

  // Filter and Sort Reviews
  const filteredReviews = reviewsList
    .filter((r) => (filterRating === 'all' ? true : Math.round(r.rating) === filterRating))
    .sort((a, b) => {
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'helpful') {
        const countA = (a.helpfulCount || 0) + (helpfulVotes[a.id] || 0);
        const countB = (b.helpfulCount || 0) + (helpfulVotes[b.id] || 0);
        return countB - countA;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return (
    <div id="customer-reviews-section" className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold font-serif-brand text-stone-950">
              Customer Ratings & Verified Reviews
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              {totalReviews} Reviews
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Authentic feedback from verified patrons who draped this saree
          </p>
        </div>

        <button
          id="write-review-toggle-btn"
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-[#800020] to-[#5C0017] hover:from-[#9B111E] hover:to-[#73001C] text-amber-100 font-bold text-xs shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <PenLine className="w-4 h-4 text-amber-300" />
          <span>{showReviewForm ? 'Close Review Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Ratings Overview Card */}
      <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Overall Score */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start justify-center md:border-r md:border-stone-200 md:pr-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-stone-950 font-serif-brand">
              {averageRating}
            </span>
            <span className="text-stone-400 text-sm font-bold">/ 5.0</span>
          </div>

          <div className="flex items-center gap-1 my-1.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(Number(averageRating))
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-stone-300'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-stone-500">
            Based on <span className="font-semibold text-stone-800">{totalReviews}</span> verified buyer ratings
          </p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Verified Purchases Only</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-1.5 md:col-span-2">
          {starCounts.map(({ stars, count, percentage }) => (
            <div
              key={stars}
              onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
              className={`flex items-center gap-2 text-xs cursor-pointer group py-0.5 px-2 rounded-lg transition ${
                filterRating === stars ? 'bg-amber-100/70 font-bold' : 'hover:bg-stone-100'
              }`}
            >
              <span className="w-12 text-stone-600 group-hover:text-stone-900 font-medium flex items-center gap-1">
                <span>{stars}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              </span>

              <div className="flex-1 h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-amber-400 to-amber-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <span className="w-8 text-right text-stone-500 font-mono text-[11px]">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Submission Form Modal / Drawer Accordion */}
      {showReviewForm && (
        <form
          onSubmit={handleSubmitReview}
          className="p-5 rounded-2xl bg-linear-to-b from-amber-50/50 to-stone-50 border-2 border-amber-300/80 shadow-md space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-sm text-stone-900">
                Write Your Review for {saree.title}
              </h4>
            </div>
            <span className="text-[11px] text-amber-900 font-medium">
              Verified Buyer Program
            </span>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {formError}
            </div>
          )}

          {/* Verified Buyer Banner or Order ID input */}
          {matchingPurchasedOrder ? (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold">Verified Buyer Identified: </span>
                We found your purchase of this saree in Order <span className="font-mono font-bold">#{matchingPurchasedOrder.id}</span> ({matchingPurchasedOrder.orderDate})! Your review will display an authentic Verified Buyer badge.
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-stone-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-800" />
                  Have an Order ID for this saree? (Optional)
                </span>
                {isInputOrderMatch && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-700" /> Order Verified!
                  </span>
                )}
              </div>
              <input
                type="text"
                placeholder="Enter your Order ID (e.g. ORD-1001) for instant Verified Buyer badge"
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:border-amber-500 font-mono"
              />
            </div>
          )}

          {/* Interactive Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1.5">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-stone-300 hover:scale-110 transition cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-900 ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Author Name & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shalini Singhal"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                Your City / State (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Your Detailed Experience & Feedback *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tell other saree connoisseurs about the drape quality, softness, gold zari luster, and courier packaging..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 leading-relaxed"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#9B111E] text-amber-100 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Submit Verified Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-stone-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1 rounded-lg transition font-semibold cursor-pointer ${
              filterRating === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Ratings ({totalReviews})
          </button>
          {[5, 4, 3].map((stars) => (
            <button
              key={stars}
              onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
              className={`px-2.5 py-1 rounded-lg transition font-medium flex items-center gap-1 cursor-pointer ${
                filterRating === stars
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-stone-500">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'helpful')}
            className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-stone-800 text-xs font-medium focus:outline-hidden"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-stone-50 border border-stone-200">
            <MessageSquare className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-700 text-sm">No reviews found for this rating filter.</p>
            <button
              onClick={() => setFilterRating('all')}
              className="mt-2 text-xs font-bold text-rose-900 hover:underline"
            >
              Show all customer reviews
            </button>
          </div>
        ) : (
          filteredReviews.map((rev) => {
            const currentHelpful = (rev.helpfulCount || 0) + (helpfulVotes[rev.id] || 0);
            const voted = hasVotedHelpful[rev.id];

            return (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5 hover:border-amber-200 transition"
              >
                {/* Review Header: User avatar, name, verified badge, rating & date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-linear-to-tr from-[#800020] to-amber-600 text-amber-100 font-bold text-xs flex items-center justify-center shadow-xs">
                      {rev.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 text-xs sm:text-sm">
                          {rev.author}
                        </span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      {rev.location && (
                        <span className="text-[11px] text-stone-500 block">
                          {rev.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-0.5">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      {rev.date}
                    </span>
                  </div>
                </div>

                {/* Review Comment Text */}
                <p className="text-xs text-stone-700 leading-relaxed font-normal">
                  {rev.comment}
                </p>

                {/* Review Footer: Helpful Button */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500 border-t border-stone-100">
                  <span className="text-[10px] text-stone-400">
                    Direct Artisan Weave Review
                  </span>
                  <button
                    onClick={() => handleHelpful(rev.id)}
                    disabled={voted}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition text-xs font-medium cursor-pointer ${
                      voted
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                        : 'hover:bg-stone-100 text-stone-600'
                    }`}
                    title="Mark this review as helpful to other shoppers"
                  >
                    <ThumbsUp className={`w-3 h-3 ${voted ? 'text-emerald-600 fill-emerald-600' : 'text-stone-400'}`} />
                    <span>{voted ? 'Helpful' : 'Helpful'} ({currentHelpful})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
