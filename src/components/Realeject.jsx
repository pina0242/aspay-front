import React, { useState, useEffect } from 'react';
import Encryptor from './Encryptor'; // Asumimos que existen
import Decryptor from './Decryptor'; // Asumimos que existen

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

/**
 * Componente que maneja la lógica de encriptación, llamada API para ejecución, 
 * y desencriptación del resultado para la ejecución de un archivo final.
 */
export const Realeject = ({ fileToExecute, onComplete, onError }) => {
    const token = localStorage.getItem('userToken'); 
    
    // Estados internos para el flujo de proceso
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [dataToEncrypt, setDataToEncrypt] = useState(null);
    const [encryptedBody, setEncryptedBody] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);

    // 1. Iniciar la encriptación al montar o al recibir el archivo
    useEffect(() => {
        if (fileToExecute) {
            const payload = {
                filename: fileToExecute.filename,
            };
            setIsEncrypting(true);
            setDataToEncrypt(JSON.stringify(payload));
        }
    }, [fileToExecute]);

    // 2. Manejar datos encriptados (llamada API)
    const handleEncryptedData = async (body) => {
        setIsEncrypting(false);
        setDataToEncrypt(null);
        setEncryptedBody(body); // Guardar el body encriptado si se necesita más adelante
        
        const endpoint = '/realeject';

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

            if (response.status >= 200 && response.status < 300) {
                // Éxito: Pasar a la desencriptación
                setDecryptingResponse(responseData);
            } else {
                // Error: Devolver el mensaje de error directamente (sin desencriptar)
                let errorMessage = `Error ${response.status}: Respuesta no exitosa del servidor.`;
                if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].response) {
                    errorMessage = responseData[0].response;
                } else if (responseData.msg) {
                    errorMessage = responseData.msg;
                }
                
                onError(`Fallo en la ejecución [${fileToExecute.filename}]. ${errorMessage}`);
            }
        } catch (err) {
            console.error('Error durante la llamada al API de ejecución:', err);
            onError(`Error en la comunicación con el servidor para la ejecución: ${err.message}`);
        }
    };

    // 3. Manejar respuesta desencriptada (resultado final)
    const handleDecryptedResponse = (data) => {
        setDecryptingResponse(null); 
        try {
            const parsedData = JSON.parse(data);
            const successMessage = `✅ Éxito al ejecutar ${fileToExecute.filename}. Debera actualizar la lista nuevamente`;
            onComplete({ 
                success: true, 
                message: successMessage, 
                filename: parsedData.filename 
            });
        } catch (err) {
            console.error("Error al procesar la respuesta descifrada:", err);
            onError("Respuesta de ejecución del servidor corrupta o mal formada.");
        }
    };

    // 4. Renderizar Componentes Auxiliares (Encryptor/Decryptor)
    return (
        <>
            {/* Componente de Encriptación */}
            {isEncrypting && dataToEncrypt && (
                <Encryptor
                    password={encryptionPassword}
                    message={dataToEncrypt}
                    onEncrypted={handleEncryptedData}
                    onError={(errorMsg) => onError(`Error de encriptación para ejecución: ${errorMsg}`)}
                />
            )}

            {/* Componente de Desencriptación */}
            {decryptingResponse && !isEncrypting && (
                <Decryptor
                    encryptedMessage={decryptingResponse}
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(errorMsg) => onError(`Error de desencriptación para ejecución: ${errorMsg}`)}
                />
            )}
        </>
    );
};