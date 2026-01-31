import { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { appointmentSchema } from '../utils/validationSchemas';

const AppointmentPage = () => {
    const [type, setType] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await appointmentSchema.validate({ type, date }, { abortEarly: false });
            setLoading(true);
            await api.post('/appointment/book', { type, date });
            navigate('/dashboard');
        } catch (validationError) {
            if (validationError.name === 'ValidationError' && validationError.errors && Array.isArray(validationError.errors)) {
                setError(validationError.errors.join(', '));
            } else {
                setError(validationError.response?.data?.message || validationError.message || 'Booking failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-8">
            <div className="max-w-2xl w-full bg-bg-card rounded-xl shadow-lg p-8 border border-slate-700">
                <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                    Book Appointment
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Appointment Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors select-input"
                            required
                        >
                            <option value="">Select appointment type</option>
                            <option value="hospital">🏥 Hospital (Medical Verification)</option>
                            <option value="police">🚔 Police Station (Background Verification)</option>
                        </select>
                    </div>

                    {/* Date Selection */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Preferred Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors date-input"
                                style={{
                                    colorScheme: 'dark'
                                }}
                                required
                            />
                        </div>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                                .date-input::-webkit-calendar-picker-indicator {
                                    filter: brightness(0) invert(1);
                                    cursor: pointer;
                                    opacity: 0.8;
                                }
                                .date-input::-webkit-calendar-picker-indicator:hover {
                                    opacity: 1;
                                    background-color: rgba(255, 255, 255, 0.1);
                                    border-radius: 4px;
                                }
                                .date-input::-webkit-inner-spin-button,
                                .date-input::-webkit-outer-spin-button {
                                    -webkit-appearance: none;
                                    margin: 0;
                                }
                                .select-input {
                                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
                                    background-repeat: no-repeat;
                                    background-position: right 12px center;
                                    background-size: 16px;
                                    padding-right: 40px;
                                    -webkit-appearance: none;
                                    -moz-appearance: none;
                                    appearance: none;
                                }
                            `
                        }} />
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent hover:bg-accent-hover text-white font-semibold py-3 rounded-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Booking Appointment...' : 'Book Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentPage;