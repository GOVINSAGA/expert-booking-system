import React, { useState } from 'react';
import { format } from 'date-fns';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { Expert } from '../types';

interface BookingModalProps {
  expert: Expert;
  date: Date;
  timeSlot: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingModal({ expert, date, timeSlot, onClose, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expertId: expert._id,
          date: format(date, 'yyyy-MM-dd'),
          timeSlot,
          ...formData
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full border border-gray-100">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-xl leading-6 font-bold text-gray-900 tracking-tight" id="modal-title">
                  Confirm Booking
                </h3>
                <div className="mt-2 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex flex-col gap-1">
                  <p className="text-sm text-indigo-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis">With <b>{expert.name}</b></p>
                  <p className="text-xs text-indigo-700 font-medium">
                    {format(date, 'EEEE, MMMM d, yyyy')} | <span className="inline-flex items-center bg-indigo-100 px-1.5 py-0.5 rounded text-indigo-800">{timeSlot}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      placeholder="Jane Doe"
                      className="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.name}
                      onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="jane@example.com"
                      className="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.email}
                      onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      value={formData.phone}
                      onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">Session Notes (Optional)</label>
                    <textarea
                      id="notes"
                      rows={3}
                      placeholder="What would you like to discuss?"
                      className="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                      value={formData.notes}
                      onChange={(e) => setFormData(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all font-sans"
                    >
                      {loading ? (
                       <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      ) : (
                       <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                      )}
                      {loading ? 'Confirming...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
