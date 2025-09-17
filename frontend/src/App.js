import './App.css';

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import UsersList from './pages/UsersList';
import UserDetail from './pages/UserDetail';
import LinesList from './pages/LinesList';
import TelcosList from './pages/TelcosList';
import TelcoDetail from './pages/TelcoDetail';
import CompaniesList from './pages/CompaniesList';
import CompanyDetail from './pages/CompanyDetail';
import LegalRepresentativesList from './pages/LegalRepresentativesList';
import PlansList from './pages/PlansList';
import PositionsList from './pages/PositionsList';
import AdvisorsList from './pages/AdvisorsList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LinesList />} />
          <Route path="users" element={<UsersList />} />
          <Route path="usuarios" element={<UsersList />} />
          <Route path="usuarios/:id" element={<UserDetail />} />
          <Route path="lines" element={<LinesList />} />
          <Route path="telcos" element={<TelcosList />} />
          <Route path="telcos/:id" element={<TelcoDetail />} />
          <Route path="companies" element={<CompaniesList />} />
          <Route path="companies/:id" element={<CompanyDetail />} />
          <Route path="legal-representatives" element={<LegalRepresentativesList />} />
          <Route path="plans" element={<PlansList />} />
          <Route path="positions" element={<PositionsList />} />
          <Route path="advisors" element={<AdvisorsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
