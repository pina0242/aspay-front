import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos los mismos estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Updusraut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {}; 

  // Estados individuales para mantener la simetría con Regusraut
  const [id, setId] = useState('');
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
    if (userToEdit) {
      setId(userToEdit.id || '');
      setServicio(userToEdit.Servicio || '');
      setEmailauth(userToEdit.emailauth || '');
    }
  }, [token, userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Payload para actualización (incluye ID oculto)
    const payload = {
      id: id,
      Servicio: servicio,
      emailauth: emailauth
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updusrauts`, {
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

      if (response.status === 201) {
        // Éxito: Procesar respuesta encriptada
        setDataToProcess(responseData); 
      } else {
        const errorMsg = responseData && responseData[0]?.response 
            ? responseData[0].response 
            : 'Error al actualizar la autorización.';
        setError(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = parsedData.response || (Array.isArray(parsedData) && parsedData[0]?.response) || "Actualización exitosa";
      
      setSuccess(message);
      setTimeout(() => {
        navigate('/Listusrauts', { state: { token } });
      }, 2000);
    } catch (err) {
      setSuccess("Actualización procesada exitosamente.");
      setTimeout(() => {
        navigate('/Listusrauts', { state: { token } });
      }, 2000);
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
        <h1 className="regusr-title">Editar Autorización Usuario/Servicio</h1>
        
        <form className="regusr-form" onSubmit={handleSubmit}>
          {/* Campo Servicio igual al registro */}
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

          {/* Campo Email Auth igual al registro */}
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
            {loading ? 'Procesando...' : 'Guardar Cambios'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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
    </div>
  );
};