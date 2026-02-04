import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/delusr.css'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Delusraut = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // userToEdit contiene los datos del usuario autorizador seleccionado en la tabla
  const { token, userToEdit } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(true);

  // Validación de seguridad inicial
  if (!token || !userToEdit) {
    return (
      <div className="main-container">
        <div className="error-message">
          Error: Información de usuario no válida para eliminación.
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setShowConfirm(false);

    // Payload requerido: {"id": 2}
    const payload = {
      id: userToEdit.id,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/delusrauts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 201) {
        // Respuesta exitosa: Guardamos el mensaje encriptado para el Decryptor
        setDataToProcess(responseData);
      } else {
        // Error (400 u otros): Recuperar el response del JSON sin decriptar
        const errorMessage = responseData && responseData[0]?.response 
          ? responseData[0].response 
          : 'Error al intentar eliminar el registro.';
        setError(errorMessage);
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
      // Esperamos obtener: {"response": "Exito"}
      const message = parsedData.response || (Array.isArray(parsedData) && parsedData[0]?.response);
      
      if (message) {
        setSuccess(message);
        setTimeout(() => {
          // Regresa a la lista después de mostrar el éxito
          navigate('/Listusrauts', { state: { token } });
        }, 2000);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Error al procesar la respuesta del servidor.");
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
              ¿Está seguro de que desea eliminar al usuario autorizador con ID: <strong>{userToEdit.id}</strong>?
            </p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Servicio: {userToEdit.Servicio} <br />
              Email Auth: {userToEdit.emailauth}
            </p>
            <div className="modal-buttons">
              <button onClick={handleDelete} disabled={loading} className="confirm-btn">
                {loading ? 'Procesando...' : 'Sí, Eliminar'}
              </button>
              <button onClick={() => navigate(-1)} disabled={loading} className="cancel-btn">
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

      {/* Proceso de Encriptación de Salida */}
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

      {/* Proceso de Desencriptación de Entrada (Solo para status 201) */}
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