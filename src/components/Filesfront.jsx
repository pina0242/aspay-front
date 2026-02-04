import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Files = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

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
    if (!selectedFile) {
      setError("Por favor, seleccione un archivo.");
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setStatusMessage('Procesando archivo...');

    try {
      const fileContent = await selectedFile.text();
      const payload = {
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
    setStatusMessage('Subiendo archivo al servidor...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });
      
      const responseData = await response.json();

      if (response.status === 201) {
        // La respuesta 201 no está encriptada, se procesa directamente
        const successData = responseData[0]?.response ? responseData[0].response : 'Archivo subido exitosamente.';
        setSuccessMessage(successData);
        setLoading(false);
        setStatusMessage('');
      } else {
        // Para errores, la respuesta ya es un JSON plano
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al subir el archivo.';
        setError(errorData);
        setLoading(false);
        setStatusMessage('');
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
      setStatusMessage('');
    }
  };

  // La función handleDecryptedResponse ya no es necesaria para el éxito, pero se mantiene para otros casos de uso si aplica
  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData[0]?.response) {
        setSuccessMessage(parsedData[0].response);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setStatusMessage(''); // Finalizar el mensaje de estado
  };

  return (
    <div className="main-container">
      <div className="depth-2-frame-0">
        <div className="depth-3-frame-0">
          <div className="depth-4-frame-0"></div>
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
        <h1 className="listusr-title">Subir Archivos</h1>
        <form className="listusr-form" onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="file-upload">Seleccionar Archivo:</label>
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileChange} 
              className="file-input"
            />
          </div>
          {selectedFile && <p className="file-info">Archivo seleccionado: **{selectedFile.name}**</p>}
          <button type="submit" disabled={loading || !selectedFile}>
            {loading ? 'Procesando...' : 'Subir Archivo'}
          </button>
        </form>
        {statusMessage && <div className="loading-message">{statusMessage}</div>}
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(dataToProcess)}
          onEncrypted={handleEncryptedData}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
            setLoading(false);
            setStatusMessage('');
          }}
        />
      )}
      {/* El componente Decryptor ya no se usa para respuestas 201, pero se mantiene si lo necesitas para otros endpoints */}
    </div>
  );
};