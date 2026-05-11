import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExpertList } from './pages/ExpertList';
import { ExpertDetail } from './pages/ExpertDetail';
import { MyBookings } from './pages/MyBookings';
import { Navbar } from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <Routes>
            <Route path="/" element={<ExpertList />} />
            <Route path="/experts/:id" element={<ExpertDetail />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
