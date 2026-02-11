// src/components/common/FilePreviewModal.jsx

import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FilePreview({ isOpen, onClose, fileUrl, fileName }) {
  const [loading, setLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let controller = new AbortController();
    let createdUrl = null;

    const fetchFile = async () => {
      if (!isOpen || !fileUrl) return;
      setLoading(true);
      setError(null);

      try {
        // Request config untuk blob response
        const requestConfig = {
          responseType: 'blob',
          signal: controller.signal,
        };

        const url = fileUrl.startsWith('http') ? fileUrl : fileUrl;

        // axios interceptor akan otomatis menambahkan Authorization header
        const response = await api.get(url, requestConfig);

        console.log('FilePreview response status:', response.status);

        createdUrl = URL.createObjectURL(response.data);
        setBlobUrl(createdUrl);
      } catch (err) {
        console.error('FilePreview fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Gagal memuat file');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();

    return () => {
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
      setBlobUrl(null);
      setError(null);
      setLoading(false);
    };
  }, [isOpen, fileUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{fileName || 'Preview File'}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center text-red-600">{error}</div>
          )}

          {!loading && !error && blobUrl && (
            <iframe src={blobUrl} className="w-full h-full border-0" title="File Preview" />
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}