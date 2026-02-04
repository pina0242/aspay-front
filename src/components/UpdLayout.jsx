import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const ENDPOINT_UPD_LAYOUT = '/updlayout'; 

export const UpdLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Recuperamos 'layout' desde el estado de navegación
    const { token, layout } = location.state || {};

    // Estados basados en el JSON: {"id":20,"entidad":"0005","llave": "MASIHEAD","clave": "cliente1234.csv","datos_in":"temp1"}
    const [id] = useState(layout?.id || '');
    const [entidad] = useState(layout?.entidad || '');
    
    // CAMPOS EDITABLES
    const [llave, setLlave] = useState(layout?.llave || '');
    const [clave, setClave] = useState(layout?.clave || '');
    const [datosIn, setDatosIn] = useState(layout?.datos || layout?.datos_in || '');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null); 
    const [decryptingResponse, setDecryptingResponse] = useState(null); 

    useEffect(() => {
        if (!token) {
            setError("Sesión expirada. Redirigiendo...");
            setTimeout(() => navigate('/login'), 1500);
        } else if (!layout) {
            setError("No se seleccionó ningún layout.");
            setTimeout(() => navigate('/ListLayout', { state: { token } }), 1500);
        }
    }, [token, navigate, layout]);

    const handleDecryptedResponse = useCallback((data) => {
        try {
            const parsedData = JSON.parse(data);
            const message = parsedData.response || (Array.isArray(parsedData) && parsedData[0]?.response);
            
            if (message === 'Exito') {
                setSuccess(`¡Layout ${id} actualizado correctamente!`);
                setTimeout(() => {
                    navigate('/ListLayout', { state: { token }, replace: true });
                }, 2000);
            } else {
                setError(`Error: ${message || 'Respuesta inesperada'}`);
            }
        } catch (err) {
            setError("Error al procesar respuesta del servidor.");
        }
        setLoading(false);
        setDecryptingResponse(null);
    }, [navigate, token, id]);

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false); 
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${ENDPOINT_UPD_LAYOUT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody) 
            });

            const responseData = await response.json();

            if (response.status >= 200 && response.status < 300) {
                setDecryptingResponse(responseData);
            } else {
                // Error sin desencriptar
                const errorMsg = Array.isArray(responseData) ? responseData[0]?.response : (responseData.response || 'Error en servidor');
                setError(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            setError('Error de conexión con el API.');
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const payload = {
            id: id,
            entidad: entidad,
            llave: llave,
            clave: clave,
            datos_in: datosIn
        };

        setEncrypting(true);
        setDataToProcess(payload); 
    };

    if (!layout) return <div className="main-container">Cargando...</div>;

    return (
        <div className="main-container">
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-1">
                    <div className="depth-4-frame-02">
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
                            <div className="product">Regresar</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="regusr-content-container">
                <h1 className="regusr-title">Modificar Layout ID: {id}</h1>
                <form className="regusr-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Entidad (Lectura):</label>
                        <input type="text" value={entidad} readOnly disabled className="readonly-input" />
                    </div>

                    <div className="form-group">
                        <label>Llave:</label>
                        <input 
                            type="text" 
                            value={llave} 
                            onChange={(e) => setLlave(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Clave (Archivo):</label>
                        <input 
                            type="text" 
                            value={clave} 
                            onChange={(e) => setClave(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>Datos (Campo):</label>
                        <input 
                            type="text" 
                            value={datosIn} 
                            onChange={(e) => setDatosIn(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    
                    <button type="submit" disabled={loading || encrypting}>
                        {loading ? 'Procesando...' : 'Guardar Cambios'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                {encrypting && (
                    <Encryptor
                        password={encryptionPassword}
                        message={JSON.stringify(dataToProcess)}
                        onEncrypted={handleEncryptedData}
                        onError={(m) => { setError(m); setLoading(false); setEncrypting(false); }}
                    />
                )}

                {decryptingResponse && (
                    <Decryptor
                        encryptedMessage={decryptingResponse}
                        password={encryptionPassword}
                        onDecrypted={handleDecryptedResponse}
                        onError={(m) => { setError(m); setLoading(false); setDecryptingResponse(null); }}
                    />
                )}
            </div>
        </div>
    );
};