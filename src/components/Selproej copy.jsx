import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Decryptor from './Decryptor';
import Encryptor from './Encryptor';
import '../styles/principal.css'; 
import '../styles/Selproej.css'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Selproej = () => {
    const location = useLocation();
    const navigate = useNavigate();
    // Ahora, `encryptedData` es la RESPUESTA ENCRIPTADA de la primera consulta /selproej.
    const { token, encryptedData, filename, ingestId } = location.state || {}; 

    const [processData, setProcessData] = useState(null);
    const [decrypting, setDecrypting] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null); // Payload para la re-consulta
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 1. Lógica de inicio: Si hay 'encryptedData', iniciamos el descifrado INMEDIATAMENTE.
    useEffect(() => {
        if (!token || !ingestId) {
            setError("Datos de sesión incompletos.");
            setLoading(false);
            return;
        }

        // Si recibimos datos encriptados de Ejecarch, activamos el ciclo de descifrado.
        if (encryptedData) {
            setDecrypting(true);
            setLoading(true); 
        } else {
            setError("No se encontraron datos de consulta de avance encriptados. La aplicación anterior no completó la consulta inicial.");
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, ingestId, encryptedData]); // Dependencia clave: encryptedData

    // Handler para recibir el resultado descifrado (primera vez o re-consulta)
    const handleDecryptedResponse = (data) => {
        setDecrypting(false);
        setLoading(false); // Detener el loading después del descifrado

        try {
            let parsedData = JSON.parse(data);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                parsedData = parsedData[0];
            } else if (Array.isArray(parsedData) && parsedData.length === 0) {
                setError("La respuesta del servidor está vacía.");
                return;
            }
            
            if (parsedData.total !== undefined && parsedData.realizados !== undefined) {
                const totalInt = parseInt(parsedData.total, 10);
                const realizadosInt = parseInt(parsedData.realizados, 10);
                
                if (isNaN(totalInt) || isNaN(realizadosInt)) {
                    setError("Los contadores de avance no son números válidos.");
                } else {
                    // Guardamos los datos con los valores ya como enteros
                    setProcessData({
                        ...parsedData,
                        total: totalInt, 
                        realizados: realizadosInt 
                    });
                }
            } else {
                setError("Respuesta del servidor inesperada para el avance. Verifique la estructura del JSON.");
            }
        } catch (err) {
            console.error("Error al procesar la respuesta descifrada:", err);
            setError("Respuesta cifrada inválida o corrupta.");
        }
    };
    
    // Handler para el botón de Consultar (genera el payload de re-consulta)
    const handleConsultarClick = () => {
        setError('');
        setLoading(true);
        
        const insertedValue = processData?.total; 

        if (insertedValue === undefined || insertedValue === null) {
            setError("No se encontró el valor 'total' para generar la nueva consulta.");
            setLoading(false);
            return;
        }

        // 1. Construir el payload para la re-consulta
        const payload = {
            id: String(ingestId),
            filename: filename,
            inserted: insertedValue, // CLAVE: Mapeamos total a inserted
        };
        
        // 2. Activar la encriptación
        setEncrypting(true);
        setDataToProcess(payload); 
    };

    // Handler para el envío de datos encriptados (re-consulta)
    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);

        try {
            // Llamada al API para RE-CONSULTA
            const response = await fetch(`${import.meta.env.VITE_API_URL}/selproej`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody) // Cuerpo encriptado de la re-consulta
            });

            if (response.status === 201) {
                const responseData = await response.json();
                
                // Actualiza el router state y dispara el ciclo de descifrado
                // **NOTA:** Esto es un anti-patrón de React. Si esto causa problemas,
                // se debe usar un estado local para forzar el re-renderizado del Decryptor,
                // por ejemplo, con un estado 'decryptionTrigger'.
                // Dejaremos la modificación de 'location.state' como estaba, asumiendo 
                // que es parte del flujo de la aplicación original.
                location.state.encryptedData = responseData; 
                setDecrypting(true); 
            } else {
                const errorData = await response.json();
                const defaultMsg = 'Error al consultar el avance.';
                const errorMessage = (Array.isArray(errorData) && errorData.length > 0 && errorData[0].response) 
                    ? errorData[0].response 
                    : defaultMsg;
                    
                setError(errorMessage);
                setLoading(false);
            }
        } catch (err) {
            console.error('Error durante la llamada al API:', err);
            setError('Error en la comunicación con el servidor. Revisa tu conexión.');
            setLoading(false);
        }
    };
    
    // Cálculo de estados para el renderizado
    const total = processData?.total || 0; 
    const realizados = processData?.realizados || 0;
    const isCompleted = total > 0 && total === realizados;
    const progressPercentage = total > 0 ? ((realizados / total) * 100).toFixed(2) : 0;
    
    return (
        <div className="main-container">
            {/* -------------------- Menús de Navegación (INTEGRADO DE Listpdet) -------------------- */}
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0">
                    <div className="depth-4-frame-0"></div>
                    <div className="depth-4-frame-1">
                        <div className="acme-co">ASPAY</div>
                    </div>
                </div>
                <div className="depth-3-frame-1">
                    <div className="depth-4-frame-02">
                        {/* Botón Regresar */}
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-2)}>
                            <div className="product">Regresar</div>
                        </div>
                        {/* Botón Inicio */}
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
                            <div className="product">Inicio</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* -------------------- Contenido Principal -------------------- */}
            <div className="listusr-content-container">
                <h1 className="listusr-title">Avance de Procesamiento</h1>
                
                {loading && <div className="loading-message">Cargando...</div>}
                {error && <div className="error-message">{error}</div>}
                
                {processData && (
                    <div className="progress-card">
                        <h2>Archivo: {processData.filename || filename}</h2>
                        <p>Identificador: {processData.id || ingestId}</p>
                        <p>Total de Registros: {total}</p> 
                        <p>Registros Procesados: {realizados}</p>
                        
                        <div className="progress-bar-container">
                            <div 
                                className="progress-bar-fill" 
                                style={{ width: `${progressPercentage}%`, backgroundColor: isCompleted ? '#4CAF50' : '#2196F3' }}
                            >
                                {progressPercentage}%
                            </div>
                        </div>
                        
                        <div className="progress-status" style={{ color: isCompleted ? '#4CAF50' : '#FF9800' }}>
                            {(realizados === 0 && total > 0) 
                                ? 'Espere unos minutos para que se actualice los contadores' 
                                : (isCompleted ? '¡Procesamiento Completado! 🎉' : 'En Proceso...')}
                        </div>
                        
                        <button 
                            onClick={handleConsultarClick}
                            disabled={isCompleted || loading || encrypting || decrypting}
                            className="consultar-btn"
                            style={{ marginTop: '20px' }}
                        >
                            {loading || encrypting ? 'Consultando...' : 'Consultar Avance'}
                        </button>
                    </div>
                )}
            </div>

            {/* Componente para Desencripción inicial y re-consulta */}
            {(decrypting) && (
                <Decryptor
                    encryptedMessage={location.state.encryptedData} // Toma el dato encriptado del state
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(err) => {
                        setError(err);
                        setDecrypting(false);
                        setLoading(false);
                    }}
                />
            )}
            
            {/* Componente para Encriptación de la re-consulta */}
            {encrypting && dataToProcess && (
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
        </div>
    );
};