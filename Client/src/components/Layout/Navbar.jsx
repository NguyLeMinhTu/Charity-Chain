import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">
                    Charity Chain
                </Link>
                <div className="space-x-4">
                    <Link to="/campaigns">Campaigns</Link>
                    {user ? (
                        <>
                            <Link to="/campaigns/create">Create Campaign</Link>
                            <Link to="/me/donations">My Donations</Link>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;