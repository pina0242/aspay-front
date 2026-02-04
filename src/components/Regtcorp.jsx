import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regtcorp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [llave, setLlave] = useState('');
  const [clave, setClave] = useState('');
  const [datos, setDatos] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      llave: llave,
      clave: clave,
      datos: datos,
      usuario_alta: 'USUARIO01',
      usuario_mod: 'USUARIO01',
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
   
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regtcorp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: encryptedBody
      });

      const responseData = await response.json();
      if (response.status === 201) {
        setDataToProcess(responseData);
      } else {
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar llave corporativa.';
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = parsedData[0]?.response;
      if (message) {
        setSuccess(message);
        // Redirigir a Seltcorp después de 2 segundos en caso de éxito
        setTimeout(() => {
          navigate('/seltcorp', { state: { token } });
        }, 2000);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
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
          </div>
        </div>
      </div>
      
      <div className="regusr-content-container">
        <h1 className="regusr-title">Alta de Llave corporativa</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="llave">Llave (8 pos):</label>
            <input type="text" id="llave" value={llave} onChange={(e) => setLlave(e.target.value)} maxLength="8" required />
          </div>
          <div className="form-group">
            <label htmlFor="clave">Clave (15 pos):</label>
            <input type="text" id="clave" value={clave} onChange={(e) => setClave(e.target.value)} maxLength="15" required />
          </div>
          <div className="form-group">
            <label htmlFor="datos">Datos (150 pos):</label>
            <input type="text" id="datos" value={datos} onChange={(e) => setDatos(e.target.value)} maxLength="150" required />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Corporación'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {encrypting && (
          <Encryptor
            password={encryptionPassword}
            message={JSON.stringify(dataToProcess)}
            onEncrypted={handleEncryptedData}
            onError={(errorMsg) => {
              setError(errorMsg);
              setEncrypting(false);
              setLoading(false);
            }}
          />
        )}

        {dataToProcess && !encrypting && typeof dataToProcess === 'string' && (
          <Decryptor
            encryptedMessage={dataToProcess}
            password={encryptionPassword}
            onDecrypted={handleDecryptedResponse}
            onError={(err) => {
              setError(err);
              setLoading(false);
              setDataToProcess(null);
            }}
          />
        )}
      </div>
    </div>
  );
};