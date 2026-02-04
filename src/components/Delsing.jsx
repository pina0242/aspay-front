import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/delusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Delsing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, ingestToDelete } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const [showConfirm, setShowConfirm] = useState(true);

  if (!token || !ingestToDelete) {
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
        <div className="delusr-content-container">
          <div className="error-message">
            Error: Token o datos de la transacción no encontrados.
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowConfirm(false);

    const payload = {
      ingest_id: ingestToDelete.id,
      entidad: ingestToDelete.entidad,
      filename: ingestToDelete.filename,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/delsing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });
      
      if (response.status === 201) {
        const responseData = await response.json();
        setDecryptingResponse(responseData);
      } else if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.msg === "Token has expired") {
          setError("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
          setTimeout(() => {
            navigate('/login');
          }, 3000); 
        } else {
          const errorMessage = errorData?.[0]?.response || 'Error de autenticación.';
          setError(errorMessage);
        }
        setLoading(false);
      } else {
        const responseData = await response.json();
        const errorData = responseData?.[0]?.response || 'Error al eliminar la transacción.';
        setError(errorData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error en la llamada al API:', err);
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      
      const responseData = parsedData[0];
      const message = responseData?.response;

      if (message && message.toLowerCase() === 'exito') {
        const filename = responseData?.archivo;
        const deletedLogs = responseData?.deleted?.logs;
        setSuccess(`¡Éxito al eliminar el archivo: **${filename}**! Se eliminaron: **${deletedLogs}** registros.`);
      } else {
        setError(message || 'Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.log("Response that failed to parse:", data);
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    } finally {
      setLoading(false);
      setDecryptingResponse(null);
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

      <div className="delusr-content-container">
        {showConfirm ? (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Confirmar Eliminación</h3>
              <p>
                ¿Está seguro de que desea eliminar la transacción **{ingestToDelete.filename}**
                con ID **{ingestToDelete.id}**?
              </p>
              <div className="modal-buttons">
                <button onClick={handleDelete} disabled={loading}>
                  {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                </button>
                <button onClick={() => navigate(-1)} disabled={loading}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {loading && <div className="loading-message">Procesando...</div>}
            {error && <div className="error-message">{error}</div>}
            {success && (
              <div className="success-message" dangerouslySetInnerHTML={{ __html: success }}></div>
            )}
            {(error || success) && (
              <div className="modal-buttons">
                <button onClick={() => navigate(-1)} disabled={loading}>
                  Volver a la Lista
                </button>
              </div>
            )}
          </>
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

      {decryptingResponse && !encrypting && (
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