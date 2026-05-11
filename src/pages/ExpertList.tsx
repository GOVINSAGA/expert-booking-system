import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Briefcase, Filter } from 'lucide-react';
import { Expert } from '../types';

export function ExpertList() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchExperts = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/experts', window.location.origin);
      url.searchParams.set('page', page.toString());
      if (search) url.searchParams.set('search', search);
      if (category) url.searchParams.set('category', category);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch experts');
      const data = await res.json();
      setExperts(data.data);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on new search/filter
      fetchExperts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  useEffect(() => {
    fetchExperts();
  }, [page]);

  const categories = ['', 'Medical', 'Legal', 'Tech Consulting', 'Finance', 'Mental Health'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Find an Expert</h1>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search experts..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 flex-grow focus:ring-indigo-500 transition-all font-medium text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.filter(Boolean).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : loading && experts.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
            </div>
          ))}
        </div>
      ) : experts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No experts found</h3>
          <p className="mt-1 text-gray-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experts.map(expert => (
            <Link 
              key={expert._id} 
              to={`/experts/${expert._id}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all group flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl ring-4 ring-white group-hover:ring-indigo-50 transition-all">
                  {expert.name.charAt(0)}
                </div>
                <div className="flex items-center text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  {expert.rating.toFixed(1)}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {expert.name}
              </h3>
              
              <div className="flex items-center text-sm font-medium text-gray-500 mb-3 gap-3">
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs text-gray-600">
                  <Briefcase className="w-3.5 h-3.5" />
                  {expert.category}
                </span>
                <span className="text-xs">{expert.experience} yrs exp</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mt-auto mb-5 leading-relaxed tracking-wide">
                {expert.bio}
              </p>

              <button className="w-full mt-auto py-2.5 bg-gray-50 text-indigo-600 text-sm font-semibold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                View Availability
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 shadow-sm text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 border border-gray-200 shadow-sm text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
