import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Decryptor from './Decryptor';
import '../styles/style.css'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const translations = {
  es: {
    processing: 'Procesando inicio de sesión...',
    success: 'Inicio de sesión exitoso. Redirigiendo...',
    error: 'Error al procesar la respuesta del servidor.',
  },
};

export const AuthHandler = () => {
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const encryptedDataFromUrl = new URLSearchParams(window.location.search).get('data');
    if (encryptedDataFromUrl) {
      try {
        // Parsear la cadena JSON a un objeto JavaScript
        const parsedData = JSON.parse(encryptedDataFromUrl);
        setDecryptingResponse(parsedData);
      } catch (e) {
        console.error("Error al parsear el JSON de la URL:", e);
        setError("Error al procesar los datos de inicio de sesión.");
      }
    } else {
      setError(translations.es.error);
    }
  }, []);

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData && parsedData[0]?.response) {
        setSuccess(translations.es.success);
        const token = parsedData[0].response;

        navigate('/Principal', { state: { token: token } });
      } else {
        setError(translations.es.error);
      }
    } catch (err) {
      console.error('Error al procesar la respuesta descifrada:', err);
      setError('Respuesta inesperada del servidor.');
    }
  };

  return (
    <div className="stitch-design">
      <div className="stitch-design2">
        <div className="depth-0-frame-0">
          <div className="depth-1-frame-0">
            <div className="depth-2-frame-1">
              <div className="depth-3-frame-02">
                <div className="depth-4-frame-14">
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                  {!error && !success && (
                    <div className="processing-message">{translations.es.processing}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {decryptingResponse && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => {
            setError(err);
            setDecryptingResponse(null);
          }}
        />
      )}
    </div>
  );
};