import { useState } from 'react';
import api from '../api/axios';

const FileUpload = ({ type, label, currentDoc, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const endpoint = type === 'medical-record' ? '/medical-records/upload' : '/documents/upload';
        if (type !== 'medical-record') {
            formData.append('type', type);
        }

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
            case 'approved': return 'bg-success/10 text-success border-success';
            case 'rejected': return 'bg-error/10 text-error border-error';
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
            default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
        }
    };

    return (
        <div className="bg-bg-card rounded-xl p-6 border border-slate-700 shadow-md">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-text-primary capitalize">{label}</h3>
                {currentDoc?.status && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentDoc.status)} capitalize`}>
                        {currentDoc.status}
                    </span>
                )}
            </div>

            {currentDoc?.url ? (
                <div className="mb-4">
                    <p className="text-sm text-text-secondary mb-2">Current Document:</p>
                    <a
                        href={currentDoc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm break-all"
                    >
                        View Document
                    </a>
                    {currentDoc.remark && (
                        <p className="mt-2 text-sm text-yellow-500">Remark: {currentDoc.remark}</p>
                    )}
                </div>
            ) : (
                <div className="mb-4 text-sm text-text-secondary italic">No document uploaded</div>
            )}

            {currentDoc?.status !== 'approved' && (
                <form onSubmit={handleUpload} className="space-y-3">
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-xs file:font-semibold
                file:bg-slate-700 file:text-white
                hover:file:bg-accent
              "
                    />
                    {message && <p className={`text-xs ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}

                    <button
                        type="submit"
                        disabled={!file || uploading}
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload New'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default FileUpload;
