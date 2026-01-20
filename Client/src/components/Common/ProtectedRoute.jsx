import { useWeb3Context } from '../../context/Web3Context';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { account, loading } = useWeb3Context();
    const { user } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Allow access when either a web3 wallet is connected or an authenticated user exists
    if (!account && !user) {
        return <Navigate to="/" replace />; // Redirect to home instead of login
    }

    return children;
};

export default ProtectedRoute;