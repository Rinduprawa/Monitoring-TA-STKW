import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Testing CORS...');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    // Test fetch ke Laravel API
    fetch('http://localhost:8000/api/test')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log('✅ Response from Laravel:', data);
        setMessage(data.message);
        setStatus('success');
      })
      .catch(error => {
        console.error('❌ CORS Error:', error);
        setMessage('CORS Error! Check console (F12)');
        setStatus('error');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-indigo-600 mb-4">
          CORS Test
        </h1>
        
        <div className={`p-4 rounded-lg mb-4 ${
          status === 'success' ? 'bg-green-100 border border-green-400' :
          status === 'error' ? 'bg-red-100 border border-red-400' :
          'bg-gray-100 border border-gray-400'
        }`}>
          <p className={`text-lg font-medium ${
            status === 'success' ? 'text-green-800' :
            status === 'error' ? 'text-red-800' :
            'text-gray-800'
          }`}>
            {message}
          </p>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>Laravel API:</strong> http://localhost:8000/api/test</p>
          <p><strong>React App:</strong> http://localhost:5173</p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Buka Console (F12) untuk lihat detail response
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;