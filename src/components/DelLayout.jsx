import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const ENDPOINT_DEL_LAYOUT = '/dellayout'; 

export const DelLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos 'token' y el objeto 'layout' (que contiene el id)
    const { token, layout } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [decrypting, setDecrypting] = useState(false);
    const [dataToEncrypt, setDataToEncrypt] = useState(null); 
    const [dataToDecrypt, setDataToDecrypt] = useState(null); 
    const [showConfirm, setShowConfirm] = useState(true);

    const handleCancel = useCallback(() => {
        navigate('/ListLayout', { state: { token } }); 
    }, [navigate, token]);

    if (!token || !layout) {
        return (
            <div className="main-container">
                <div className="error-message">
                    Error: Token o datos del Layout no encontrados.
                </div>
                <button onClick={() => navigate('/ListLayout')}>Regresar</button>
            </div>
        );
    }

    // --- Paso 1: Preparar Encriptación ---
    const handleDelete = useCallback(() => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowConfirm(false);

        // Payload: {"id": 20}
        const payload = { 
            id: layout.id,
            entidad: layout.entidad
         };

        setEncrypting(true);
        setDataToEncrypt(payload);
    }, [layout]);

    // --- Paso 2: Envío al API ---
    const handleEncryptedData = useCallback(async (encryptedBody) => {
        setEncrypting(false);
        setDataToEncrypt(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${ENDPOINT_DEL_LAYOUT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();

            if (response.status === 201 || response.status === 200) {
                // Éxito: Desencriptar
                setDecrypting(true);
                setDataToDecrypt(responseData);
            } else {
                // Error: Recuperar respuesta directa del JSON sin desencriptar
                const errorMsg = responseData[0]?.response || responseData.msg || 'Error al eliminar.';
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

            if (message === "Exito") {
                setSuccess(`Layout ID: ${layout.id} eliminado correctamente.`);
                setTimeout(() => {
                    navigate('/ListLayout', { state: { token } });
                }, 2000);
            } else {
                setError(`Respuesta inesperada: ${message}`);
            }
        } catch (err) {
            setError("Error al procesar la respuesta del servidor.");
        }
        setLoading(false); 
    }, [layout.id, navigate, token]);

    return (
        <div className="main-container">
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Confirmar Eliminación</h3>
                        <p>¿Está seguro de eliminar el Layout con <b>ID: {layout.id}</b>?</p>
                        <div className="modal-buttons">
                            <button onClick={handleDelete} disabled={loading} style={{ backgroundColor: '#9e9e9e' }}>
                                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                            <button onClick={handleCancel} disabled={loading} style={{ backgroundColor: '#9e9e9e' }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showConfirm && (
                <div className="listusr-content-container" style={{ textAlign: 'center', marginTop: '50px' }}>
                    {(loading || decrypting || encrypting) && !error && !success && (
                        <div className="info-message">Procesando solicitud...</div>
                    )}
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}
                </div>
            )}

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