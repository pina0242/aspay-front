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

    const isDataMissing = useMemo(() => !token || !ingestToProcess || !ingestToProcess.id || !ingestToProcess.entidad || !ingestToProcess.filename, [token, ingestToProcess]);
    
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
            entidad: ingestToProcess.entidad,
            filename: ingestToProcess.filename,
        };

        setEncrypting(true);
        setDataToProcess_Execute(payload); // Este es el payload para /ejecarch
    };

    // **MODIFICADO:** Llama a /ejecarch, NO espera, y ejecuta /selproej inmediatamente después.
    const handleEncryptedExecutionData = (encryptedBody) => {
        setEncrypting(false);
        setDataToProcess_Execute(null); 
        
        // 1. Envía la solicitud (Fire and Forget)
        // No usamos 'await' y no leemos el cuerpo de la respuesta para evitar bloqueos.
        fetch(`${import.meta.env.VITE_API_URL}/ejecarch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(encryptedBody),
        })
        .then(response => {
            // Manejar la respuesta en segundo plano, solo revisamos el status
            if (response.status !== 201) {
                // No llamamos a response.json() para evitar esperar el cuerpo.
                console.warn(`Advertencia en /ejecarch: Status ${response.status}. La ejecución pudo haber fallado.`);
                // Solo una advertencia minimalista
                setError(prev => prev + ` | Advertencia: El servidor de ejecución respondió con status ${response.status}.`);
            }
        })
        .catch(err => {
            // Este es un error de red, que no podemos ignorar, pero no bloquea el flujo
            console.error('Error de red en la llamada de ejecución (Fire & Forget):', err);
            setError(prev => prev + ' | Advertencia: Fallo de red en /ejecarch.');
        });
        
        // **MODIFICACIÓN APLICADA AQUÍ:** // 2. Continúa INMEDIATAMENTE y desactiva el loading principal.
        setLoading(false); // <--- Se desactiva el loading para que el usuario vea el mensaje de éxito.

        setSuccess(`✅ ¡Solicitud de ejecución de **${ingestToProcess.filename}** ENVIADA! Preparando la consulta de avance...`);
        
        // Usamos una pequeña pausa para asegurar que el estado 'success' se procese antes de la siguiente encriptación
        // y para asegurarnos de que el thread principal de JS no esté totalmente bloqueado.
        setTimeout(() => {
            handlePrepareProgressQuery();
        }, 10); // Pausa mínima de 10ms
    };
    
    // --- Lógica de Preparación y Ejecución de Consulta de Progreso (`/selproej`) ---

    const handlePrepareProgressQuery = () => {
        // Se vuelve a activar loading y encrypting para la fase de consulta
        setLoading(true);
        setEncrypting(true);
        
        // 1. Construir el payload para la PRIMERA llamada a /selproej
        const progressPayload = {
            id: String(ingestToProcess.id),
            entidad: ingestToProcess.entidad,
            filename: ingestToProcess.filename,
            // Datos iniciales de la ingesta
            inserted: Number(ingestToProcess.inserted) || 0, 
        };
        
        // 2. Activamos la encriptación para el payload de consulta de progreso
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
                        entidad: ingestToProcess.entidad,
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
            // Se acaba de encriptar el payload de /ejecarch (Fire and Forget)
            handleEncryptedExecutionData(encryptedBody);
        } else if (dataToEncrypt_Progress) {
            // Se acaba de encriptar el payload para la primera consulta de /selproej (Awaiting)
            handleEncryptedProgressData(encryptedBody);
        }
    };

    // --- Renderizado (sin cambios relevantes) ---

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
                        {/* Se mantiene la lógica de loading y encrypting para mostrar el mensaje de transición */}
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
                                {/* Nota: Se usa 'loading' para deshabilitar mientras la red o encriptación está activa */}
                                {error && error.includes('ERROR: Falló la consulta de avance') && (
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