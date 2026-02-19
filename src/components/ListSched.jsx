import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { FaExclamationTriangle, FaCalendarAlt, FaSync, FaArrowLeft, FaClock } from 'react-icons/fa';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ListSched = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');
    const procesoPrevio = location.state?.proceso;

    const [formData, setFormData] = useState({
        entidad: procesoPrevio?.entidad || "",
        nombre_proceso: "",
        task_path: procesoPrevio?.task_path || "",
        configs: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToEncrypt, setDataToEncrypt] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);

    // --- Lógica de Paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6; // Ajustado para tarjetas

    const currentConfigs = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return formData.configs.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, formData.configs]);

    const totalPages = Math.ceil(formData.configs.length / itemsPerPage);

    const consultarConfiguracion = useCallback(() => {
        if (!token) {
            setError("Sesión expirada o inválida. Por favor, inicie sesión de nuevo.");
            setLoading(false);
            return;
        }
        if (!procesoPrevio?.entidad || !procesoPrevio?.task_path) {
            setError("Parámetros insuficientes para la consulta.");
            setLoading(false);
            return;
        }
        setError('');
        setLoading(true);
        setDataToEncrypt({ entidad: procesoPrevio.entidad, task_path: procesoPrevio.task_path });
        setEncrypting(true);
    }, [procesoPrevio, token]);

    useEffect(() => {
        if (!token) { 
            navigate('/login'); 
            return; 
        }
        consultarConfiguracion();
    }, [token, consultarConfiguracion, navigate]);

    const onEncrypted = async (encryptedBody) => {
        setEncrypting(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/listsched`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `${token}` },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();

            if (response.status === 201 || response.ok) {
                setDecryptingResponse(responseData);
            } else {
                // Manejo de error según ListLayout (401, 400, etc)
                const errorMsg = Array.isArray(responseData) ? responseData[0]?.response : (responseData?.response || "Error en la petición.");
                setError(errorMsg);
                setLoading(false);
            }
        } catch (err) { 
            setError("Error de comunicación con el servidor."); 
            setLoading(false); 
        }
    };

    const onDecrypted = (data) => {
        try {
            const parsed = JSON.parse(data);
            const mainData = Array.isArray(parsed) ? parsed[0] : parsed;
            setFormData({
                entidad: mainData.entidad || procesoPrevio?.entidad,
                nombre_proceso: mainData.nombre_proceso || "Proceso sin nombre",
                task_path: mainData.task_path || procesoPrevio?.task_path,
                configs: mainData.configs || []
            });
            setCurrentPage(1); // Resetear a la primera página al cargar datos
        } catch (err) { 
            setError("Error al procesar datos desencriptados."); 
        }
        setLoading(false);
        setDecryptingResponse(null);
    };

    const diasLabels = [
        { label: 'Lu', value: '1' }, { label: 'Ma', value: '2' },
        { label: 'Mi', value: '3' }, { label: 'Ju', value: '4' },
        { label: 'Vi', value: '5' }, { label: 'Sa', value: '6' },
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
                <div className="header-actions">
                    <h1 className="listusr-title">Detalle de Programación</h1>
                    <button 
                        type="button" 
                        onClick={() => navigate('/UpdSched', { state: { token, proceso: formData } })}
                        disabled={loading}
                        className="add-btn-modify"
                    >
                        <FaSync /> Modificar Configuración
                    </button>
                </div>

                {loading && !formData.configs.length ? (
                    <div className="loading-state"><div className="loader">Sincronizando...</div></div>
                ) : (
                    <div className="content-layout">
                        <div className="info-general-panel">
                            <div className="form-group">
                                <label>Entidad</label>
                                <input readOnly value={formData.entidad} className="read-only-input" />
                            </div>
                            <div className="form-group">
                                <label>Proceso</label>
                                <input readOnly value={formData.nombre_proceso} className="read-only-input" />
                            </div>
                            <div className="form-group">
                                <label>Path de Tarea</label>
                                <input readOnly value={formData.task_path} className="read-only-input" />
                            </div>
                        </div>

                        <div className="section-divider">
                            <h3>Horarios Programados</h3>
                            <span className="badge">{formData.configs.length} Config(s)</span>
                        </div>

                        <div className="configs-grid">
                            {formData.configs.length === 0 ? (
                                <div className="empty-state">No hay horarios configurados.</div>
                            ) : (
                                currentConfigs.map((config, index) => (
                                    <div key={index} className="schedule-card">
                                        <div className="card-header">
                                            <div className="header-item"><FaCalendarAlt /> <span>Día Mes: <b>{config.diaMes}</b></span></div>
                                            <div className="header-item"><FaClock /> <span>Mes: <b>{config.mes}</b></span></div>
                                        </div>
                                        <div className="days-container">
                                            {diasLabels.map((dia) => {
                                                const isActive = config.diaSemana === dia.value || config.diaSemana === '*' || config.diaSemana === '7';
                                                return (
                                                    <div key={dia.value} className={`day-box ${isActive ? 'active' : 'inactive'}`}>
                                                        <span className="day-label">{dia.label}</span>
                                                        <span className="time-val">{isActive ? `${config.hora}:${config.minuto}` : '--:--'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {totalPages > 1 && (
                            <PaginationControls 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}

                        <button type="button" onClick={() => navigate(-1)} className="btn-back-full" style={{marginTop: '30px'}}>
                            <FaArrowLeft /> VOLVER A LA LISTA
                        </button>
                    </div>
                )}

                {error && (
                    <div className="error-banner" style={{marginTop: '20px'}}>
                        <FaExclamationTriangle /> <span><strong>Atención:</strong> {error}</span>
                    </div>
                )}
            </div>

            {encrypting && <Encryptor password={encryptionPassword} message={JSON.stringify(dataToEncrypt)} onEncrypted={onEncrypted} onError={(m) => { setError(m); setLoading(false); }} />}
            {decryptingResponse && <Decryptor encryptedMessage={decryptingResponse} password={encryptionPassword} onDecrypted={onDecrypted} onError={(e) => { setError(e); setLoading(false); }} />}

            <style>{`
                /* Estilos previos mantenidos... */
                .pagination-btn { padding: 8px 12px; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; transition: all 0.2s; }
                .pagination-btn:disabled { cursor: not-allowed; opacity: 0.5; }
                .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; flex-wrap: wrap; gap: 10px; }
                .add-btn-modify { background: #2ecc71; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: background 0.3s; }
                .info-general-panel { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
                .read-only-input { background: white; border: 1px solid #dcdde1; padding: 10px; border-radius: 6px; width: 100%; color: #2c3e50; font-weight: 500; }
                .configs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 20px; }
                .schedule-card { background: white; border: 1px solid #e0e0e0; border-radius: 15px; padding: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .days-container { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
                .day-box { display: flex; flex-direction: column; align-items: center; padding: 8px 2px; border-radius: 8px; border: 1px solid #eee; }
                .day-box.active { background: #ebf5ff; border-color: #3498db; }
                .day-label { font-size: 11px; font-weight: bold; color: #95a5a6; }
                .time-val { font-size: 10px; font-weight: bold; }
                .error-banner { background: #fdedec; color: #e74c3c; padding: 15px; border-radius: 8px; display: flex; align-items: center; gap: 10px; border: 1px solid #fadbd8; }
            `}</style>
        </div>
    );
};

// Subcomponente de Paginación Reutilizado
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '5px' }}>
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        &laquo;
                    </button>
                </li>
                {pageNumbers.map(n => (
                    <li key={n}>
                        <button 
                            onClick={() => onPageChange(n)} 
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: n === currentPage ? '#beb6ecff' : 'white',
                                color: n === currentPage ? 'white' : 'black',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            {n}
                        </button>
                    </li>
                ))}
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
};