import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/delusr.css'; // Reutilizamos estilos para el contenedor

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Delcta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // userToEdit, en este caso, contiene los datos del ítem a eliminar
  const { token, userToEdit } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(true);

  if (!token || !userToEdit) {
    return (
      <div className="main-container">
        <div className="error-message">
          Error: Persona no encontrada.
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
      id: userToEdit.id,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/delcta`, {
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
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al eliminar la cuenta';
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
      const message = parsedData[0]?.response;
      if (message) {
        setSuccess(message);
        setTimeout(() => {
          navigate('/listcta', { state: { token } });
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
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmar Eliminación</h3>
            <p>
              ¿Está seguro de que desea eliminar la cuenta **{userToEdit.alias}** con ID **{userToEdit.id}**?
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
      )}

      {!showConfirm && (
        <div className="regusr-content-container">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </div>
      )}

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
  );
};