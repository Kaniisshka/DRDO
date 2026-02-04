import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-bg-card border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-accent">
                            PramaanSetu
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <span className="text-text-secondary text-sm hidden md:block">
                                    Welcome, <span className="text-text-primary font-medium">{user.name}</span>
                                </span>

                                {user.role === 'admin' ? (
                                    <Link to="/admin" className="text-text-secondary hover:text-accent transition-colors font-medium">
                                        Admin Dashboard
                                    </Link>
                                ) : (
                                    <Link to="/dashboard" className="text-text-secondary hover:text-accent transition-colors font-medium">
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={logout}
                                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-text-secondary hover:text-text-primary px-3 py-2 transition-colors font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
