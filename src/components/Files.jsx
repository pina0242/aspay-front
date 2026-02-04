import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Files = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [entidad, setEntidad] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccessMessage('');
      setStatusMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!entidad.trim()) { setError("Ingrese el código de la Entidad."); return; }
    if (!selectedFile) { setError("Seleccione un archivo."); return; }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setStatusMessage('Procesando archivo...');

    try {
      const fileContent = await selectedFile.text();
      const payload = {
        entidad: entidad,
        filename: selectedFile.name,
        content: fileContent
      };
      setEncrypting(true);
      setDataToProcess(payload);
    } catch (err) {
      setError("Error al leer el archivo. " + err.message);
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    setStatusMessage('Subiendo información...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });
      
      const responseData = await response.json().catch(() => null);

      if (response.status === 201) {
        setSuccessMessage(responseData?.[0]?.response || 'Archivo subido exitosamente.');
        setEntidad('');
        setSelectedFile(null);
        // Reset file input manual
        document.getElementById('file-upload').value = "";
      } else {
        setError(responseData?.[0]?.response || 'Error al procesar la subida.');
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="main-container">
      <div className="depth-2-frame-0">
        <div className="depth-3-frame-0">
          <div className="depth-4-frame-1">
            <div className="acme-co">ASPAY</div>
          </div>
        </div>
        <div className="depth-3-frame-1">
          <div className="depth-4-frame-02">
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
              <div className="product">Regresar</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>

      <div className="listusr-content-container">
        <h1 className="listusr-title">Subir Archivos Masivos</h1>
        
        <form className="listusr-form" onSubmit={handleUpload}>
          {/* Fila Contenedora para Alineación */}
          <div className="form-row" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            
            <div className="form-group" style={{ flex: '1', minWidth: '200px' }}>
              <label htmlFor="entidad">Entidad:</label>
              <input 
                type="text" 
                id="entidad" 
                placeholder="Ej: 0001"
                value={entidad} 
                onChange={(e) => setEntidad(e.target.value)} 
                required 
                className="input-field"
                style={{ width: '100%', height: '40px' }}
              />
            </div>

            <div className="form-group" style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="file-upload">Seleccionar Archivo (CSV):</label>
              <input 
                type="file" 
                id="file-upload" 
                accept=".csv, .txt"
                onChange={handleFileChange} 
                className="file-input"
                style={{ width: '100%', height: '40px', padding: '6px' }}
              />
            </div>

            <div style={{ flex: '0 1 auto' }}>
              <button 
                type="submit" 
                disabled={loading || !selectedFile || !entidad}
                style={{ height: '40px', padding: '0 30px', margin: '0' }}
              >
                {loading ? 'Subiendo...' : 'Procesar'}
              </button>
            </div>
          </div>
        </form>

        {statusMessage && <div className="loading-message" style={{ color: '#007bff', marginTop: '15px' }}>{statusMessage}</div>}
        {error && <div className="error-message" style={{ marginTop: '15px' }}>{error}</div>}
        {successMessage && <div className="success-message" style={{ marginTop: '15px' }}>{successMessage}</div>}
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(dataToProcess)}
          onEncrypted={handleEncryptedData}
          onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); setStatusMessage(''); }}
        />
      )}
    </div>
  );
};