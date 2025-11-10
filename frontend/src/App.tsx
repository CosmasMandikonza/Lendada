import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() { return <div className="p-6">Home (stub)</div>; }

export default function App() {
  return (
    <Router>
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}
