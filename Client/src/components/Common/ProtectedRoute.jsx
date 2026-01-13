import { useWeb3Context } from '../../context/Web3Context';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { account, loading } = useWeb3Context();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!account) {
        return <Navigate to="/" replace />; // Redirect to home instead of login
    }

    return children;
};

export default ProtectedRoute;