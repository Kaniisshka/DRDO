import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);

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
            fetchDocuments();
        }
    }, [activeTab]);

    const getUserDocuments = (userId) => {
        return documents.find(doc => {
            // Handle both populated object and string ID
            const docUserId = typeof doc.userId === 'object' ? doc.userId?._id : doc.userId;
            return docUserId === userId;
        });
    };

    const toggleExpand = (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
        } else {
            setExpandedUser(userId);
        }
    };

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
        if (!userId) {
            alert("Error: User ID is missing.");
            return;
        }

        try {
            setReviewing(true);

            // Optimistic update for documents list
            setDocuments(prevDocs => prevDocs.map(doc => {
                const docUserId = typeof doc.userId === 'object' ? doc.userId?._id : doc.userId;
                if (docUserId === userId) {
                    return {
                        ...doc,
                        [type]: {
                            ...doc[type],
                            status: status,
                            remark: status === 'approved' ? '' : reviewRemark
                        }
                    };
                }
                return doc;
            }));

            // ALSO update the users list so the status badge updates immediately
            const { data: responseData } = await api.post(`/admin/review/${userId}`, {
                type,
                status,
                remark: reviewRemark
            });

            if (responseData.userStatus) {
                setUsers(prevUsers => prevUsers.map(user => {
                    if (user._id === userId) {
                        return { ...user, applicationStatus: responseData.userStatus };
                    }
                    return user;
                }));
            }

            // Also update user status if needed (optional based on backend logic)
            // Ideally we re-fetch users or update locally if we knew the rule

            // Close modal if open
            if (reviewingDoc) {
                setReviewingDoc(null);
                setReviewRemark('');
            }
        } catch (error) {
            console.error("Failed to review document", error);
            alert(error.response?.data?.message || 'Review failed');
        } finally {
            setReviewing(false);
        }
    };

    const renderDocumentCard = (title, docData, type, userId) => {
        if (!docData) return null;

        return (
            <div className="bg-slate-800/50 rounded-lg p-4 flex flex-col h-full border border-slate-700">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-text-primary flex items-center gap-2">
                        {title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs uppercase font-bold tracking-wider ${docData.status === 'approved' ? 'bg-success/20 text-success' :
                        docData.status === 'rejected' ? 'bg-error/20 text-error' :
                            'bg-yellow-500/20 text-yellow-500'
                        }`}>
                        {docData.status || 'pending'}
                    </span>
                </div>

                <div className="flex-1 mb-4">
                    <a
                        href={docData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-hover text-sm underline underline-offset-2 flex items-center gap-1"
                    >
                        <span>📄 View Document</span>
                    </a>
                    {docData.remark && (
                        <p className="mt-2 text-xs text-text-secondary bg-slate-900/50 p-2 rounded border border-slate-700">
                            <span className="font-semibold text-slate-400">Note:</span> {docData.remark}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 mt-auto pt-3 border-t border-slate-700/50">
                    <button
                        onClick={() => handleDocumentReview(userId, type, 'approved')}
                        disabled={reviewing || docData.status === 'approved'}
                        className="flex-1 bg-success hover:bg-success/80 text-white text-xs py-1.5 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Approve Document"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => setReviewingDoc({ userId, type, action: 'reject' })}
                        disabled={reviewing || docData.status === 'rejected'}
                        className="flex-1 bg-error hover:bg-error/80 text-white text-xs py-1.5 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reject Document"
                    >
                        Reject
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary">Admin Portal</h1>
                    <p className="text-text-secondary text-sm mt-1">Manage users, specific verifications, and center data</p>
                </div>
                <div className="bg-bg-card p-1 rounded-lg border border-slate-700 inline-flex">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        User & Verification Management
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-accent text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'
                            }`}
                    >
                        Center Data Upload
                    </button>
                </div>
            </div>

            {activeTab === 'users' ? (
                <div className="bg-bg-card rounded-xl border border-slate-700 overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-text-primary">Candidates List</h2>
                        <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">Total: {users.length}</span>
                    </div>

                    {loadingUsers ? (
                        <div className="p-12 text-center text-text-secondary animate-pulse">Loading users and documents...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-800/50 text-text-secondary uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Candidate</th>
                                        <th className="px-6 py-4 font-semibold">Role</th>
                                        <th className="px-6 py-4 font-semibold">Location</th>
                                        <th className="px-6 py-4 font-semibold">Docs Status</th>
                                        <th className="px-6 py-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {users.map((user) => {
                                        const userDoc = getUserDocuments(user._id);
                                        const isExpanded = expandedUser === user._id;

                                        return (
                                            <div key={user._id} className="contents group">
                                                <tr className={`transition-colors ${isExpanded ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'}`}>
                                                    <td className="px-6 py-4">
                                                        <div>
                                                            <div className="font-medium text-text-primary text-base">{user.name}</div>
                                                            <div className="text-text-secondary text-xs">{user.email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-secondary capitalize text-sm">{user.role}</td>
                                                    <td className="px-6 py-4 text-text-secondary text-sm">{user.city || 'N/A'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.applicationStatus === 'approved' ? 'border-success/30 text-success bg-success/10' :
                                                            user.applicationStatus === 'rejected' ? 'border-error/30 text-error bg-error/10' :
                                                                'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                                                            }`}>
                                                            {user.applicationStatus || 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => toggleExpand(user._id)}
                                                            className={`text-sm px-3 py-1.5 rounded border transition-all ${isExpanded
                                                                ? 'bg-accent/20 border-accent text-accent'
                                                                : 'border-slate-600 text-text-secondary hover:border-slate-400 hover:text-text-primary'
                                                                }`}
                                                        >
                                                            {isExpanded ? 'Hide Review' : 'Review Docs'}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {/* Expanded Row for Documents */}
                                                {isExpanded && (
                                                    <tr className="bg-slate-800/20">
                                                        <td colSpan="5" className="px-6 pb-6 pt-2">
                                                            <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                {!userDoc ? (
                                                                    <div className="text-center py-8 text-text-secondary opacity-75">
                                                                        <span className="text-2xl block mb-2">📂</span>
                                                                        No documents uploaded by this user yet.
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                                        {userDoc.medical ? (
                                                                            renderDocumentCard("🏥 Medical Certificate", userDoc.medical, 'medical', user._id)
                                                                        ) : (
                                                                            <div className="bg-slate-800/30 rounded-lg p-6 flex items-center justify-center border border-dashed border-slate-700 text-text-secondary">
                                                                                🏥 Medical Not Uploaded
                                                                            </div>
                                                                        )}

                                                                        {userDoc.police ? (
                                                                            renderDocumentCard("🚔 Police Verification", userDoc.police, 'police', user._id)
                                                                        ) : (
                                                                            <div className="bg-slate-800/30 rounded-lg p-6 flex items-center justify-center border border-dashed border-slate-700 text-text-secondary">
                                                                                🚔 Police Not Uploaded
                                                                            </div>
                                                                        )}

                                                                        {userDoc.caste ? (
                                                                            renderDocumentCard("📜 Caste Certificate", userDoc.caste, 'caste', user._id)
                                                                        ) : (
                                                                            <div className="bg-slate-800/30 rounded-lg p-6 flex items-center justify-center border border-dashed border-slate-700 text-text-secondary">
                                                                                📜 Caste Not Uploaded
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-text-secondary">No users found in the system.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-3xl mx-auto mt-10">
                    <div className="bg-bg-card rounded-xl p-8 border border-slate-700 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="inline-block p-3 rounded-full bg-accent/20 text-accent mb-4">
                                <span className="text-3xl">📥</span>
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary">Upload Centers Database</h2>
                            <p className="text-text-secondary mt-2">
                                Update the system with the latest Hospital and Police Station records via CSV.
                            </p>
                        </div>

                        <form onSubmit={handleCsvUpload} className="space-y-6">
                            <div className="group border-2 border-dashed border-slate-600 rounded-xl p-10 text-center hover:border-accent hover:bg-slate-800/30 transition-all cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => {
                                        setCsvFile(e.target.files[0]);
                                        setCsvMessage('');
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    id="csv-upload"
                                />
                                <div className="space-y-3 pointer-events-none">
                                    <span className="text-5xl block opacity-50 group-hover:opacity-100 transition-opacity">📄</span>
                                    <h3 className="text-lg font-medium text-text-primary group-hover:text-accent transition-colors">
                                        {csvFile ? csvFile.name : 'Drag & Drop or Click to Upload CSV'}
                                    </h3>
                                    {!csvFile && <p className="text-sm text-text-secondary">Supported format: .csv only</p>}
                                </div>
                            </div>

                            {csvMessage && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${csvMessage.includes('successful') ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'
                                    }`}>
                                    <span className="text-xl">{csvMessage.includes('successful') ? '✅' : '⚠️'}</span>
                                    <p className="text-sm font-medium">{csvMessage}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!csvFile || uploadingCsv}
                                className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-lg font-bold shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex justify-center items-center gap-2"
                            >
                                {uploadingCsv && <span className="animate-spin text-xl">⟳</span>}
                                {uploadingCsv ? 'Processing Data...' : 'Upload CSV Database'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Rejection Modal */}
            {reviewingDoc && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-bg-card rounded-xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-text-primary">Reject Document</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-text-secondary mb-2 text-sm">
                                You are about to reject the <span className="font-semibold text-text-primary capitalize">{reviewingDoc.type}</span> document.
                            </p>
                            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Rejection Reason</label>
                            <textarea
                                value={reviewRemark}
                                onChange={(e) => setReviewingDoc(prev => ({ ...prev, remark: e.target.value })) || setReviewRemark(e.target.value)}
                                placeholder="E.g., Document hidden, blurry, wrong format..."
                                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-text-primary placeholder:text-slate-600 focus:outline-none focus:border-error focus:ring-1 focus:ring-error transition-all resize-none"
                                rows="4"
                                autoFocus
                            />
                        </div>
                        <div className="p-6 pt-0 flex gap-3">
                            <button
                                onClick={() => {
                                    setReviewingDoc(null);
                                    setReviewRemark('');
                                }}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDocumentReview(reviewingDoc.userId, reviewingDoc.type, 'rejected');
                                }}
                                disabled={reviewing || !reviewRemark.trim()}
                                className="flex-1 bg-error hover:bg-error/80 text-white py-2.5 rounded-lg font-medium shadow-lg shadow-error/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                            >
                                {reviewing ? 'Processing...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
