'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar } from '../common/Icons';

interface Store {
  id: string;
  name: string;
  alias: string;
  logo_url?: string;
}

export default function CouponSubmissionForm() {
  const [formData, setFormData] = useState({
    storeName: '',
    storeId: '',
    offerUrl: '',
    offerType: '',
    expirationDate: '',
    offerTitle: '',
    offerDescription: '',
    couponCode: ''
  });

  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [storeSearchResults, setStoreSearchResults] = useState<Store[]>([]);
  const [showStoreResults, setShowStoreResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Store search functionality
  useEffect(() => {
    const searchStores = async () => {
      if (storeSearchQuery.trim().length >= 2) {
        try {
          const response = await fetch(`/api/search/stores?q=${encodeURIComponent(storeSearchQuery)}&limit=10`);
          if (response.ok) {
            const results = await response.json();
            setStoreSearchResults(results);
            setShowStoreResults(true);
          }
        } catch (error) {
          console.error('Store search error:', error);
          setStoreSearchResults([]);
        }
      } else {
        setStoreSearchResults([]);
        setShowStoreResults(false);
      }
    };

    const timeoutId = setTimeout(searchStores, 300);
    return () => clearTimeout(timeoutId);
  }, [storeSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStoreSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStoreSearchQuery(value);
    setFormData(prev => ({
      ...prev,
      storeName: value,
      storeId: ''
    }));
  };

  const selectStore = (store: Store) => {
    setFormData(prev => ({
      ...prev,
      storeName: store.name,
      storeId: store.id
    }));
    setStoreSearchQuery(store.name);
    setShowStoreResults(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/submission/coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          storeName: '',
          storeId: '',
          offerUrl: '',
          offerType: '',
          expirationDate: '',
          offerTitle: '',
          offerDescription: '',
          couponCode: ''
        });
        setStoreSearchQuery('');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card-bg/90 backdrop-blur-sm rounded-2xl shadow-lg border border-card-border p-8">
      <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center">
        <span className="text-3xl mr-3">🎁</span>
        Submit Your Coupon
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Name with Search */}
        <div className="relative">
          <label htmlFor="storeName" className="block text-sm font-medium text-text-primary mb-2">
            Store Name (Required) *
          </label>
          <div className="relative">
            <input
              type="text"
              id="storeName"
              name="storeName"
              value={storeSearchQuery}
              onChange={handleStoreSearch}
              required
              className="w-full pl-10 pr-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
              placeholder="Store Name"
              autoComplete="off"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
          </div>

          {/* Store Search Results */}
          {showStoreResults && storeSearchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-card-bg border border-card-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {storeSearchResults.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => selectStore(store)}
                  className="w-full px-4 py-3 text-left hover:bg-brand-lightest transition-colors duration-200 flex items-center space-x-3"
                >
                  {store.logo_url && (
                    <img
                      src={store.logo_url}
                      alt={store.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium text-text-primary">{store.name}</div>
                    <div className="text-sm text-text-secondary">{store.alias}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Offer URL */}
        <div>
          <label htmlFor="offerUrl" className="block text-sm font-medium text-text-primary mb-2">
            Offer URL (Required) *
          </label>
          <input
            type="url"
            id="offerUrl"
            name="offerUrl"
            value={formData.offerUrl}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
            placeholder="e.g., https://storesite.com/xxx/?xxx=xx"
          />
        </div>

        {/* Offer Type */}
        <div>
          <label htmlFor="offerType" className="block text-sm font-medium text-text-primary mb-2">
            Offer Type (Required) *
          </label>
          <select
            id="offerType"
            name="offerType"
            value={formData.offerType}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
          >
            <option value="">Online Sale</option>
            <option value="code">Coupon Code</option>
            <option value="deal">Online Sale</option>
            <option value="cashback">Cashback Offer</option>
            <option value="free-shipping">Free Shipping</option>
            <option value="flash-sale">Flash Sale</option>
            <option value="clearance">Clearance Sale</option>
          </select>
        </div>

        {/* Expiration Date */}
        <div className="relative">
          <label htmlFor="expirationDate" className="block text-sm font-medium text-text-primary mb-2">
            Expiration Date:
          </label>
          <div className="relative">
            <input
              type="date"
              id="expirationDate"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4 pointer-events-none" />
          </div>
        </div>

        {/* Offer Title */}
        <div>
          <label htmlFor="offerTitle" className="block text-sm font-medium text-text-primary mb-2">
            Offer Title (Required) *
          </label>
          <input
            type="text"
            id="offerTitle"
            name="offerTitle"
            value={formData.offerTitle}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200"
            placeholder="The title should contain the basic information, such as product, service and discount."
          />
        </div>

        {/* Coupon Code (conditional) */}
        {formData.offerType === 'code' && (
          <div>
            <label htmlFor="couponCode" className="block text-sm font-medium text-text-primary mb-2">
              Coupon Code *
            </label>
            <input
              type="text"
              id="couponCode"
              name="couponCode"
              value={formData.couponCode}
              onChange={handleInputChange}
              required={formData.offerType === 'code'}
              className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 font-mono text-center text-lg"
              placeholder="Enter coupon code"
            />
          </div>
        )}

        {/* Offer Description */}
        <div>
          <label htmlFor="offerDescription" className="block text-sm font-medium text-text-primary mb-2">
            Offer Description:
          </label>
          <textarea
            id="offerDescription"
            name="offerDescription"
            value={formData.offerDescription}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent transition-all duration-200 resize-none"
            placeholder="The description should contain more details, such as restrictions, pricing or availability."
          />
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-green-500 text-xl mr-3">✅</span>
              <div>
                <h4 className="font-semibold text-green-800">Coupon Submitted Successfully!</h4>
                <p className="text-green-700 text-sm">Your coupon has been submitted for review. We&apos;ll notify you once it&apos;s approved.</p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">❌</span>
              <div>
                <h4 className="font-semibold text-red-800">Error Submitting Coupon</h4>
                <p className="text-red-700 text-sm">Please check all required fields and try again.</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !formData.storeName || !formData.offerUrl || !formData.offerTitle}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
            isSubmitting || !formData.storeName || !formData.offerUrl || !formData.offerTitle
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-brand-light to-brand-accent hover:from-brand-accent hover:to-brand-light hover:scale-105 shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting Coupon...
            </span>
          ) : (
            'Submit Coupon'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text-secondary">
        <p>
          By submitting this coupon, you confirm that it&apos;s accurate and agree to our{' '}
          <a href="/info/terms" className="text-brand-light hover:text-brand-accent transition-colors">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
}