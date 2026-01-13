import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CampaignList from './pages/CampaignList';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './pages/CreateCampaign';
import MyDonations from './pages/MyDonations';
import MyCampaigns from './pages/MyCampaigns';
import Profile from './pages/Profile';
import ProtectedRoute from './components/Common/ProtectedRoute';
import AuthProtectedRoute from './components/Common/AuthProtectedRoute';
import AdminLogin from './pages/AdminLogin';
import AdminProtectedRoute from './components/Common/AdminProtectedRoute';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/:id" element={<CampaignDetail />} />
        <Route
          path="/campaigns/create"
          element={
            <AuthProtectedRoute>
              <CreateCampaign />
            </AuthProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/create" element={<AdminProtectedRoute><CreateCampaign /></AdminProtectedRoute>} />
        <Route path="/profile" element={<AuthProtectedRoute><Profile /></AuthProtectedRoute>} />
        <Route
          path="/me/donations"
          element={
            <ProtectedRoute>
              <MyDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/me/campaigns"
          element={
            <AuthProtectedRoute>
              <MyCampaigns />
            </AuthProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
