import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const ENDPOINT_DEL_SCHED = '/delsched'; // Endpoint para eliminación de procesos

export const DelSched = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos token y el proceso a eliminar desde el estado de navegación
    const { token, procesoToDelete } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [decrypting, setDecrypting] = useState(false);
    const [dataToEncrypt, setDataToEncrypt] = useState(null); 
    const [dataToDecrypt, setDataToDecrypt] = useState(null); 
    const [showConfirm, setShowConfirm] = useState(true);

    useEffect(() => {
        if (!token || !procesoToDelete) {
            setError("Error: Token o datos del proceso no encontrados.");
        }
    }, [token, procesoToDelete]);

    const handleCancel = useCallback(() => {
        navigate('/ListSchEnt', { state: { token } }); 
    }, [navigate, token]);

    if (!token || !procesoToDelete) {
        return (
            <div className="main-container">
                <div className="error-message"> {error || "Datos insuficientes"} </div>
                <button className="add-btn" style={{marginTop: '20px'}} onClick={() => navigate('/ListSchEnt')}>Regresar</button>
            </div>
        );
    }

    // --- Paso 1: Preparar Encriptación ---
    const handleDelete = useCallback(() => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowConfirm(false);

        // Payload requerido por el backend
        const payload = { 
            entidad: procesoToDelete.entidad,
            nombre_proceso: procesoToDelete.nombre_proceso,
            task_path: procesoToDelete.task_path
        };

        setEncrypting(true);
        setDataToEncrypt(payload);
    }, [procesoToDelete]);

    // --- Paso 2: Envío al API ---
    const handleEncryptedData = useCallback(async (encryptedBody) => {
        setEncrypting(false);
        setDataToEncrypt(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${ENDPOINT_DEL_SCHED}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();

            if (response.status === 201 || response.status === 200) {
                // Éxito: Se requiere desencriptar
                setDecrypting(true);
                setDataToDecrypt(responseData);
            } else {
                // Error: Recuperar respuesta directa del JSON (formato array o msg)
                const errorMsg = Array.isArray(responseData) 
                    ? responseData[0]?.response 
                    : (responseData.response || responseData.msg || 'Error al eliminar.');
                setError(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            setError('Error en la comunicación con el servidor.');
            setLoading(false);
        }
    }, [token]);

    // --- Paso 3: Desencriptar Respuesta ---
    const handleDecryptedResponse = useCallback((data) => {
        setDecrypting(false);
        setDataToDecrypt(null);

        try {
            const parsedData = JSON.parse(data);
            const message = parsedData.response || (Array.isArray(parsedData) ? parsedData[0]?.response : null);

            // Verificamos el mensaje de éxito específico
            if (message && message.includes("Exito")) {
                setSuccess(message);
                setTimeout(() => {
                    navigate('/ListSchEnt', { state: { token } });
                }, 2500);
            } else {
                setError(`Respuesta inesperada: ${message}`);
            }
        } catch (err) {
            setError("Error al procesar la respuesta descifrada.");
        }
        setLoading(false); 
    }, [navigate, token]);

    return (
        <div className="main-container">
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px', padding: '30px' }}>
                        <h3 style={{ color: '#2c3e50' }}>Confirmar Eliminación</h3>
                        <div style={{ textAlign: 'left', margin: '20px 0', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <p><b>Entidad:</b> {procesoToDelete.entidad}</p>
                            <p><b>Proceso:</b> {procesoToDelete.nombre_proceso}</p>
                            <p><b>Path:</b> {procesoToDelete.task_path}</p>
                        </div>
                        <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>¿Está seguro de eliminar esta configuración?</p>
                        <div className="modal-buttons" style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={handleDelete} disabled={loading} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                {loading ? 'Procesando...' : 'Sí, Eliminar'}
                            </button>
                            <button onClick={handleCancel} disabled={loading} style={{ backgroundColor: '#9e9e9e', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showConfirm && (
                <div className="listusr-content-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                    {(loading || decrypting || encrypting) && !error && !success && (
                        <div className="info-message">
                           <div className="loader"></div> 
                           Solicitando eliminación al servidor...
                        </div>
                    )}
                    {error && (
                        <div className="error-message" style={{ padding: '20px', borderRadius: '10px' }}>
                            <strong>Error:</strong> {error}
                            <br />
                            <button className="add-btn" style={{marginTop: '20px', background: '#34495e'}} onClick={handleCancel}>Volver a la lista</button>
                        </div>
                    )}
                    {success && (
                        <div className="success-message" style={{ padding: '20px', borderRadius: '10px' }}>
                            <strong>¡Operación Exitosa!</strong> 
                            <p>{success}</p>
                            <small>Redirigiendo...</small>
                        </div>
                    )}
                </div>
            )}

            {/* Componentes de Seguridad */}
            {encrypting && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(dataToEncrypt)}
                    onEncrypted={handleEncryptedData}
                    onError={(m) => { setError(m); setLoading(false); setEncrypting(false); }}
                />
            )}

            {decrypting && (
                <Decryptor
                    encryptedMessage={dataToDecrypt}
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(m) => { setError(m); setLoading(false); setDecrypting(false); }}
                />
            )}
        </div>
    );
};