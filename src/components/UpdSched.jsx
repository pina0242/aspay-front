import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { FaPlus, FaExclamationTriangle, FaTrashAlt, FaArrowLeft } from 'react-icons/fa'; 
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const UpdSched = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');
    const datosIniciales = location.state?.proceso;

    const [formData, setFormData] = useState({
        entidad: datosIniciales?.entidad || "",
        nombre_proceso: datosIniciales?.nombre_proceso || "",
        task_path: datosIniciales?.task_path || "",
        configs: datosIniciales?.configs || [{ minuto: "*", hora: "*", diaMes: "*", mes: "*", diaSemana: "*" }]
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToEncrypt, setDataToEncrypt] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);

    useEffect(() => {
        if (!token) navigate('/login');
        if (!datosIniciales) navigate(-1);
    }, [token, navigate, datosIniciales]);

    const isValidCronItem = (value, min, max) => {
        if (value === '*' || value === '7') return true;
        const num = parseInt(value);
        return !isNaN(num) && num >= min && num <= max;
    };

    const validateConfig = (config) => {
        return (
            isValidCronItem(config.minuto, 0, 59) &&
            isValidCronItem(config.hora, 0, 23) &&
            isValidCronItem(config.diaMes, 1, 31) &&
            isValidCronItem(config.mes, 1, 12) &&
            isValidCronItem(config.diaSemana, 0, 7)
        );
    };

    const isFormInvalid = () => {
        return !formData.nombre_proceso || !formData.task_path || formData.configs.some(c => !validateConfig(c));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfigChange = (index, field, value) => {
        const newConfigs = [...formData.configs];
        newConfigs[index][field] = value;
        setFormData(prev => ({ ...prev, configs: newConfigs }));
    };

    const addConfig = () => {
        setFormData(prev => ({
            ...prev,
            configs: [...prev.configs, { minuto: "*", hora: "*", diaMes: "*", mes: "*", diaSemana: "*" }]
        }));
    };

    const removeConfig = (index) => {
        if (formData.configs.length > 1) {
            const newConfigs = formData.configs.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, configs: newConfigs }));
        }
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        const formattedData = {
            ...formData,
            configs: formData.configs.map(item => ({
                minuto: item.minuto === '*' ? '*' : parseInt(item.minuto),
                hora: item.hora === '*' ? '*' : parseInt(item.hora),
                diaMes: item.diaMes === '*' ? '*' : parseInt(item.diaMes),
                mes: item.mes === '*' ? '*' : parseInt(item.mes),
                diaSemana: item.diaSemana === '*' ? '*' : parseInt(item.diaSemana),
            }))
        };
        setDataToEncrypt(formattedData);
        setEncrypting(true);
        setLoading(true);
        setError('');
        setSuccessMsg('');
    };

    const onEncrypted = async (encryptedBody) => {
        setEncrypting(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/updsched`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
                body: JSON.stringify(encryptedBody)
            });
            const responseData = await response.json();
            
            if (response.ok) {
                setDecryptingResponse(responseData);
            } else {
                // Captura error directo según especificación [{response: '...'}] o {response: '...'}
                const errorMsg = Array.isArray(responseData) ? responseData[0]?.response : responseData?.response;
                setError(errorMsg || "Error en la actualización");
                setLoading(false);
            }
        } catch (err) {
            setError("Error de red al conectar con el servidor.");
            setLoading(false);
        }
    };

    const onDecrypted = (data) => {
        try {
            const parsed = JSON.parse(data);
            const mensaje = Array.isArray(parsed) ? parsed[0]?.response : parsed.response;
            setSuccessMsg(mensaje);
        } catch (err) { 
            setError("Error al procesar la respuesta del servidor."); 
        }
        setLoading(false);
        setDecryptingResponse(null);
    };

    const diasLabels = [
        { label: 'Lu', value: '1' }, { label: 'Ma', value: '2' }, { label: 'Mi', value: '3' },
        { label: 'Ju', value: '4' }, { label: 'Vi', value: '5' }, { label: 'Sa', value: '6' }, { label: 'Do', value: '0' }
    ];

    return (
        <div className="main-container">
            {/* Header / Nav */}
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0"><div className="depth-4-frame-1"><div className="acme-co">ASPAY</div></div></div>
                <div className="depth-3-frame-1">
                    <div className="depth-4-frame-02">
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}><div className="product">Regresar</div></div>
                    </div>
                </div>
            </div>

            <div className="listusr-content-container">
                <h1 className="listusr-title">Actualizar Programación</h1>
                
                <form className="listusr-form" style={{ maxWidth: '1000px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '15px', marginBottom: '25px' }}>
                        <div className="form-group">
                            <label>Entidad:</label>
                            <input name="entidad" value={formData.entidad} readOnly style={{ background: '#f9f9f9' }} />
                        </div>
                        <div className="form-group">
                            <label>Nombre Proceso:</label>
                            <input name="nombre_proceso" value={formData.nombre_proceso} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label>Path:</label>
                            <input name="task_path" value={formData.task_path} readOnly style={{ background: '#f9f9f9' }} />
                        </div>
                    </div>

                    {formData.configs.map((config, index) => (
                        <div key={index} className="config-card" style={{ 
                            background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', 
                            padding: '20px', marginBottom: '30px', position: 'relative' 
                        }}>
                            <button type="button" onClick={() => removeConfig(index)} 
                                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                                disabled={formData.configs.length === 1}>
                                <FaTrashAlt size={20} />
                            </button>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Día Mes (1-31)</label>
                                    <input value={config.diaMes} onChange={(e) => handleConfigChange(index, 'diaMes', e.target.value)} style={{ width: '80px', textAlign: 'center' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Mes (1-12)</label>
                                    <input value={config.mes} onChange={(e) => handleConfigChange(index, 'mes', e.target.value)} style={{ width: '80px', textAlign: 'center' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                                {diasLabels.map((dia) => {
                                    const isActive = config.diaSemana === dia.value || config.diaSemana === '*' || config.diaSemana === 7;
                                    return (
                                        <div key={dia.value} style={{ 
                                            textAlign: 'center', padding: '10px', borderRadius: '8px', 
                                            background: isActive ? '#f0f9ff' : '#fcfcfc',
                                            border: isActive ? '1px solid #3498db' : '1px solid #eee'
                                        }}>
                                            <div style={{ fontWeight: 'bold', color: isActive ? '#2980b9' : '#ccc' }}>{dia.label}</div>
                                            <input 
                                                value={isActive ? config.hora : ''} 
                                                disabled={!isActive}
                                                onChange={(e) => handleConfigChange(index, 'hora', e.target.value)}
                                                placeholder="*"
                                                style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                                            />
                                            <input 
                                                value={isActive ? config.minuto : ''} 
                                                disabled={!isActive}
                                                onChange={(e) => handleConfigChange(index, 'minuto', e.target.value)}
                                                placeholder="*"
                                                style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold' }}
                                            />
                                            <input 
                                                type="radio" 
                                                checked={config.diaSemana === dia.value} 
                                                onChange={() => handleConfigChange(index, 'diaSemana', dia.value)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                <button type="button" onClick={() => handleConfigChange(index, 'diaSemana', '*')}
                                    style={{ background: config.diaSemana === '*' ? '#3498db' : '#f1f1f1', border: 'none', padding: '5px 10px', borderRadius: '15px', cursor: 'pointer' }}>
                                    Todos los días (*)
                                </button>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addConfig} className="add-config-dashed-btn" style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '2px dashed #3498db', background: 'none', color: '#3498db', cursor: 'pointer' }}>
                        <FaPlus /> Añadir Horario
                    </button>

                    <button 
                        type="button" 
                        onClick={handleUpdate} 
                        disabled={loading || isFormInvalid()} 
                        style={{ 
                            width: '100%', padding: '15px', borderRadius: '10px',
                            background: isFormInvalid() ? '#bdc3c7' : '#2ecc71',
                            color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        {loading ? 'Actualizando...' : 'ACTUALIZAR PROGRAMACIÓN'}
                    </button>
                </form>

                {error && <div className="error-message" style={{ background: '#fdedec', color: '#e74c3c', padding: '15px', marginTop: '20px' }}><FaExclamationTriangle /> {error}</div>}
                {successMsg && <div className="success-message" style={{ background: '#eafaf1', color: '#27ae60', padding: '15px', marginTop: '20px', textAlign: 'center' }}><strong>¡Éxito!</strong> {successMsg}</div>}
            </div>

            {encrypting && <Encryptor password={encryptionPassword} message={JSON.stringify(dataToEncrypt)} onEncrypted={onEncrypted} onError={(m) => { setError(m); setLoading(false); setEncrypting(false); }} />}
            {decryptingResponse && <Decryptor encryptedMessage={decryptingResponse} password={encryptionPassword} onDecrypted={onDecrypted} onError={(e) => { setError(e); setLoading(false); setDecryptingResponse(null); }} />}
        </div>
    );
};