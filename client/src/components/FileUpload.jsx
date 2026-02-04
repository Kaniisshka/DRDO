import { useState } from 'react';
import api from '../api/axios';

const FileUpload = ({ type, label, currentDoc, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [isDeleted, setIsDeleted] = useState(false);


    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = '/documents/upload';
        formData.append('type', type);

        try {
            setUploading(true);
            setMessage('');

            await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessage('Upload successful!');
            setFile(null);
            setIsDeleted(false); // Reset deleted state on new upload
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-300';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-300';
            case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
            default: return 'bg-gray-100 text-gray-600 border-gray-300';
        }
    };

    const docUrl = currentDoc?.url || null;
    const docName = currentDoc?.url ? (type + ' Document') : 'Document';
    const isUploaded = !!docUrl && !isDeleted; // If marked deleted locally, treat as not uploaded
    // Allow upload if: not uploaded OR rejected OR marked deleted
    const showUploadForm = !isUploaded || currentDoc?.status === 'rejected' || isDeleted;

    return (
        <div className="bg-bg-card rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-text-primary capitalize">{label}</h3>
                {currentDoc?.status && !isDeleted && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentDoc.status)} capitalize`}>
                        {currentDoc.status}
                    </span>
                )}
            </div>

            {isUploaded ? (
                <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">Current Document:</p>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-text-primary truncate max-w-[200px]">{docName}</span>
                        <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline text-xs font-medium"
                        >
                            View
                        </a>
                    </div>

                    {currentDoc.remark && (
                        <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">Remark: {currentDoc.remark}</p>
                    )}

                    {/* Change Document Button */}
                    {currentDoc?.status !== 'approved' && (
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    console.log("Change button clicked");
                                    if (window.confirm('Are you sure you want to change this document? The current file will be deleted.')) {
                                        try {
                                            setUploading(true);
                                            await api.delete(`/documents/${type}`);
                                            setMessage('Document removed. Please upload new file.');
                                            setIsDeleted(true); // Force local state to deleted
                                            if (onUploadSuccess) onUploadSuccess();
                                        } catch (err) {
                                            console.error(err);
                                            // Handling 404: If document is not found, it's effectively deleted/missing.
                                            if (err.response && err.response.status === 404) {
                                                setMessage('Document already removed. Ready for new upload.');
                                                setIsDeleted(true); // Force local state to deleted even on 404
                                                if (onUploadSuccess) onUploadSuccess();
                                            } else {
                                                setMessage('Failed to remove document');
                                            }
                                        } finally {
                                            setUploading(false);
                                        }
                                    }
                                }}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded px-3 py-1 text-xs transition-colors border border-gray-300"
                                type="button"
                                disabled={uploading}
                            >
                                {uploading ? 'Processing...' : 'Change Document'}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mb-4 text-sm text-text-secondary italic">No document uploaded</div>
            )}

            {message && <p className={`text-xs mb-3 ${message.includes('success') || message.includes('removed') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}

            {showUploadForm ? (
                <form onSubmit={handleUpload} className="space-y-3">
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-600
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-xs file:font-semibold
                            file:bg-accent file:text-white
                            hover:file:bg-accent-hover
                          "
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="flex-1 bg-accent hover:bg-accent-hover text-white rounded-lg py-2 text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Uploading...' : 'Upload New'}
                        </button>
                    </div>
                </form>
            ) : null}
        </div>
    );
};

export default FileUpload;
