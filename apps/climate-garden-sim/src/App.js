import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppContent from './components/AppContent.js';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
