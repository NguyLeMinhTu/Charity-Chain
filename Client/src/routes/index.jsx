import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CampaignList from '../pages/CampaignList';
import CampaignDetail from '../pages/CampaignDetail';
import CreateCampaign from '../pages/CreateCampaign';
import MyDonations from '../pages/MyDonations';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/Common/ProtectedRoute';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/campaigns" element={<CampaignList />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route
                path="/campaigns/create"
                element={
                    <ProtectedRoute>
                        <CreateCampaign />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/me/donations"
                element={
                    <ProtectedRoute>
                        <MyDonations />
                    </ProtectedRoute>
                }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
}