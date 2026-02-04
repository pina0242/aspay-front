import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

/**
 * Componente para el registro de un nuevo Layout (RegLayout).
 */
export const RegLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');

    // Estados para los campos del Layout
    const [entidad, setEntidad] = useState('');
    const [llave, setLlave] = useState('MASIHEAD');
    const [clave, setClave] = useState('');
    const [datos_in, setDatosIn] = useState('');

    // Estados de proceso
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [payloadToEncrypt, setPayloadToEncrypt] = useState(null);
    const [responseToDecrypt, setResponseToDecrypt] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Token de autenticación no encontrado. Redirigiendo a Login.");
            setTimeout(() => navigate('/login'), 1500);
        }
    }, [token, navigate]);

    /**
     * Envía los datos encriptados al API /reglayout
     */
    const handleEncryptedData = async (encryptedBodyData) => {
        setLoading(true);
        setError('');
        setSuccess('');
            
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/reglayout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBodyData)
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.status >= 200 && response.status < 300) {
                // Éxito: Se procede a desencriptar la respuesta
                setResponseToDecrypt(responseData);
            } else {
                // Error: Se recupera el mensaje directo sin desencriptar (ej. [{'response': '...'}] )
                let errorMessage = `Error [Status ${response.status}]`;
                
                if (response.status === 401) {
                    errorMessage = "Sesión expirada. Por favor, ingrese de nuevo.";
                    setTimeout(() => navigate('/login'), 3000);
                } else {
                    // Manejo específico para el formato de error del backend: [{'response': '...'}]
                    errorMessage = responseData?.[0]?.response || responseData.msg || "Error desconocido.";
                }
                
                setError(errorMessage);
                setLoading(false);
            }
        } catch (err) {
            setError('Error en la comunicación con el servidor.');
            setLoading(false);
        }
    };

    /**
     * Procesa la respuesta desencriptada {"response": "Exito"}
     */
    const handleDecryptedResponse = useCallback((decryptedData) => {
        setLoading(false);
        setResponseToDecrypt(null);

        try {
            const parsedData = JSON.parse(decryptedData);
            const message = parsedData.response || parsedData[0]?.response; 

            if (message === 'Exito' || (typeof message === 'string' && message.includes('exitoso'))) {
                setSuccess('¡Registro de Layout exitoso!');
                
                // Limpiar formulario
                setEntidad('');
                setLlave('');
                setClave('');
                setDatosIn('');

                setTimeout(() => {
                    navigate('/ListLayout', { state: { token } }); 
                }, 2000); 
                
            } else {
                setError(message || "Respuesta de registro inesperada.");
            }
        } catch (err) {
            setError("Error al procesar la respuesta del servidor.");
        }
    }, [navigate, token]); 

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!entidad || !llave || !clave || !datos_in) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        const payload = { entidad, llave, clave, datos_in };
        setPayloadToEncrypt(payload);
    };

    const isProcessing = loading || !!responseToDecrypt || !!payloadToEncrypt; 

    return (
        <div className="main-container">
            {/* Header / Nav */}
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0">
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
                <h1 className="listusr-title">Nuevo Registro de Layout</h1>

                <form className="regusr-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Entidad:</label>
                        <input
                            type="text"
                            value={entidad}
                            onChange={(e) => setEntidad(e.target.value)}
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Llave (Header):</label>
                        <input
                            type="text"
                            value={llave}
                            onChange={(e) => setLlave(e.target.value)}
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Clave (Nombre Archivo):</label>
                        <input
                            type="text"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Datos (Campo Entrada):</label>
                        <input
                            type="text"
                            value={datos_in}
                            onChange={(e) => setDatosIn(e.target.value)}
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                    {isProcessing && <div className="loading-message">Procesando...</div>}

                    <div className="form-buttons">
                        <button type="submit" disabled={isProcessing}>
                            {isProcessing ? 'Registrando...' : 'Registrar Layout'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Componentes de Seguridad */}
            {payloadToEncrypt && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(payloadToEncrypt)}
                    onEncrypted={(data) => {
                        setPayloadToEncrypt(null); 
                        handleEncryptedData(data); 
                    }}
                    onError={(msg) => {
                        setError(`Error de cifrado: ${msg}`);
                        setPayloadToEncrypt(null);
                    }}
                />
            )}

            {responseToDecrypt && (
                <Decryptor
                    encryptedMessage={responseToDecrypt}
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(err) => {
                        setError(`Error de descifrado: ${err}`);
                        setResponseToDecrypt(null);
                    }}
                />
            )}
        </div>
    );
};