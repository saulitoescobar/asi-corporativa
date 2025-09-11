import './App.css';

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import UsersList from './pages/UsersList';
import LinesList from './pages/LinesList';
import TelcosList from './pages/TelcosList';
import CompaniesList from './pages/CompaniesList';
import PlansList from './pages/PlansList';
import PositionsList from './pages/PositionsList';
import AdvisorsList from './pages/AdvisorsList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<UsersList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="lines" element={<LinesList />} />
          <Route path="telcos" element={<TelcosList />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="plans" element={<PlansList />} />
          <Route path="positions" element={<PositionsList />} />
          <Route path="advisors" element={<AdvisorsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
