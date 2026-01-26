import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // CSV Upload State
    const [csvFile, setCsvFile] = useState(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [csvMessage, setCsvMessage] = useState('');

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const { data } = await api.get('/admin/users');
            setUsers(data.users || []);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const handleCsvUpload = async (e) => {
        e.preventDefault();
        if (!csvFile) return;

        const formData = new FormData();
        formData.append('file', csvFile);

        try {
            setUploadingCsv(true);
            setCsvMessage('');
            await api.post('/admin/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCsvMessage('Centers data uploaded successfully!');
            setCsvFile(null);
        } catch (error) {
            setCsvMessage(error.response?.data?.message || 'CSV Upload failed');
        } finally {
            setUploadingCsv(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-text-primary">Admin Portal</h1>
                <div className="bg-bg-card p-1 rounded-lg border border-slate-700 inline-flex">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Center Data Upload
                    </button>
                </div>
            </div>

            {activeTab === 'users' ? (
                <div className="bg-bg-card rounded-xl border border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-text-secondary uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">City</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-text-primary">{user.name}</td>
                                        <td className="px-6 py-4 text-text-secondary">{user.email}</td>
                                        <td className="px-6 py-4 text-text-secondary capitalize">{user.role}</td>
                                        <td className="px-6 py-4 text-text-secondary">{user.city}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${user.applicationStatus === 'approved' ? 'border-success text-success bg-success/10' :
                                                    user.applicationStatus === 'rejected' ? 'border-error text-error bg-error/10' :
                                                        'border-yellow-500 text-yellow-500 bg-yellow-500/10'
                                                }`}>
                                                {user.applicationStatus || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && !loadingUsers && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-text-secondary">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {loadingUsers && <div className="p-4 text-center text-sm text-text-secondary">Loading users...</div>}
                </div>
            ) : (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-bg-card rounded-xl p-8 border border-slate-700 shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Upload Centers Data</h2>
                        <p className="text-text-secondary mb-6 text-sm">
                            Upload a CSV file containing center details (hospital/police) to populate the database.
                        </p>

                        <form onSubmit={handleCsvUpload} className="space-y-6">
                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-accent transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        setCsvFile(e.target.files[0]);
                                        setCsvMessage('');
                                    }}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload" className="cursor-pointer flex flex-col items-center">
                                    <span className="text-4xl mb-2">📁</span>
                                    <span className="text-text-primary font-medium">Click to select CSV</span>
                                    <span className="text-text-secondary text-sm mt-1">
                                        {csvFile ? csvFile.name : 'No file selected'}
                                    </span>
                                </label>
                            </div>

                            {csvMessage && (
                                <div className={`p-3 rounded-lg text-sm text-center ${csvMessage.includes('successful') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                    }`}>
                                    {csvMessage}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!csvFile || uploadingCsv}
                                className="w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {uploadingCsv ? 'Processing...' : 'Upload Data'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
