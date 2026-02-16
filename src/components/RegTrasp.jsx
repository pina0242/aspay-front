import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const RegTrasp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');

    const [formData, setFormData] = useState({
        entidad: '',
        cta_ori: '', alias_ori: '', tipo_ori: '',
        cta_des: '', alias_des: '', tipo_des: '',
        importe: 0,
        fecha_movto: new Date().toISOString().split('T')[0],
        concepto: ''
    });

    const [cuentas, setCuentas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [fetchEncrypting, setFetchEncrypting] = useState(false);
    const [fetchDecrypting, setFetchDecrypting] = useState(null);
    const [execEncrypting, setExecEncrypting] = useState(false);
    const [execDecrypting, setExecDecrypting] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Token de autenticación no encontrado. Redirigiendo...");
            navigate('/login');
        }
    }, [token, navigate]);

    const handleEntidadBlur = () => {
        if (formData.entidad.trim().length > 0) {
            setError('');
            setSuccess('');
            setFetchEncrypting(true);
        }
    };

    const handleCuentasEncrypted = async (encryptedBody) => {
        setFetchEncrypting(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/selctatras`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(encryptedBody)
            });
            const data = await response.json();
            if (response.status === 200 || response.status === 201) {
                setFetchDecrypting(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                setCuentas([]);
                setError(data[0]?.response || "Error al cargar cuentas.");
            }
        } catch (err) {
            setError("Error de comunicación");
        }
    };

    const handleCuentasDecrypted = (decryptedData) => {
        const parsed = JSON.parse(decryptedData);
        setCuentas(Array.isArray(parsed) ? parsed : []);
        setFetchDecrypting(null);
    };

    const handleSelectCuenta = (e, tipo) => {
        const val = e.target.value;
        const cuentaEncontrada = cuentas.find(c => c.datos === val);
        setFormData(prev => ({
            ...prev,
            [`cta_${tipo}`]: val,
            [`alias_${tipo}`]: cuentaEncontrada ? cuentaEncontrada.alias : '',
            [`tipo_${tipo}`]: cuentaEncontrada ? (cuentaEncontrada.tipo === '003' ? 'DEB' : cuentaEncontrada.tipo) : ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.cta_ori === formData.cta_des) {
            setError("La cuenta origen y destino no pueden ser iguales");
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        setExecEncrypting(true);
    };

    const handleTraspasoEncrypted = async (encryptedBody) => {
        setExecEncrypting(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/realtrasp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(encryptedBody)
            });
            const data = await response.json();
            if (response.ok) {
                setExecDecrypting(data);
            } else {
                setLoading(false);
                const errorMsg = Array.isArray(data) ? data[0]?.response : data.response;
                setError(errorMsg || 'Error en la transacción.');
                if (response.status === 401) navigate('/login');
            }
        } catch (err) {
            setError("Error de servidor");
            setLoading(false);
        }
    };

    const handleTraspasoDecrypted = (decryptedData) => {
        const parsed = JSON.parse(decryptedData);
        const message = Array.isArray(parsed) ? parsed[0]?.response : parsed.response;
        if (message === "Exito") {
            setSuccess("¡Exito!: Traspaso realizado correctamente.");
            setFormData(prev => ({ 
                ...prev, importe: 0, concepto: '', cta_ori: '', cta_des: '',
                alias_ori: '', tipo_ori: '', alias_des: '', tipo_des: '' 
            }));
        } else {
            setError(message || "Respuesta fallida");
        }
        setLoading(false);
        setExecDecrypting(null);
    };

    return (
        <div className="main-container">
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0"><div className="depth-4-frame-1"><div className="acme-co">ASPAY</div></div></div>
                <div className="depth-3-frame-1">
                    <div className="depth-4-frame-02">
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}><div className="product">Regresar</div></div>
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}><div className="product">Inicio</div></div>
                    </div>
                </div>
            </div>

            <div className="listusr-content-container">
                <h2 className="listusr-title">Registro de Traspaso</h2>
                
                {/* FILA SUPERIOR: Entidad, Importe y Concepto alineados */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Entidad:</label>
                        <input 
                            type="text" 
                            className="form-control"
                            placeholder="Entidad"
                            value={formData.entidad} 
                            onChange={(e) => setFormData({...formData, entidad: e.target.value})}
                            onBlur={handleEntidadBlur}
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Importe:</label>
                        <input 
                            type="number" step="0.01" 
                            className="form-control"
                            value={formData.importe} 
                            onChange={(e) => setFormData({...formData, importe: parseFloat(e.target.value)})} 
                            required 
                        />
                    </div>
                    <div className="form-group" style={{ flex: 2 }}>
                        <label>Concepto:</label>
                        <input 
                            type="text" 
                            className="form-control"
                            value={formData.concepto} 
                            onChange={(e) => setFormData({...formData, concepto: e.target.value})} 
                            required 
                        />
                    </div>
                </div>

                {error && <div className="error-message" style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}
                {success && <div className="success-message" style={{ color: 'green', backgroundColor: '#e6ffed', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>{success}</div>}

                <form className="listusr-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                        {/* TARJETA ORIGEN */}
                        <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <h3 style={{ fontSize: '1.1em', borderBottom: '1px solid #eee', marginBottom: '10px', color: '#333' }}>Origen</h3>
                            <label>Cuenta:</label>
                            <select 
                                value={formData.cta_ori} 
                                onChange={(e) => handleSelectCuenta(e, 'ori')} 
                                required 
                                disabled={cuentas.length === 0}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="">Seleccione...</option>
                                {cuentas.map(c => <option key={c.id} value={c.datos}>{c.alias} - {c.datos}</option>)}
                            </select>
                            <div style={{ marginTop: '12px', fontSize: '0.9em' }}>
                                <p><strong>Alias:</strong> {formData.alias_ori || '---'}</p>
                                <p><strong>Tipo:</strong> {formData.tipo_ori || '---'}</p>
                            </div>
                        </div>

                        {/* TARJETA DESTINO */}
                        <div style={{ flex: 1, padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <h3 style={{ fontSize: '1.1em', borderBottom: '1px solid #eee', marginBottom: '10px', color: '#333' }}>Destino</h3>
                            <label>Cuenta:</label>
                            <select 
                                value={formData.cta_des} 
                                onChange={(e) => handleSelectCuenta(e, 'des')} 
                                required 
                                disabled={cuentas.length === 0}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="">Seleccione...</option>
                                {cuentas.map(c => <option key={c.id} value={c.datos}>{c.alias} - {c.datos}</option>)}
                            </select>
                            <div style={{ marginTop: '12px', fontSize: '0.9em' }}>
                                <p><strong>Alias:</strong> {formData.alias_des || '---'}</p>
                                <p><strong>Tipo:</strong> {formData.tipo_des || '---'}</p>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={loading || cuentas.length === 0} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>
                        {loading ? 'Procesando...' : 'Realizar Traspaso'}
                    </button>
                </form>
            </div>

            {/* MODULOS DE ENCRIPTACIÓN */}
            {fetchEncrypting && <Encryptor password={encryptionPassword} message={JSON.stringify({entidad: formData.entidad})} onEncrypted={handleCuentasEncrypted} onError={setError} />}
            {fetchDecrypting && <Decryptor encryptedMessage={fetchDecrypting} password={encryptionPassword} onDecrypted={handleCuentasDecrypted} onError={setError} />}
            {execEncrypting && <Encryptor password={encryptionPassword} message={JSON.stringify(formData)} onEncrypted={handleTraspasoEncrypted} onError={setError} />}
            {execDecrypting && <Decryptor encryptedMessage={execDecrypting} password={encryptionPassword} onDecrypted={handleTraspasoDecrypted} onError={setError} />}
        </div>
    );
};