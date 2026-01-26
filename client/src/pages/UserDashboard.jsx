import { useState, useEffect } from 'react';
import api from '../api/axios';
import FileUpload from '../components/FileUpload';

const UserDashboard = () => {
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/documents/my');
            setDocuments(data);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2">My Documents</h1>
                <p className="text-text-secondary">Manage and track your verification documents.</p>
            </div>

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
    );
};

export default UserDashboard;
