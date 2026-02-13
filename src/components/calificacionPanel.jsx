import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import {EndpointSelector} from './EndpointSelector';
import {CalificacionForm} from './CalificacionForm';
import {ResultadoPanel} from './ResultadoPanel';
import '../styles/principal.css';
import '../styles/regper.css';
import '../styles/calificacion.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const CalificacionPanel = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('userToken');
    
    const [selectedEndpoints, setSelectedEndpoints] = useState([]);
    const [formData, setFormData] = useState({
        doc_id: '',
        pais: '',
        actecon: '',
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        fecha_nac_const: '',
        nacionalidad: '',
        alias: '',
        ocupa_giro: '',
        tkncli: '',
        alias2: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null);
    const [apiResponses, setApiResponses] = useState([]);
    const [results, setResults] = useState({});
    const [decryptedResults, setDecryptedResults] = useState([]);
    const [indexToDecrypt, setIndexToDecrypt] = useState(null);

    const handleEndpointToggle = (endpointNumber) => {
        setSelectedEndpoints(prev => {
            if (prev.includes(endpointNumber)) {
                return prev.filter(item => item !== endpointNumber);
            } else {
                return [...prev, endpointNumber];
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = [];
        
        // Validar doc_id común para todos los endpoints
        if (!formData.doc_id || formData.doc_id.length > 20) {
            errors.push('doc_id debe tener máximo 20 caracteres');
        }

        // Validaciones específicas por endpoint seleccionado
        if (selectedEndpoints.includes(1)) {
            if (!formData.pais || formData.pais.length > 30) {
                errors.push('Para Opción 1: pais debe tener máximo 30 caracteres');
            }
            if (!formData.actecon || formData.actecon.length > 30) {
                errors.push('Para Opción 1: actecon debe tener máximo 30 caracteres');
            }
        }

        if (selectedEndpoints.includes(2)) {
            if (!formData.nombre || formData.nombre.length > 60) {
                errors.push('Para Opción 2: nombre debe tener máximo 60 caracteres');
            }
            if (!formData.ap_paterno || formData.ap_paterno.length > 30) {
                errors.push('Para Opción 2: ap_paterno debe tener máximo 30 caracteres');
            }
            if (!formData.ap_materno || formData.ap_materno.length > 20) {
                errors.push('Para Opción 2: ap_materno debe tener máximo 20 caracteres');
            }
            if (formData.nacionalidad && formData.nacionalidad.length > 30) {
                errors.push('Para Opción 2: nacionalidad debe tener máximo 30 caracteres');
            }
            if (formData.alias && formData.alias.length > 50) {
                errors.push('Para Opción 2: alias debe tener máximo 50 caracteres');
            }
            if (formData.ocupa_giro && formData.ocupa_giro.length > 30) {
                errors.push('Para Opción 2: ocupa_giro debe tener máximo 30 caracteres');
            }
            if (formData.pais && formData.pais.length > 30) {
                errors.push('Para Opción 2: pais debe tener máximo 30 caracteres');
            }
        }

        if (selectedEndpoints.includes(4)) {
            if (!formData.tkncli || formData.tkncli.length > 36) {
                errors.push('Para Opción 4: tkncli debe tener exactamente 36 caracteres');
            }
            if (!formData.alias2 || formData.alias2.length > 10) {
                errors.push('Para Opción 4: alias debe tener máximo 10 caracteres');
            }
        }

        if (selectedEndpoints.includes(5)) {
            if (!formData.tkncli || formData.tkncli.length > 36) {
                errors.push('Para Opción 5: tkncli debe tener exactamente 36 caracteres');
            }
            if (!formData.alias2 || formData.alias2.length > 10) {
                errors.push('Para Opción 5: alias debe tener máximo 10 caracteres');
            }
        }

        if (selectedEndpoints.length === 0) {
            errors.push('Debe seleccionar al menos una opción de calificación');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setResults({});
        setApiResponses([]);

        // Construir payload según endpoints seleccionados
        const requests = [];
        
        if (selectedEndpoints.includes(1)) {
            requests.push({
                endpoint: '/califopc1',
                payload: {
                    doc_id: formData.doc_id,
                    pais: formData.pais,
                    actecon: formData.actecon
                }
            });
        }

        if (selectedEndpoints.includes(2)) {
            requests.push({
                endpoint: '/califopc23',
                payload: {
                    doc_id: formData.doc_id,
                    nombre: formData.nombre,
                    ap_paterno: formData.ap_paterno,
                    ap_materno: formData.ap_materno,
                    fecha_nac_const: formData.fecha_nac_const,
                    nacionalidad: formData.nacionalidad,
                    alias: formData.alias,
                    ocupa_giro: formData.ocupa_giro,
                    pais: formData.pais
                }
            });
        }

        if (selectedEndpoints.includes(4)) {
            requests.push({
                endpoint: '/califopc4',
                payload: {
                    doc_id: formData.doc_id,
                    tkncli: formData.tkncli,
                    alias: formData.alias2
                }
            });
        }

        if (selectedEndpoints.includes(5)) {
            requests.push({
                endpoint: '/califopc5',
                payload: {
                    doc_id: formData.doc_id,
                    tkncli: formData.tkncli,
                    alias: formData.alias2
                }
            });
        }

        // Iniciar proceso de encriptación con el primer request
        setEncrypting(true);
        setDataToProcess({
            requests,
            currentIndex: 0,
            responses: []
        });
    };

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);

        const { requests, currentIndex, responses } = dataToProcess;
        const currentRequest = requests[currentIndex];
        
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${currentRequest.endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            // Validación para status 401 - Sesión caducada
            if (response.status === 401) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
                const lowerMessage = errorMessage.toLowerCase();
                
                const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
                
                if (AUTH_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
                    setError(errorMessage);
                } else {
                    window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
                }
                
                setLoading(false);
                return;
            }

            // Obtener la respuesta como texto primero (no como JSON)
            const responseText = await response.text();
            
            // Verificar si la respuesta está vacía
            if (!responseText) {
                setError('Respuesta vacía del servidor');
                setLoading(false);
                setDataToProcess(null);
                return;
            }

            // Intentar parsear como JSON
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (jsonError) {
                console.warn('La respuesta no es JSON válido, tratando como texto plano:', jsonError);
                responseData = responseText;
            }

            
            if (response.status === 201 || response.status === 200) {
                // 1. Extraemos la data (que viene encriptada desde Python)
                // Asumiendo que el JSON de Python trae la respuesta en un campo o es el string directo
                const encryptedDataFromServer = typeof responseData === 'string' 
                    ? responseData 
                    : responseData.contenido_cifrado; // Ajusta según tu API

                const updatedResponses = [...responses, encryptedDataFromServer];
                
                if (currentIndex + 1 < requests.length) {
                    setDataToProcess({
                        requests,
                        currentIndex: currentIndex + 1,
                        responses: updatedResponses
                    });
                    setEncrypting(true);
                } else {
                    // AQUÍ EL CAMBIO: No guardamos el array en dataToProcess directamente para el Decryptor
                    setApiResponses(updatedResponses);
                    setLoading(true); 
                    // Vamos a crear un estado para manejar la desencriptación secuencial
                    setIndexToDecrypt(0); 
                }
            } else {
                const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al procesar la solicitud.';
                setError(errorMessage);
                setLoading(false);
                setDataToProcess(null);
            }
        } catch (err) {
            console.error('Error durante la llamada al API:', err);
            setError('Error en la comunicación con el servidor. Revisa tu conexión.');
            setLoading(false);
            setDataToProcess(null);
        }
    };

    // Modifica el manejador de desencriptación
    const handleDecryptedResponse = (decryptedText) => {
        const parsed = JSON.parse(decryptedText);
        const newResults = [...decryptedResults, parsed];
        
        if (indexToDecrypt + 1 < apiResponses.length) {
            setDecryptedResults(newResults);
            setIndexToDecrypt(indexToDecrypt + 1);
        } else {
            // Ya terminamos todos
            const finalResults = {};
            selectedEndpoints.forEach((id, idx) => {
                finalResults[`endpoint${id}`] = newResults[idx];
            });
            setResults(finalResults);
            setDecryptedResults([]);
            setIndexToDecrypt(null);
            setLoading(false);
            setSuccess('Calificación completada exitosamente');
        }
    };

    return (
        <div className="main-container">
            {/* Header similar al de tu pantalla existente */}
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0">
                    <div className="depth-4-frame-0"></div>
                    <div className="depth-4-frame-1">
                        <div className="acme-co">ASPAY</div>
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
            
            <div className="calificacion-container">
                <h1 className="panel-title">Sistema de Calificación Integrada</h1>
                
                <div className="panel-header">
                    <EndpointSelector 
                        selectedEndpoints={selectedEndpoints}
                        onToggle={handleEndpointToggle}
                    />
                </div>

                <div className="content-wrapper">
                    <div className="form-section">
                        <CalificacionForm 
                            formData={formData}
                            selectedEndpoints={selectedEndpoints}
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                        />
                    </div>

                    {(Object.keys(results).length > 0) && (
                        <div className="results-section">
                            <ResultadoPanel 
                                results={results}
                                error={error}
                                selectedEndpoints={selectedEndpoints}
                                formData={formData} // Agrega esta línea
                            />
                        </div>
                    )}
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {encrypting && dataToProcess?.requests && (
                    <Encryptor
                        password={encryptionPassword}
                        message={JSON.stringify(dataToProcess.requests[dataToProcess.currentIndex].payload)}
                        onEncrypted={handleEncryptedData}
                        onError={(errorMsg) => {
                            setError(errorMsg);
                            setEncrypting(false);
                            setLoading(false);
                        }}
                    />
                )}

                {indexToDecrypt !== null && (
                    <Decryptor
                        encryptedMessage={apiResponses[indexToDecrypt]} // Enviamos SOLO el string encriptado
                        password={encryptionPassword}
                        onDecrypted={handleDecryptedResponse}
                        onError={(err) => {
                            setError("Error al descifrar: " + err);
                            setIndexToDecrypt(null);
                            setLoading(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

