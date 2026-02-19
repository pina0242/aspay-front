import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
// IMPORTACIÓN CORREGIDA: Se añade FaTrashAlt
import { FaPlus, FaTrash, FaExclamationTriangle, FaTrashAlt, FaClock, FaCalendarAlt } from 'react-icons/fa'; 
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const RegSched = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [formData, setFormData] = useState({
    entidad: "7361",
    nombre_proceso: "",
    task_path: "",
    configs: [{ minuto: "*", hora: "*", diaMes: "*", mes: "*", diaSemana: "*" }]
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToEncrypt, setDataToEncrypt] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // Validaciones según el backend
  const isValidCronItem = (value, min, max) => {
    if (value === '*') return true;
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

  const handleRegister = (e) => {
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
  };

  const onEncrypted = async (encryptedBody) => {
    setEncrypting(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regsched`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
        body: JSON.stringify(encryptedBody)
      });
      const responseData = await response.json();
      if (response.status === 201 || response.status === 200) {
        setDecryptingResponse(responseData);
      } else {
        setError(Array.isArray(responseData) ? responseData[0]?.response : "Error en el registro");
        setLoading(false);
      }
    } catch (err) {
      setError("Error de red");
      setLoading(false);
    }
  };

  const onDecrypted = (data) => {
    try {
      const parsed = JSON.parse(data);
      const mensaje = Array.isArray(parsed) ? parsed[0]?.response : parsed.response;
      setSuccessMsg(mensaje);
      if (mensaje === "Exito") {
        setFormData({ entidad: "7361", nombre_proceso: "", task_path: "", configs: [{ minuto: "*", hora: "*", diaMes: "*", mes: "*", diaSemana: "*" }] });
      }
    } catch (err) { setError("Error al procesar"); }
    setLoading(false);
    setDecryptingResponse(null);
  };

  const diasLabels = [
    { label: 'Lu', value: '1' },
    { label: 'Ma', value: '2' },
    { label: 'Mi', value: '3' },
    { label: 'Ju', value: '4' },
    { label: 'Vi', value: '5' },
    { label: 'Sa', value: '6' },
    { label: 'Do', value: '0' }
  ];

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
        <h1 className="listusr-title">Registro de Tarea Programada</h1>
        
        <form className="listusr-form" style={{ maxWidth: '1000px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '15px', marginBottom: '25px' }}>
            <div className="form-group">
              <label>Entidad:</label>
              <input name="entidad" value={formData.entidad} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Nombre Proceso:</label>
              <input name="nombre_proceso" value={formData.nombre_proceso} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Path:</label>
              <input name="task_path" value={formData.task_path} onChange={handleInputChange} />
            </div>
          </div>

          <hr style={{ opacity: 0.1, margin: '20px 0' }} />

          {formData.configs.map((config, index) => (
            <div key={index} className="config-card" style={{ 
              background: '#fff', border: '1px solid #e0e0e0', borderRadius: '12px', 
              padding: '20px', marginBottom: '30px', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' 
            }}>
              
              <button type="button" onClick={() => removeConfig(index)} 
                title="Eliminar configuración"
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}
                disabled={formData.configs.length === 1}>
                <FaTrashAlt size={20} />
              </button>

              {/* Parámetros Mensuales */}
              <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Día Mes (1-31)</label>
                  <input value={config.diaMes} onChange={(e) => handleConfigChange(index, 'diaMes', e.target.value)} style={{ width: '100%', padding: '5px', textAlign: 'center' }} />
                </div>
                <div style={{ width: '120px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>Mes (1-12)</label>
                  <input value={config.mes} onChange={(e) => handleConfigChange(index, 'mes', e.target.value)} style={{ width: '100%', padding: '5px', textAlign: 'center' }} />
                </div>
                <span style={{ fontSize: '11px', color: '#999', marginTop: '15px' }}>* Use asterisco (*) para ejecución diaria/mensual</span>
              </div>

              {/* Presentación Semanal Solicitada */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', borderTop: '1px solid #f5f5f5', paddingTop: '15px' }}>
                {diasLabels.map((dia) => {
                  const isActive = config.diaSemana === dia.value || config.diaSemana === '*';
                  return (
                    <div key={dia.value} style={{ 
                      textAlign: 'center', padding: '10px', borderRadius: '8px', 
                      background: isActive ? '#f0f9ff' : '#fcfcfc',
                      border: isActive ? '1px solid #3498db' : '1px solid #eee'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', color: isActive ? '#2980b9' : '#ccc' }}>{dia.label}</div>
                      
                      <div style={{ marginBottom: '8px' }}>
                        <label style={{ fontSize: '9px', display: 'block', color: '#7f8c8d' }}>HORA</label>
                        <input 
                          value={isActive ? config.hora : ''} 
                          disabled={!isActive}
                          onChange={(e) => handleConfigChange(index, 'hora', e.target.value)}
                          placeholder="*"
                          style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '9px', display: 'block', color: '#7f8c8d' }}>MIN</label>
                        <input 
                          value={isActive ? config.minuto : ''} 
                          disabled={!isActive}
                          onChange={(e) => handleConfigChange(index, 'minuto', e.target.value)}
                          placeholder="*"
                          style={{ width: '100%', textAlign: 'center', border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 'bold' }}
                        />
                      </div>

                      <input 
                        type="radio" 
                        checked={config.diaSemana === dia.value} 
                        onChange={() => handleConfigChange(index, 'diaSemana', dia.value)}
                        style={{ marginTop: '10px', cursor: 'pointer' }}
                      />
                    </div>
                  );
                })}
              </div>

              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <button type="button" 
                  onClick={() => handleConfigChange(index, 'diaSemana', '*')}
                  style={{ background: config.diaSemana === '*' ? '#3498db' : '#f1f1f1', color: config.diaSemana === '*' ? 'white' : '#666', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer' }}>
                  Todos los días (*)
                </button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addConfig} style={{ 
            background: '#fff', color: '#3498db', border: '2px dashed #3498db', 
            width: '100%', padding: '12px', borderRadius: '10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold'
          }}>
            <FaPlus /> Añadir otra configuración de horario
          </button>

          <button 
            type="button" 
            onClick={handleRegister} 
            disabled={loading || isFormInvalid()} 
            style={{ 
              width: '100%', padding: '18px', marginTop: '30px', borderRadius: '10px',
              background: isFormInvalid() ? '#bdc3c7' : '#2ecc71',
              color: 'white', border: 'none', fontSize: '18px', fontWeight: 'bold',
              cursor: isFormInvalid() ? 'not-allowed' : 'pointer',
              boxShadow: isFormInvalid() ? 'none' : '0 4px 15px rgba(46, 204, 113, 0.3)'
            }}
          >
            {loading ? 'Guardando...' : 'GUARDAR TODA LA PROGRAMACIÓN'}
          </button>
        </form>

        {error && <div className="error-message" style={{ background: '#fdedec', color: '#e74c3c', padding: '15px', borderRadius: '8px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FaExclamationTriangle /> {error}</div>}
        {successMsg && <div className="success-message" style={{ background: '#eafaf1', color: '#27ae60', padding: '15px', borderRadius: '8px', marginTop: '20px', textAlign: 'center' }}><strong>¡Registro Exitoso!</strong> {successMsg}</div>}
      </div>

      {encrypting && <Encryptor password={encryptionPassword} message={JSON.stringify(dataToEncrypt)} onEncrypted={onEncrypted} onError={(m) => { setError(m); setLoading(false); setEncrypting(false); }} />}
      {decryptingResponse && <Decryptor encryptedMessage={decryptingResponse} password={encryptionPassword} onDecrypted={onDecrypted} onError={(e) => { setError(e); setLoading(false); setDecryptingResponse(null); }} />}
    </div>
  );
};