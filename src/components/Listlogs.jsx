import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; // Reutilizamos estilos existentes

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listlogs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [fechaInicio, setFechaInicio] = useState('0001-01-01');
  const [fechaFin, setFechaFin] = useState('9999-12-31');
  const [logList, setLogList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLogList([]);

    const payload = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listlogs`, {
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
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al obtener la lista de logs.';
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
        setLogList(parsedData);
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
        <h1 className="listusr-title">Lista de Logs</h1>
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
            {loading ? 'Cargando...' : 'Consultar Logs'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {logList.length > 0 && (
          <div className="table-container">
            <h2 className="grid-title">Registros de Logs</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Nivel</th>
                  <th>Resp. Code</th>
                  <th>Nombre</th>
                  <th>IP Origen</th>
                  <th>Servicio</th>
                  <th>Método</th>
                  <th className="scrollable-cell-header">Datos Entrada</th>
                  <th className="scrollable-cell-header">Datos Salida</th>
                </tr>
              </thead>
              <tbody>
                {logList.map((log, index) => (
                  <tr key={index}>
                    <td>{log.timestar}</td>
                    <td>{log.timeend}</td>
                    <td>{log.log_level}</td>
                    <td>{log['respcod:']}</td>
                    <td>{log.nombre}</td>
                    <td>{log.Ip_Origen}</td>
                    <td>{log.Servicio}</td>
                    <td>{log.Metodo}</td>
                    <td className="scrollable-cell">{log.DatosIn}</td>
                    <td className="scrollable-cell">{log.DatosOut}</td>
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