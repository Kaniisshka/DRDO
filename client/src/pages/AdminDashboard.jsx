import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(false);

    // CSV Upload State
    const [csvFile, setCsvFile] = useState(null);
    const [uploadingCsv, setUploadingCsv] = useState(false);
    const [csvMessage, setCsvMessage] = useState('');

    // Document Review State
    const [reviewingDoc, setReviewingDoc] = useState(null);
    const [reviewRemark, setReviewRemark] = useState('');
    const [reviewing, setReviewing] = useState(false);

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

    const fetchDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const { data } = await api.get('/documents/all');
            setDocuments(data || []);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoadingDocuments(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'documents') {
            fetchDocuments();
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

    const handleDocumentReview = async (userId, type, status) => {
        try {
            setReviewing(true);
            await api.post(`/admin/review/${userId}`, {
                type,
                status,
                remark: reviewRemark
            });

            // Refresh documents
            await fetchDocuments();

            // Close modal
            setReviewingDoc(null);
            setReviewRemark('');

            // Show success message (you might want to add toast notifications)
            alert(`${type} document ${status} successfully!`);
        } catch (error) {
            console.error("Failed to review document", error);
            alert(error.response?.data?.message || 'Review failed');
        } finally {
            setReviewing(false);
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
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'documents' ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Document Review
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
                                    <th className="px-6 py-4">Documents</th>
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
                                            {user.hasDocuments ? (
                                                <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs">
                                                    {user.documentsCount} submitted
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">
                                                    None
                                                </span>
                                            )}
                                        </td>
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
                                        <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">No users found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {loadingUsers && <div className="p-4 text-center text-sm text-text-secondary">Loading users...</div>}
                </div>
            ) : activeTab === 'documents' ? (
                <div className="space-y-6">
                    <div className="bg-bg-card rounded-xl border border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-text-primary">Document Review Queue</h2>
                            <p className="text-text-secondary text-sm">Review and approve/reject user submitted documents</p>
                        </div>

                        {documents.length === 0 && !loadingDocuments ? (
                            <div className="p-8 text-center text-text-secondary">No documents to review</div>
                        ) : (
                            <div className="divide-y divide-slate-700">
                                {documents.map((doc) => (
                                    <div key={doc._id} className="p-6 hover:bg-slate-800/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-text-primary">{doc.user?.name || 'Unknown User'}</h3>
                                                <p className="text-text-secondary text-sm">{doc.user?.email || 'No email'}</p>
                                                <p className="text-text-secondary text-sm">City: {doc.user?.city || 'Not specified'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-text-secondary text-sm">Submitted: {new Date(doc.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Medical Certificate */}
                                            {doc.medical && (
                                                <div className="bg-slate-800/50 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-text-primary">🏥 Medical Certificate</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            doc.medical.status === 'approved' ? 'bg-success/20 text-success' :
                                                            doc.medical.status === 'rejected' ? 'bg-error/20 text-error' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {doc.medical.status || 'pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 mb-2">
                                                        <button
                                                            onClick={() => handleDocumentReview(doc.userId, 'medical', 'approved')}
                                                            disabled={reviewing || doc.medical.status === 'approved'}
                                                            className="flex-1 bg-success hover:bg-success/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewingDoc({ userId: doc.userId, type: 'medical', action: 'reject' })}
                                                            disabled={reviewing || doc.medical.status === 'rejected'}
                                                            className="flex-1 bg-error hover:bg-error/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    {doc.medical.remark && (
                                                        <p className="text-text-secondary text-xs">Remark: {doc.medical.remark}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Police Verification */}
                                            {doc.police && (
                                                <div className="bg-slate-800/50 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-text-primary">🚔 Police Verification</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            doc.police.status === 'approved' ? 'bg-success/20 text-success' :
                                                            doc.police.status === 'rejected' ? 'bg-error/20 text-error' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {doc.police.status || 'pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 mb-2">
                                                        <button
                                                            onClick={() => handleDocumentReview(doc.userId, 'police', 'approved')}
                                                            disabled={reviewing || doc.police.status === 'approved'}
                                                            className="flex-1 bg-success hover:bg-success/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewingDoc({ userId: doc.userId, type: 'police', action: 'reject' })}
                                                            disabled={reviewing || doc.police.status === 'rejected'}
                                                            className="flex-1 bg-error hover:bg-error/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    {doc.police.remark && (
                                                        <p className="text-text-secondary text-xs">Remark: {doc.police.remark}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Caste Certificate */}
                                            {doc.caste && (
                                                <div className="bg-slate-800/50 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="font-medium text-text-primary">📜 Caste Certificate</h4>
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            doc.caste.status === 'approved' ? 'bg-success/20 text-success' :
                                                            doc.caste.status === 'rejected' ? 'bg-error/20 text-error' :
                                                            'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                            {doc.caste.status || 'pending'}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 mb-2">
                                                        <button
                                                            onClick={() => handleDocumentReview(doc.userId, 'caste', 'approved')}
                                                            disabled={reviewing || doc.caste.status === 'approved'}
                                                            className="flex-1 bg-success hover:bg-success/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setReviewingDoc({ userId: doc.userId, type: 'caste', action: 'reject' })}
                                                            disabled={reviewing || doc.caste.status === 'rejected'}
                                                            className="flex-1 bg-error hover:bg-error/80 text-white text-xs py-1 px-2 rounded disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                    {doc.caste.remark && (
                                                        <p className="text-text-secondary text-xs">Remark: {doc.caste.remark}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {loadingDocuments && <div className="p-4 text-center text-sm text-text-secondary">Loading documents...</div>}
                    </div>

                    {/* Review Modal */}
                    {reviewingDoc && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-bg-card rounded-xl p-6 border border-slate-700 max-w-md w-full mx-4">
                                <h3 className="text-lg font-bold text-text-primary mb-4">Reject Document</h3>
                                <p className="text-text-secondary mb-4">
                                    Please provide a reason for rejecting the {reviewingDoc.type} document:
                                </p>
                                <textarea
                                    value={reviewRemark}
                                    onChange={(e) => setReviewRemark(e.target.value)}
                                    placeholder="Enter rejection reason..."
                                    className="w-full bg-bg-primary border border-slate-700 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors mb-4"
                                    rows="3"
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            handleDocumentReview(reviewingDoc.userId, reviewingDoc.type, 'rejected');
                                        }}
                                        disabled={reviewing || !reviewRemark.trim()}
                                        className="flex-1 bg-error hover:bg-error/80 text-white py-2 rounded-lg font-medium disabled:opacity-50"
                                    >
                                        {reviewing ? 'Rejecting...' : 'Reject Document'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setReviewingDoc(null);
                                            setReviewRemark('');
                                        }}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
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
