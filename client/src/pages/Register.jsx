import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user', // Default role
        city: '',
        address: '',
        applicationStatus: 'pending' // Default per schema
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await register(formData);
        if (!result.success) {
            setError(result.message);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
            <div className="max-w-2xl w-full bg-bg-card rounded-xl shadow-lg p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                    Create Account
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Password */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Role Selection */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Account Type</label>
                        <select
                            name="role"
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="user">User</option>
                            {/* Only showing User for now, Admin usually created manually, but enabling if needed */}
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* City */}
                    <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-text-secondary mb-2">City</label>
                        <input
                            type="text"
                            name="city"
                            required
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="New Delhi"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Address</label>
                        <textarea
                            name="address"
                            required
                            rows="3"
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                            placeholder="Enter your full address"
                            value={formData.address}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Submit */}
                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-text-secondary text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
                        Sign In here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
