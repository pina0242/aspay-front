import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizar estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regnivtran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [servicio, setServicio] = useState('');
  const [nivel, setNivel] = useState('');
  const [indauth, setIndauth] = useState('');
  const [indcost, setIndcost] = useState('');
  const [indmon, setIndmon] = useState('');
  const [indexc, setIndexc] = useState('');
  const [impmax, setImpmax] = useState('');

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
      Servicio: servicio,
      nivel: nivel,
      indauth: indauth,
      indcost: indcost,
      indmon: indmon,
      indexc: indexc,
      impmax: impmax,
    };

    setEncrypting(true);
    setDataToProcess(payload); // Iniciar el proceso de cifrado
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regnivtran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();
      if (response.status === 201) {
        setDataToProcess(responseData);
      } else {
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar el endpoint.';
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
      if (message === 'Exito') {
        setSuccess('¡Registro exitoso!');
        setTimeout(() => {
          navigate('/listnivtran', { state: { token } });
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
            <div className="acme-co">BALQUILER</div>
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
        <h1 className="regusr-title">Registrar Nuevo Endpoint</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="servicio">Servicio (20 pos):</label>
            <input type="text" id="servicio" value={servicio} onChange={(e) => setServicio(e.target.value)} maxLength="20" required />
          </div>
          <div className="form-group">
            <label htmlFor="nivel">Nivel (1 pos, numérico):</label>
            <input type="number" id="nivel" value={nivel} onChange={(e) => setNivel(e.target.value)} min="0" max="9" required />
          </div>
          <div className="form-group">
            <label htmlFor="indauth">IndAuth (val 1,2,3,4,5):</label>
            <input type="text" id="indauth" value={indauth} onChange={(e) => setIndauth(e.target.value)} maxLength="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="indcost">IndCost (val  A,B,C,D,E):</label>
            <input type="text" id="indcost" value={indcost} onChange={(e) => setIndcost(e.target.value)} maxLength="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="indmon">IndMon (val 0,1,2,3,4):</label>
            <input type="text" id="indmon" value={indmon} onChange={(e) => setIndmon(e.target.value)} maxLength="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="indexc">Indexc (val N,R,E,T):</label>
            <input type="text" id="indexc" value={indexc} onChange={(e) => setIndexc(e.target.value)} maxLength="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="impmax">ImpMax (5 pos, numérico):</label>
            <input type="number" id="impmax" value={impmax} onChange={(e) => setImpmax(e.target.value)} min="0" max="99999" required />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Endpoint'}
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