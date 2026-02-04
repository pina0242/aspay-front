import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';
import { FaInfoCircle, FaPlayCircle, FaStopCircle } from 'react-icons/fa';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listwaf = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');
  const [wafList, setWafList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }

    // Limpieza del temporizador al desmontar el componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token]);

  const executeFetch = () => {
    if (loading) return;
    setLoading(true);
    setError('');
    
    const payload = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeFetch();
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listwaf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (response.status === 201) {
        setDecryptingResponse(responseData);
      } else {
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al obtener la lista WAF.';
        setError(errorData);
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
      if (Array.isArray(parsedData)) {
        setWafList(parsedData);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  const handleDetailClick = (waf) => {
    navigate('/wafdet', { state: { token, ip: waf.Ip_Origen } });
  };

  const startMonitoring = () => {
    if (isMonitoring) return;
    setIsMonitoring(true);
    executeFetch(); // Ejecuta la primera consulta inmediatamente
    intervalRef.current = setInterval(executeFetch, 5000); // Repite cada 5 segundos
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsMonitoring(false);
      setLoading(false); // Detiene el indicador de carga
    }
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
        <h1 className="listusr-title">Lista de WAF</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fechaInicio">Fecha de Inicio:</label>
            <input 
              type="text" 
              id="fechaInicio" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              placeholder="YYYY-MM-DD"
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="fechaFin">Fecha de Fin:</label>
            <input 
              type="text" 
              id="fechaFin" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              placeholder="YYYY-MM-DD"
              required 
            />
          </div>
          <button type="submit" disabled={loading}>
            Consultar Registros WAF
          </button>
        </form>
        
        <div className="monitoring-controls">
          <button onClick={startMonitoring} disabled={isMonitoring || loading}>
            <FaPlayCircle /> Iniciar Monitorización
          </button>
          <button onClick={stopMonitoring} disabled={!isMonitoring}>
            <FaStopCircle /> Detener
          </button>
        </div>
        
        {isMonitoring && <div className="monitoring-status">Monitorización activa (actualizando cada 5 segundos)...</div>}
        {loading && <div className="loading-message">Cargando...</div>}
        {error && <div className="error-message">{error}</div>}

        {wafList.length > 0 && (
          <div className="table-container">
            <h2 className="grid-title">Registros WAF</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>IP de Origen</th>
                  <th>Estatus</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {wafList.map((waf, index) => (
                  <tr key={index}>
                    <td>{waf.Ip_Origen}</td>
                    <td>{waf.status}</td>
                    <td className="actions-cell">
                      <button className="detail-btn" onClick={() => handleDetailClick(waf)}>
                        <FaInfoCircle />
                      </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          }}
        />
      )}

      {decryptingResponse && !encrypting && typeof decryptingResponse === 'string' && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => {
            setError(err);
            setLoading(false);
            setDecryptingResponse(null);
          }}
        />
      )}
    </div>
  );
};