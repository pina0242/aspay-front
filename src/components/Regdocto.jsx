import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regdocto = () => {
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
  
  // Nuevos estados para los campos adicionales
  const [numId, setNumId] = useState('');
  const [tipoDocto, setTipoDocto] = useState('');
  const [paisEmisDocto, setPaisEmisDocto] = useState('');
  const [fecvencim, setFecvencim] = useState('');

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

  // Validar campos antes de enviar
  const validateFields = () => {
    if (numId.length !== 10) {
      setError("El número de identificación debe tener exactamente 10 caracteres");
      return false;
    }
    if (tipoDocto.length > 15) {
      setError("El tipo de documento no puede exceder 15 caracteres");
      return false;
    }
    if (paisEmisDocto.length !== 2) {
      setError("El país emisor debe tener exactamente 2 caracteres");
      return false;
    }
    if (!selectedFile) {
      setError("Por favor, seleccione un archivo.");
      return false;
    }
    return true;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!validateFields()) {
      return;
    }

    if (!fecvencim) {
      setFecvencim("9999-12-31");

    } else {
      setFecvencim(fecvencim);
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setStatusMessage('Procesando archivo...');

    try {
      // Convertir el archivo a base64 para enviarlo
      const fileContent = await convertFileToBase64(selectedFile);

      const fechaVencFinal = fecvencim ? fecvencim : "9999-12-31";
      
      const payload = {
        num_id: numId,
        tipo_docto: tipoDocto,
        pais_emis_docto: paisEmisDocto,
        fecha_vencim:fechaVencFinal,
        image_docto: fileContent,        
        filename: selectedFile.name        
      };
      
      setEncrypting(true);
      setDataToProcess(payload);

    } catch (err) {
      setError("Error al procesar el archivo. " + err.message);
      setLoading(false);
      setStatusMessage('');
    }
  };

  // Función para convertir archivo a base64
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo data:application/octet-stream;base64, si está presente
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    setStatusMessage('Subiendo documento al servidor...');
    
    try {
      // Llamar a la nueva API /regdoc
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regdoc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      // Validación para status 401 - Sesión caducada
      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        const lowerMessage = errorMessage.toLowerCase();
        
        // Solo si contiene palabras de auth, muestra el mensaje, sino redirige
        if (AUTH_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
          setError(errorMessage);
        } else {
          window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
        }
        
        setLoading(false);
        return;
      }
      
      const responseData = await response.json();

      if (response.status === 201) {
        const successData = responseData[0]?.response ? responseData[0].response : 'Documento registrado exitosamente.';
        setSuccessMessage(successData);
        // Limpiar campos después del éxito
        setNumId('');
        setTipoDocto('');
        setPaisEmisDocto('');
        setSelectedFile(null);
        // Limpiar el input file
        document.getElementById('file-upload').value = '';
      } else {
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al registrar el documento.';
        setError(errorData);
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
    }
    setLoading(false);
    setStatusMessage('');
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
        <h1 className="listusr-title">Registrar Documento</h1>
        <form className="listusr-form" onSubmit={handleUpload}>
          {/* Nuevos campos */}
          <div className="form-group">
            <label htmlFor="num-id">ID</label>
            <input 
              type="text" 
              id="num-id" 
              value={numId}
              onChange={(e) => setNumId(e.target.value)}
              maxLength={10}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo-docto">Tipo de Documento</label>
            <select className="form-select" aria-label="Default select example"value={tipoDocto} onChange={(e) => setTipoDocto(e.target.value)}required >
              <option value="">Seleccione Tipo de Documento</option>
              <option value="DNI_ESPAÑOL">DNI_ESPAÑOL</option>
              <option value="CIF_ESPAÑOL">CIF_ESPAÑOL</option>
              <option value="NIE_EXTRANJERO">NIE_EXTRANJERO</option>
              <option value="CC_PORTUGUES">CC_PORTUGUES</option>
              <option value="NIF_PORTUGUES">NIF_PORTUGUES</option>
              <option value="PASAPORTE">PASAPORTE</option>
              <option value="ESCRIT_CONSTIT">ESCRITURA_CONSTITUCION</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pais-emis">País Emisor</label>
            <select className="form-select" aria-label="Default select example"value={paisEmisDocto} onChange={(e) => setPaisEmisDocto(e.target.value)}required >
              <option value="">Seleccione Pais Emisor</option>
              <option value="ES">ESPAÑA</option>
              <option value="PT">PORTUGAL</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fecha-vencim">Fecha Vencimiento</label>
            <input type="date" id="fecvencim" value={fecvencim} onChange={(e) => setFecvencim(e.target.value) } maxLength="10"  />
          </div>

          <div className="form-group">
            <label htmlFor="file-upload">Documento</label>
            <input 
              type="file" 
              id="file-upload" 
              onChange={handleFileChange} 
              className="file-input"
              required
            />
          </div>
          
          {selectedFile && <p className="file-info">Archivo seleccionado: {selectedFile.name}</p>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrar Documento'}
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
    </div>
  );
};