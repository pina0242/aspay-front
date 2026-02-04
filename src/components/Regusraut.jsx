import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos estilos de registro

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regusraut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [servicio, setServicio] = useState('');
  const [emailauth, setEmailauth] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // JSON según requerimiento
    const payload = {
      Servicio: servicio,
      emailauth: emailauth
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regusraut`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('Su sesión ha caducado!!!');
        setLoading(false);
        return;
      }

      if (response.status !== 201) {
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar la autorización.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Si es 201, decriptamos la respuesta de éxito
      setDataToProcess(responseData);
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = parsedData[0]?.response || "Registro exitoso";
      setSuccess(message);
      // Limpiar formulario tras éxito
      setServicio('');
      setEmailauth('');
    } catch (err) {
      setSuccess("Registro procesado exitosamente.");
    }
    setLoading(false);
    setDataToProcess(null);
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

      <div className="regusr-content-container">
        <h1 className="regusr-title">Registro de Autorización Usuario/Servicio</h1>
        
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="servicio">Servicio:</label>
            <input 
              type="text" 
              id="servicio" 
              placeholder="/Listusrauts"
              value={servicio} 
              onChange={(e) => setServicio(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="emailauth">Email Auth / ID:</label>
            <input 
              type="text" 
              id="emailauth" 
              placeholder="1234567890"
              value={emailauth} 
              onChange={(e) => setEmailauth(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Procesando...' : 'Registrar Autorización'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(dataToProcess)}
          onEncrypted={handleEncryptedData}
          onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); }}
        />
      )}

      {dataToProcess && !encrypting && typeof dataToProcess === 'string' && (
        <Decryptor
          encryptedMessage={dataToProcess}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => { setError(err); setLoading(false); setDataToProcess(null); }}
        />
      )}
    </div>
  );
};