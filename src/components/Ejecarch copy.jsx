import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor'; 
import '../styles/principal.css';
import '../styles/delusr.css';
import '../styles/Ejecarch.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Ejecarch = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { token, ingestToProcess } = location.state || {}; 

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false); 
    // dataToProcess_Execute para /ejecarch, dataToEncrypt_Progress para el payload de /selproej
    const [dataToProcess_Execute, setDataToProcess_Execute] = useState(null); 
    const [dataToEncrypt_Progress, setDataToEncrypt_Progress] = useState(null); 
    const [showConfirm, setShowConfirm] = useState(true);

    const isDataMissing = useMemo(() => !token || !ingestToProcess || !ingestToProcess.id || !ingestToProcess.filename, [token, ingestToProcess]);
    
    if (isDataMissing) {
        // ... (Contenido para datos faltantes sin cambios) ...
        return (
            <div className="main-container">
                <div className="depth-2-frame-0">{/* ... */}</div>
                <div className="delusr-content-container">
                    <div className="error-message">
                        Error: Token o datos de la transacción no encontrados.
                    </div>
                </div>
            </div>
        );
    }
    
    // --- Lógica de Solicitud de Ejecución (`/ejecarch`) - Fire and Forget ---

    const handleExecute = () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setShowConfirm(false);
        setDataToEncrypt_Progress(null); 

        const payload = {
            id: Number(ingestToProcess.id), 
            filename: ingestToProcess.filename,
        };

        setEncrypting(true);
        setDataToProcess_Execute(payload); // Este es el payload para /ejecarch
    };

    // MODIFICADO: Llama a /ejecarch y NO espera la respuesta antes de preparar el /selproej
    const handleEncryptedExecutionData = (encryptedBody) => {
        setEncrypting(false);
        setDataToProcess_Execute(null); 
        
        // 1. Envía la solicitud (Fire and Forget)
        fetch(`${import.meta.env.VITE_API_URL}/ejecarch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(encryptedBody),
        })
        .then(async response => {
            // Manejar la respuesta en segundo plano, pero NO BLOQUEAR el flujo
            if (response.status !== 201) {
                const errorData = await response.json().catch(() => ({ response: 'Respuesta ilegible' }));
                const errorMessage = errorData?.[0]?.response || errorData.msg || 'Error al iniciar la ejecución.';
                console.error(`Error en segundo plano (Status ${response.status}):`, errorMessage);
                setError(prev => prev + ` | Advertencia: El servidor respondió con error (${response.status}) en /ejecarch.`);
            }
        })
        .catch(err => {
            console.error('Error de red en la llamada de ejecución:', err);
            setError(prev => prev + ' | Advertencia: Fallo de red en /ejecarch.');
        });
        
        // 2. Continúa INMEDIATAMENTE con la preparación de la consulta de progreso
        setSuccess(`✅ ¡Solicitud de ejecución de **${ingestToProcess.filename}** ENVIADA! Preparando la consulta de avance...`);
        // Usamos setTimeout para asegurar que la UI se actualice con success/loading antes de la siguiente encriptación
        setTimeout(() => {
             handlePrepareProgressQuery();
        }, 0);
    };
    
    // --- Lógica de Preparación y Ejecución de Consulta de Progreso (`/selproej`) ---

    const handlePrepareProgressQuery = () => {
        setError('');
        
        // 1. Construir el payload para la PRIMERA llamada a /selproej
        const progressPayload = {
            id: String(ingestToProcess.id),
            filename: ingestToProcess.filename,
            // Datos iniciales de la ingesta
            inserted: Number(ingestToProcess.inserted) || 0, 
        };
        
        // 2. Activamos la encriptación para el payload de consulta de progreso
        setEncrypting(true);
        setDataToEncrypt_Progress(progressPayload);
    };
    
    // NUEVA FUNCIÓN: Envía el payload encriptado al API /selproej y navega con la respuesta
    const handleEncryptedProgressData = async (encryptedBody) => {
        setEncrypting(false);
        setDataToEncrypt_Progress(null);
        
        try {
            // **PASO CLAVE:** Ejecutar la primera consulta de progreso y esperar la respuesta
            const response = await fetch(`${import.meta.env.VITE_API_URL}/selproej`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();
            
            if (response.status === 201 || response.status === 200) {
                // 3. Navega a Selproej con la RESPUESTA ENCRIPTADA
                setLoading(false);
                navigate('/Selproej', {
                    state: {
                        token,
                        encryptedData: responseData, // <--- Respuesta encriptada lista
                        ingestId: String(ingestToProcess.id),
                        filename: ingestToProcess.filename,
                    }
                });
            } else {
                // Manejar error de la consulta de avance
                const errorMessage = responseData?.[0]?.response || responseData.msg || 'Error al obtener el avance inicial.';
                setError(prev => prev + ` | ERROR: Falló la consulta de avance (${response.status}). ${errorMessage}`);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error de red en la llamada de progreso:', err);
            setError(prev => prev + ' | ERROR: Fallo de red al consultar el avance.');
            setLoading(false);
        }
    };

    // --- Funciones Dispatcher ---
    const handleEncryptedData = (encryptedBody) => {
        if (dataToProcess_Execute) {
            // Se acaba de encriptar el payload de /ejecarch
            handleEncryptedExecutionData(encryptedBody);
        } else if (dataToEncrypt_Progress) {
            // Se acaba de encriptar el payload para la primera consulta de /selproej
            handleEncryptedProgressData(encryptedBody);
        }
    };

    // --- Renderizado ---

    return (
        <div className="main-container">
            {/* ... (Menús de Navegación) ... */}

            <div className="delusr-content-container">
                <h1 className="delusr-title">Ejecutar Procesamiento Masivo</h1>
                {showConfirm ? (
                    <div className="modal-overlay">
                        {/* ... Modal content ... */}
                        <div className="modal-buttons">
                            <button onClick={handleExecute} disabled={loading}>
                                {'Sí, Iniciar Proceso'}
                            </button>
                            <button onClick={() => navigate(-1)} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="ejecarch-status-container">
                        {loading && encrypting && (
                            <div className="loading-message">
                                {dataToProcess_Execute 
                                    ? 'Solicitando inicio del proceso...' 
                                    : 'Consultando avance inicial...'}
                            </div>
                        )}
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && (
                            <div className="success-message" dangerouslySetInnerHTML={{ __html: success }}></div>
                        )}
                        
                        {!showConfirm && (
                            <div className="ejecarch-button-container">
                                {/* Si hay un error en la llamada de progreso, mostramos el botón para reintentar */}
                                {error && (
                                    <button onClick={handlePrepareProgressQuery} disabled={loading || encrypting}>
                                        Reintentar Consulta de Avance
                                    </button>
                                )}
                                
                                <button onClick={() => navigate(-1)} disabled={loading || encrypting}>
                                    Volver a la Lista
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Componente de Encriptación: Maneja ejecución y progreso */}
            {encrypting && (dataToProcess_Execute || dataToEncrypt_Progress) && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(dataToProcess_Execute || dataToEncrypt_Progress)}
                    onEncrypted={handleEncryptedData} 
                    onError={(errorMsg) => {
                        setError(errorMsg);
                        setEncrypting(false);
                        setLoading(false);
                        setDataToProcess_Execute(null);
                        setDataToEncrypt_Progress(null);
                    }}
                />
            )}
        </div>
    );
};