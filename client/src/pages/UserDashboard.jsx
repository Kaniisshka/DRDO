import { useState, useEffect } from 'react';
import api from '../api/axios';
import FileUpload from '../components/FileUpload';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const [documents, setDocuments] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCongrats, setShowCongrats] = useState(false);
    const { user } = useAuth();



    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/documents/my');
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointment/my');
            setAppointments(data);
        } catch (error) {
            console.error("Failed to fetch appointments", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchDocuments(), fetchAppointments()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    // Check if all documents are approved and show congratulations
    useEffect(() => {
        if (documents && user) {
            const allApproved = 
                documents.medical?.status === 'approved' &&
                documents.police?.status === 'approved' &&
                documents.caste?.status === 'approved';
            
            // Create a user-specific key for localStorage
            const storageKey = `congratsShown_${user._id || user.id}`;
            
            // Only show if all approved and haven't shown for this specific user
            if (allApproved && !localStorage.getItem(storageKey)) {
                setShowCongrats(true);
                localStorage.setItem(storageKey, 'true');
            }
        }
    }, [documents, user]);

    if (loading) return <div className="p-8 text-center text-text-secondary">Loading dashboard...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Congratulations Modal */}
            {showCongrats && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full border-2 border-green-500 shadow-2xl animate-fadeIn">
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2">Congratulations!</h3>
                            <p className="text-text-secondary mb-6">Your documents have been verified successfully!</p>
                            <button
                                onClick={() => setShowCongrats(false)}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm"
                            >
                                Great!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8">
            </div>

            {/* Documents Section */}
            <div className="mb-12">
                <h2 className="text-2xl font-semibold text-text-primary mb-4">My Documents</h2>
                <p className="text-text-secondary mb-6">Upload and track your verification documents.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FileUpload
                        type="medical"
                        label="Medical Certificate"
                        currentDoc={documents?.medical}
                        onUploadSuccess={fetchDocuments}
                    />
                    <FileUpload
                        type="police"
                        label="Police Verification"
                        currentDoc={documents?.police}
                        onUploadSuccess={fetchDocuments}
                    />
                    <FileUpload
                        type="caste"
                        label="Caste Certificate"
                        currentDoc={documents?.caste}
                        onUploadSuccess={fetchDocuments}
                    />
                </div>
            </div>

            {/* Appointments Section */}
            <div>
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold text-text-primary">My Appointments</h2>
                    <p className="text-text-secondary">View and manage your scheduled appointments.</p>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-bg-card rounded-lg p-8 text-center border border-gray-200 shadow-sm">
                        <p className="text-text-secondary mb-4 italic">Appointment details will appear here once approved by the Admin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="bg-bg-card rounded-lg p-6 border border-gray-200 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary capitalize">
                                            {appointment.centerType} Verification
                                        </h3>
                                        <p className="text-text-secondary text-sm">
                                            {appointment.centerId?.name || 'Center Name'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${appointment.status === 'booked'
                                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                                        : appointment.status === 'completed'
                                            ? 'bg-green-50 text-green-700 border-green-300'
                                            : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                        }`}>
                                        {appointment.status}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-text-secondary">
                                        <span className="font-medium">Date:</span> {new Date(appointment.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-text-secondary">
                                        <span className="font-medium">Location:</span> {appointment.centerId?.address || 'Address not available'}
                                    </p>
                                    <p className="text-text-secondary">
                                        <span className="font-medium">City:</span> {appointment.centerId?.city || 'City not available'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
