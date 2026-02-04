import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/style.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const translations = {
  es: {
    title: 'Registro de Usuario OTP',
    email: 'Correo Electrónico',
    submit: 'Registrarse',
    submitting: 'Registrando...',
    qrCodeTitle: 'Código QR Generado:',
    errorGeneral: 'Error en el registro',
    success: 'Registro exitoso. Escanea el código QR.',
    invalidEmail: 'Email inválido',
    missingFields: 'El campo email es obligatorio'
  },
};

export const Registotp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [formData, setFormData] = useState({
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [encryptedResponse, setEncryptedResponse] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  useEffect(() => {
    if (encryptedResponse) {
      setDecrypting(true);
    }
  }, [encryptedResponse]);

  const handleEncryptedData = async (encryptedBody) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/registotp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });
      
      console.log("Respuesta completa del servidor:", response);
      console.log("Código de estado (status):", response.status);

      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (response.status !== 201) {
        console.error("Error del servidor. Código de estado:", response.status);
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error en el registro';
        console.error("Mensaje de error del servidor:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      const responseData = await response.json();
      setEncryptedResponse(responseData);

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validación básica de email
    if (!formData.email || !formData.email.includes('@')) {
      setError(translations.es.invalidEmail);
      setLoading(false);
      return;
    }

    setEncrypting(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="main-container">
      {/* Header idéntico al componente Principal */}
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

      {/* Contenido del formulario */}
      <div className="stitch-design">
        <div className="stitch-design2">
          <div className="depth-0-frame-0">
            <div className="depth-1-frame-0">
              <div className="depth-2-frame-1">
                <div className="depth-3-frame-02">
                  <div className="depth-4-frame-03">
                    <div className="start-your-free-trial">{translations.es.title}</div>
                  </div>
                  <form onSubmit={handleSubmit}>
                    {/* Solo Correo Electrónico */}
                    <div className="depth-4-frame-2">
                      <div className="depth-5-frame-04">
                        <div className="depth-6-frame-02">
                          <div className="email">{translations.es.email}</div>
                        </div>
                        <div className="depth-6-frame-1">
                          <input
                            type="email"
                            name="email"
                            className="liam-harper-example-com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="liam.harper@example.com"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón de Registro */}
                    <div className="depth-4-frame-6">
                      <div className="depth-5-frame-06">
                        <button type="submit" className="depth-6-frame-04" disabled={loading}>
                          <div className="start-free-trial">
                            {loading ? translations.es.submitting : translations.es.submit}
                          </div>
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  {/* Mensajes de estado */}
                  {error && <div className="error-message">{error}</div>}
                  {success && <div className="success-message">{success}</div>}
                  
                  {/* Visualización del QR */}
                  {qrCodeUrl && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <h3>{translations.es.qrCodeTitle}</h3>
                      <img src={qrCodeUrl} alt="Código QR" style={{ maxWidth: '300px', border: '1px solid #ddd' }} />
                    </div>
                  )}
                  
                  {/* Componentes de encriptación y desencriptación */}
                  {encrypting && (
                    <Encryptor
                      password={encryptionPassword}
                      message={JSON.stringify({
                        email: formData.email
                      })}
                      onEncrypted={(result) => {
                        setEncrypting(false);
                        handleEncryptedData(result);
                      }}
                      onError={(errorMsg) => {
                        setError(errorMsg);
                        setEncrypting(false);
                        setLoading(false);
                      }}
                    />
                  )}
                  {decrypting && encryptedResponse && (
                    <Decryptor
                      encryptedMessage={encryptedResponse}
                      password={encryptionPassword}
                      onDecrypted={(data) => {
                        try {
                          const parsedData = JSON.parse(data);
                          console.log("Datos parseados:", parsedData);
                          const base64Content = parsedData[0]?.response;
                          if (base64Content) {
                            const qrCodeDataUrl = `data:image/png;base64,${base64Content}`;
                            setQrCodeUrl(qrCodeDataUrl);
                            console.log("URL del QR Code creada:", qrCodeDataUrl);
                            setSuccess(translations.es.success);
                          } else {
                            console.error("No se encontró el contenido Base64 en la respuesta.");
                            setError("Respuesta inesperada del servidor.");
                          }
                        } catch (error) {
                          console.error("Error al procesar la respuesta descifrada:", error);
                          setError("Error al procesar la respuesta.");
                        }
                        setDecrypting(false);
                        setLoading(false);
                      }}
                      onError={(err) => { 
                        setError(err); 
                        setDecrypting(false); 
                        setLoading(false); 
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};