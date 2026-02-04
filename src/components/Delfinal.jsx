import React, { useState } from 'react'; 
import Encryptor from './Encryptor'; 
import Decryptor from './Decryptor';  

// Importa la contraseña de encriptación desde tu entorno
const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

/**
 * Componente de lógica para manejar el proceso completo de borrado de un archivo (/delfinal).
 * Se monta y desmonta en Verarchivos.jsx para realizar el proceso en segundo plano (display: none).
 * * @param {object} props
 * @param {object} props.fileToDelete - El objeto del archivo a borrar: { filename: string }
 * @param {function} props.onComplete - Callback que se ejecuta al finalizar la operación (éxito o error).
 * @param {function} props.onError - Callback para errores críticos (red/token).
 */
export const Delfinal = ({ fileToDelete, onComplete, onError }) => {
    
    // Estado para controlar las etapas del proceso
    const [encryptedBody, setEncryptedBody] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);
    const [isSending, setIsSending] = useState(false);  

    // La encriptación se activa implícitamente si hay archivo pero aún no hay cuerpo encriptado
    const isEncrypting = fileToDelete && !encryptedBody && !isSending && !decryptingResponse;

    // --- 2. ENVIAR DATO ENCRIPTADO AL API (/delfinal) ---
    const handleEncryptedData = async (body) => {
        setEncryptedBody(body);
        setIsSending(true); // Iniciamos el envío
        const endpoint = '/delfinal';
        
        const token = localStorage.getItem('userToken'); 

        if (!token) {
            setIsSending(false);
            return onError("Error de Autenticación: Token no encontrado para borrar.");
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token 
                },
                body: JSON.stringify(body)
            });

            const responseData = await response.json().catch(() => ({}));
            setIsSending(false); // Terminamos el envío

            if (response.status >= 200 && response.status < 300) {
                // Éxito (Respuesta encriptada): Activar descifrado
                setDecryptingResponse(responseData);
            } else {
                // Error (Respuesta no encriptada o status de error)
                let errorMsg = responseData.response || responseData.msg || `Error ${response.status} en la API.`;
                onComplete({ 
                    success: false, 
                    message: errorMsg, 
                    filename: fileToDelete.filename 
                });
            }
        } catch (err) {
            setIsSending(false);
            console.error('Delfinal: Error de red o comunicación:', err);
            onError('Error de red al intentar borrar el archivo.');
        }
    };


    // --- 3. MANEJAR DATO DESCIFRADO (ÉXITO) ---
    const handleDecryptedResponse = (data) => {
        setDecryptingResponse(null); 
        try {
            const parsedData = JSON.parse(data);
            
            // --- Lógica de éxito robusta para evitar el error "El servidor no confirmó el borrado" ---
            const responseText = String(parsedData.response || data).toLowerCase();
            
            // Consideramos éxito si NO contiene 'error' o 'fallo', y contiene alguna palabra clave positiva.
            const isSuccess = (
                !responseText.includes("error") && 
                !responseText.includes("fallo") &&
                (responseText.includes("exito") || responseText.includes("borrado") || responseText.includes("ok"))
            );

            const filename = parsedData.filename || fileToDelete.filename;
            const responseMessage = parsedData.response || parsedData.message || "Operación completada exitosamente.";

            if (isSuccess) {
                onComplete({ 
                    success: true, 
                    message: `Borrado Exitoso: ${filename}. ${responseMessage}`,
                    filename: filename
                });
            } else {
                // Si el servidor devolvió un mensaje de error legible
                onComplete({ 
                    success: false, 
                    message: responseMessage,
                    filename: filename
                });
            }
            // ---------------------------------------------------------------------------------------

        } catch (err) {
            onError("Error al procesar la respuesta descifrada de borrado.");
        }
    };


    return (
        <div style={{ display: 'none' }}>
            
            {/* 1. Encryptor */}
            {isEncrypting && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify({ filename: fileToDelete.filename })} 
                    onEncrypted={handleEncryptedData}
                    onError={(e) => onError(`Error de encriptación al borrar: ${e}`)}
                />
            )}

            {/* 2. Decryptor */}
            {decryptingResponse && (
                <Decryptor
                    encryptedMessage={decryptingResponse}
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(e) => onError(`Error de desencriptación al borrar: ${e}`)}
                />
            )}
            
            {(isEncrypting || isSending || decryptingResponse) && <p>Procesando borrado...</p>}
        </div>
    );
};