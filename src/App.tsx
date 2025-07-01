// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CallComponent from './components/CallComponent';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/call/:agentId/:promptId" element={<CallComponent />} />
    </Routes>
  );
};

export default App;
