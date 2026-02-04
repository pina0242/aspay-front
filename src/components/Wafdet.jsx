import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Wafdet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, ip } = location.state || {};

  const [wafDetail, setWafDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!token || !ip) {
      setError("Error: Token o dirección IP no encontrados.");
      setLoading(false);
      return;
    }

    const payload = { ip: ip };
    setEncrypting(true);
    setDataToProcess(payload);

  }, [token, ip]);

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    let endpoint = dataToProcess.hasOwnProperty('status') ? '/wafact' : '/wafdet';

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: encryptedBody
      });

      const responseData = await response.json();

      if (response.status === 201) {
        setDecryptingResponse(responseData);
      } else {
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error en la operación.';
        setError(errorData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Determinar si la respuesta es de wafdet o wafact
        if (parsedData[0].hasOwnProperty('response') && parsedData[0].hasOwnProperty('registros_actualizados')) {
          setActionMessage(`Éxito: ${parsedData[0].response}. Registros actualizados: ${parsedData[0].registros_actualizados}`);
          // Opcional: Volver a cargar el detalle para reflejar el cambio
          const payload = { ip: ip };
          setEncrypting(true);
          setDataToProcess(payload);
        } else {
          setWafDetail(parsedData[0]);
        }
      } else {
        setError('Respuesta inesperada del servidor o datos no encontrados.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleConfirmStatus = () => {
    if (selectedStatus && ip) {
      const payload = { ip: ip, status: selectedStatus };
      setEncrypting(true);
      setDataToProcess(payload);
      setShowStatusMenu(false);
      setSelectedStatus('');
      setActionMessage('');
    } else {
      setError("Por favor, seleccione un estatus.");
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
        <h1 className="listusr-title">Detalle del Registro WAF</h1>
        {loading && <div className="loading-message">Cargando detalle...</div>}
        {error && <div className="error-message">{error}</div>}
        {actionMessage && <div className="success-message">{actionMessage}</div>}

        {wafDetail && (
          <div className="table-container">
            <h2 className="grid-title">Detalle para la IP: {wafDetail.Ip_Origen}</h2>
            <table className="user-table">
              <thead>
                <tr>
                  {Object.keys(wafDetail).map((key) => (
                    <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {Object.values(wafDetail).map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              </tbody>
            </table>

            <div className="status-change-section">
                <button 
                  className="status-btn" 
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  disabled={loading}
                >
                  Cambiar Estatus
                </button>
                {showStatusMenu && (
                  <div className="status-menu">
                    <select value={selectedStatus} onChange={handleStatusChange}>
                      <option value="">Seleccione un estatus</option>
                      <option value="R">Registrado</option>
                      <option value="B">Bloqueado</option>
                    </select>
                    <button 
                      className="confirm-btn" 
                      onClick={handleConfirmStatus}
                      disabled={!selectedStatus}
                    >
                      Confirmar
                    </button>
                  </div>
                )}
            </div>
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