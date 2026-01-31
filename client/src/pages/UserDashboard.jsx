import { useState, useEffect } from 'react';
import api from '../api/axios';
import FileUpload from '../components/FileUpload';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
    const [documents, setDocuments] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">My Dashboard</h1>
                <p className="text-text-secondary">Manage your documents and appointments.</p>
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
                    <FileUpload
                        type="medical-record"
                        label="Medical Record"
                        currentDoc={null} // Assuming no current for medical records
                        onUploadSuccess={fetchDocuments}
                    />
                </div>
            </div>

            {/* Appointments Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-text-primary">My Appointments</h2>
                        <p className="text-text-secondary">View and manage your scheduled appointments.</p>
                    </div>
                    <Link
                        to="/appointment"
                        className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Book New Appointment
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="bg-bg-card rounded-lg p-8 text-center border border-slate-700">
                        <p className="text-text-secondary mb-4">No appointments scheduled yet.</p>
                        <Link
                            to="/appointment"
                            className="text-accent hover:text-accent-hover font-medium"
                        >
                            Book your first appointment →
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {appointments.map((appointment) => (
                            <div key={appointment._id} className="bg-bg-card rounded-lg p-6 border border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary capitalize">
                                            {appointment.centerType} Verification
                                        </h3>
                                        <p className="text-text-secondary text-sm">
                                            {appointment.centerId?.name || 'Center Name'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        appointment.status === 'booked'
                                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500'
                                            : appointment.status === 'completed'
                                            ? 'bg-green-500/10 text-green-500 border border-green-500'
                                            : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500'
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
