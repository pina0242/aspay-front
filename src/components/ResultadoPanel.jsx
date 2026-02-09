import React, { useState } from 'react';
import '../styles/calificacion.css';
import Encryptor from './Encryptor';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ResultadoPanel = ({ results, error, selectedEndpoints, formData }) => {
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveSuccess, setSaveSuccess] = useState('');
    const [encrypting, setEncrypting] = useState(false);

    if (error) {
        return (
            <div className="resultado-panel error">
                <h3>Error en la Operación</h3>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    const getResultForEndpoint = (endpointNumber) => {
        try {
            const key = `endpoint${endpointNumber}`;
            let result = results[key];
            
            if (typeof result === 'string') {
                try {
                    result = JSON.parse(result);
                } catch (e) {
                    return { raw: result };
                }
            }
            
            if (Array.isArray(result) && result.length > 0) {
                return result[0];
            }
            
            return result || null;
        } catch (err) {
            console.error(`Error obteniendo resultado para endpoint ${endpointNumber}:`, err);
            return null;
        }
    };

    const safeGet = (obj, prop, defaultValue = null) => {
        if (!obj || typeof obj !== 'object') return defaultValue;
        const props = prop.split('.');
        let current = obj;
        for (const p of props) {
            if (current && typeof current === 'object' && p in current) {
                current = current[p];
            } else {
                return defaultValue;
            }
        }
        return current;
    };
    // Función para convertir valores de riesgo a un solo carácter
    const mapRiskToSingleChar = (riskValue) => {
        if (!riskValue) return 'B'; // Valor por defecto
        
        const riskLower = riskValue.toLowerCase();
        
        // Mapeo para riesgo_geog y riesgo_act_econ
        if (riskLower.includes('bajo') || riskLower === 'b') {
            return 'B';
        } else if (riskLower.includes('medio') || riskLower === 'm') {
            return 'M';
        } else if (riskLower.includes('alto') || riskLower === 'a') {
            return 'A';
        } else if (riskLower.includes('extremo') || riskLower === 'e') {
            return 'E';
        }
        
        return 'B'; // Valor por defecto
    };

    // Función para convertir indicadores S/N
    const mapIndicatorToSN = (indicatorValue) => {
        if (!indicatorValue) return 'N';
        
        const indicatorUpper = String(indicatorValue).toUpperCase();
        return indicatorUpper === 'S' ? 'S' : 'N';
    };

    // Función para construir el JSON requerido para regcalif
    const buildRegCalifData = () => {
        // Obtener datos de todos los endpoints
        const endpoint1Data = getResultForEndpoint(1);
        const endpoint2Data = getResultForEndpoint(2);
        const endpoint4Data = getResultForEndpoint(4);
        const endpoint5Data = getResultForEndpoint(5);
        // Obtener valores base
        const riesgoGeogRaw = safeGet(endpoint1Data, 'riesgo_geog', 'B');
        const riesgoActEconRaw = safeGet(endpoint1Data, 'riesgo_act_econ', 'B');
        const indPepRaw = safeGet(endpoint2Data, 'ind_pep', 'N');
        const indListasRaw = safeGet(endpoint2Data, 'ind_listas_riesgo', 'N');
        const indMediosRaw = safeGet(endpoint2Data, 'ind_medios_adversos', 'N');
        const txAltoValorRaw = safeGet(endpoint4Data, 'tx_alto_valor', '0');
        const txSospechosasRaw = safeGet(endpoint4Data, 'tx_sospechosas', '0');
        const riesgoMovsRaw = safeGet(endpoint4Data, 'riesgo_movs', 'B');
        const scoreCrediticioRaw = safeGet(endpoint5Data, 'score_crediticio', '0');
        const cuotaMaxRaw = safeGet(endpoint5Data, 'cuota_max_sugerida', '0.0');
        
        // Convertir valores de riesgo
        const riesgoGeogMapped = mapRiskToSingleChar(riesgoGeogRaw);
        const riesgoActEconMapped = mapRiskToSingleChar(riesgoActEconRaw);
        const riesgoMovsMapped = mapRiskToSingleChar(riesgoMovsRaw);
        
        // Convertir indicadores S/N
        const riesgoPepMapped = mapIndicatorToSN(indPepRaw);
        const riesgoListSancMapped = mapIndicatorToSN(indListasRaw);
        const riesgoMedAdvMapped = mapIndicatorToSN(indMediosRaw);
        
        // Convertir a Enteros (base 10)
        const txAltoValorNum = parseInt(txAltoValorRaw, 10) || 0;
        const txSospechosasNum = parseInt(txSospechosasRaw, 10) || 0;

        // Intentamos convertir a número. Si falla (como en "No Elegible"), usamos 0.
        const scoreNum = parseInt(scoreCrediticioRaw, 10);
        const finalScore = isNaN(scoreNum) ? 0 : scoreNum;

        // Aseguramos que sea numérico para el JSON
        const scoreCrediticioValue = finalScore;
        
        // Convertir a Float (Decimal)
        const cuotaMaxNum = parseFloat(cuotaMaxRaw) || 0.0;
        
        
        // Construir el JSON según la estructura requerida
        return {
            docto_id: formData?.doc_id || "00000001R",
            tipo_id: " ", // Espacio como se especifica
            riesgo_geog: riesgoGeogMapped,
            riesgo_act_econ: riesgoActEconMapped,
            riesgo_pep: riesgoPepMapped,
            riesgo_list_sanc: riesgoListSancMapped,
            riesgo_med_adv: riesgoMedAdvMapped,
            tx_alto_valor: txAltoValorNum,       // Ahora es Number
            tx_sospechosas: txSospechosasNum,     // Ahora es Number
            riesgo_movs: riesgoMovsMapped,
            razon_riesgo_movs: safeGet(endpoint4Data, 'razon4', 'NO ESPECIFICADO'),
            score_crediticio: scoreCrediticioValue,
            razon_score_cred: safeGet(endpoint5Data, 'razon5', 'NO ESPECIFICADO'),
            cuota_max_sugerida: cuotaMaxNum      // Ahora es Float
        };
    };

    const handleSaveResults = async () => {
        setSaving(true);
        setSaveError('');
        setSaveSuccess('');
        
        // Construir los datos para regcalif
        const regCalifData = buildRegCalifData();
        
        // Iniciar proceso de encriptación
        setEncrypting(true);
    };

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);
        
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/regcalif`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            if (response.status === 401) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
                setSaveError(errorMessage);
                setSaving(false);
                return;
            }

            if (response.status === 201 || response.status === 200) {
                const responseData = await response.json();
                setSaveSuccess('Resultados guardados exitosamente');
            } else {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al guardar los resultados';
                setSaveError(errorMessage);
            }
        } catch (err) {
            console.error('Error al guardar resultados:', err);
            setSaveError('Error en la comunicación con el servidor');
        } finally {
            setSaving(false);
        }
    };

    const renderSafeValue = (value, defaultValue = 'N/A') => {
        if (value === null || value === undefined) return defaultValue;
        if (Array.isArray(value)) return value.join(', ');
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    const renderRazon = (razon) => {
        if (!razon) return 'Sin información adicional';
        if (Array.isArray(razon)) return razon.length > 0 ? razon.join(' ') : 'Sin información adicional';
        return razon;
    };

    const renderEndpoint1Results = (data) => {
        if (!data) return null;
        return (
            <div className="result-card endpoint1">
                <h4>Opción 1: Actividad Económica y Riesgo Geográfico</h4>
                <div className="result-grid">
                    <div className="result-item">
                        <span className="result-label">Riesgo Geográfico:</span>
                        <span className={`result-value risk-${safeGet(data, 'riesgo_geog', '').toLowerCase()}`}>
                            {renderSafeValue(safeGet(data, 'riesgo_geog'))}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Riesgo Act. Económica:</span>
                        <span className={`result-value risk-${safeGet(data, 'riesgo_act_econ', '').toLowerCase()}`}>
                            {renderSafeValue(safeGet(data, 'riesgo_act_econ'))}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Riesgo Total:</span>
                        <span className={`result-value risk-total risk-${safeGet(data, 'riesgo_total', '').toLowerCase()}`}>
                            {renderSafeValue(safeGet(data, 'riesgo_total'))}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderEndpoint2Results = (data) => {
        if (!data) return null;
        const indPep = safeGet(data, 'ind_pep');
        const indListas = safeGet(data, 'ind_listas_riesgo');
        const indMedios = safeGet(data, 'ind_medios_adversos');
        
        return (
            <div className="result-card endpoint2">
                <h4>Opción 2: PEP y Medios Adversos</h4>
                <div className="result-grid">
                    <div className="result-item">
                        <span className="result-label">Indicador PEP:</span>
                        <span className={`result-value indicator ${indPep === 'S' ? 'positive' : 'negative'}`}>
                            {indPep === 'S' ? 'SÍ' : 'NO'}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Listas de Riesgo:</span>
                        <span className={`result-value indicator ${indListas === 'S' ? 'positive' : 'negative'}`}>
                            {indListas === 'S' ? 'SÍ' : 'NO'}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Medios Adversos:</span>
                        <span className={`result-value indicator ${indMedios === 'S' ? 'positive' : 'negative'}`}>
                            {indMedios === 'S' ? 'SÍ' : 'NO'}
                        </span>
                    </div>
                    <div className="result-item full-width">
                        <span className="result-label">Razón:</span>
                        <span className="result-value reason">{renderRazon(safeGet(data, 'razon'))}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderEndpoint4Results = (data) => {
        if (!data) return null;
        const txSospechosas = safeGet(data, 'tx_sospechosas', 0);
        const aprobacion = safeGet(data, 'aprobacion');
        
        return (
            <div className="result-card endpoint3">
                <h4>Opción 4: Calificación de Cuenta</h4>
                <div className="result-grid">
                    <div className="result-item">
                        <span className="result-label">Transacciones Sospechosas:</span>
                        <span className={`result-value ${txSospechosas > 0 ? 'warning' : 'safe'}`}>
                            {txSospechosas}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Aprobación:</span>
                        <span className={`result-value ${aprobacion === 'S' ? 'approved' : 'rejected'}`}>
                            {aprobacion === 'S' ? 'APROBADA' : 'RECHAZADA'}
                        </span>
                    </div>
                    <div className="result-item full-width">
                        <span className="result-label">Razón:</span>
                        <span className="result-value reason">{renderRazon(safeGet(data, 'razon4'))}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderEndpoint5Results = (data) => {
        if (!data) return null;
        const score = safeGet(data, 'score_crediticio', 0);
        const cuota = safeGet(data, 'cuota_max_sugerida', 0);
        
        return (
            <div className="result-card endpoint3">
                <h4>Opción 5: Scoring Crediticio</h4>
                <div className="result-grid">
                    <div className="result-item">
                        <span className="result-label">Score Crediticio:</span>
                        <span className={`result-value ${score > 0 ? 'warning' : 'safe'}`}>
                            {score}
                        </span>
                    </div>
                    <div className="result-item">
                        <span className="result-label">Cuota Máx. Sugerida:</span>
                        <span className={`result-value ${cuota > 0 ? 'warning' : 'safe'}`}>
                            {cuota}
                        </span>
                    </div>
                    <div className="result-item full-width">
                        <span className="result-label">Razón:</span>
                        <span className="result-value reason">{renderRazon(safeGet(data, 'razon5'))}</span>
                    </div>
                </div>
            </div>
        );
    };

    const getDocId = () => {
        for (let i = 1; i <= 5; i++) {
            const data = getResultForEndpoint(i);
            const docId = safeGet(data, 'doc_id');
            if (docId) return docId;
        }
        return formData?.doc_id || 'N/A';
    };

    return (
        <div className="resultado-panel">
            <h3>Resultados de la Calificación</h3>
            <div className="results-summary">
                <div className="summary-header">
                    <span>Documento ID: {getDocId()}</span>
                    <span className="endpoints-count">
                        {selectedEndpoints.length} opción{selectedEndpoints.length !== 1 ? 'es' : ''} procesada{selectedEndpoints.length !== 1 ? 's' : ''}
                    </span>
                </div>
                
                <div className="results-container">
                    {selectedEndpoints.includes(1) && renderEndpoint1Results(getResultForEndpoint(1))}
                    {selectedEndpoints.includes(2) && renderEndpoint2Results(getResultForEndpoint(2))}
                    {selectedEndpoints.includes(4) && renderEndpoint4Results(getResultForEndpoint(4))}
                    {selectedEndpoints.includes(5) && renderEndpoint5Results(getResultForEndpoint(5))}
                </div>
                
                {/* Botón para guardar resultados */}
                <div className="save-results-section">
                    <button 
                        className="save-results-btn"
                        onClick={handleSaveResults}
                        disabled={saving || Object.keys(results).length === 0}
                    >
                        {saving ? (
                            <>
                                <span className="spinner"></span>
                                Guardando...
                            </>
                        ) : (
                            'Guardar Resultados'
                        )}
                    </button>
                    
                    {saveError && <div className="save-error-message">{saveError}</div>}
                    {saveSuccess && <div className="save-success-message">{saveSuccess}</div>}
                </div>
            </div>

            {/* Componente Encryptor para encriptar los datos */}
            {encrypting && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(buildRegCalifData())}
                    onEncrypted={handleEncryptedData}
                    onError={(errorMsg) => {
                        setSaveError(errorMsg);
                        setEncrypting(false);
                        setSaving(false);
                    }}
                />
            )}
        </div>
    );
};