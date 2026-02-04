import React, { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; // Puedes reutilizar o crear un nuevo CSS para las estadísticas
import '../styles/Analytics.css'; // Usaremos el CSS del componente de Analíticas

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

// Configuración para el renderizado, similar a la del componente Analytics
const statsEndpoints = [
  { urlKey: 'stats5', title: 'Servicios Ejecutados:', type: 'counter' },
  { urlKey: 'stats1', title: 'Estadísticas de Uso por Servicio', type: 'bar', dataKey: 'Conteo' },
  { urlKey: 'stats4', title: 'Tiempo Promedio de Ejecución por Servicio', type: 'bar', dataKey: 'TiempoPromedio' },
  { urlKey: 'stats2', title: 'Porcentaje Transaccional (2xx)', type: 'percentageBar', dataKey: 'count' },
  { urlKey: 'stats3', title: 'Servicios con Códigos 500', type: 'percentageBar', dataKey: 'Count' },
];

export const Stats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statsData, setStatsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const processData = useCallback((key, data) => {
    try {
      const endpointConfig = statsEndpoints.find(e => e.urlKey === key);

      switch(key) {
        case 'stats5':
          return { conteo: data.conteo };
        case 'stats1':
        case 'stats4':
          return data.map(item => ({
            label: item.Servicio,
            value: endpointConfig.dataKey === 'TiempoPromedio' ? parseFloat(item[endpointConfig.dataKey]).toFixed(4) : item[endpointConfig.dataKey]
          }));
        case 'stats2':
        case 'stats3':
          return data.map(item => ({
            label: item.Servicio,
            value: item[endpointConfig.dataKey] || 0
          }));
        default:
          return data;
      }
    } catch (err) {
      console.error(`Error procesando ${key}:`, err.message, data);
      throw new Error(`Error en formato de datos para ${key}`);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token) {
        setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
        return;
    }
    setLoading(true);
    setError('');
    setStatsData({});

    const payload = {
      fecini: startDate || "0001-01-01",
      fecfin: endDate || "9999-12-31"
    };

    setEncrypting(true);
    setDecryptingResponse(payload); // Se usa temporalmente para el Encryptor
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener las estadísticas.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      setDecryptingResponse(responseData);

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (typeof parsedData === 'object' && parsedData !== null) {
        let processedStats = {};
        for (const key in parsedData) {
          if (parsedData.hasOwnProperty(key)) {
            processedStats[key] = processData(key, parsedData[key]);
          }
        }
        setStatsData(processedStats);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  return (
    <div className="main-container">
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Estadísticas de la Aplicación</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Fecha de Inicio:</label>
            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Fecha de Fin:</label>
            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar Estadísticas'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Cargando estadísticas...</div>}

        {Object.keys(statsData).length > 0 && (
          <div className="dashboard">
            {statsEndpoints.map(({ urlKey, title, type }) => (
              statsData[urlKey] && (
                <div key={urlKey} className="chart-container">
                  <h3>{title}</h3>
                  {type === 'counter' && (
                    <div className="big-counter">
                      {statsData[urlKey].conteo}
                    </div>
                  )}
                  {type === 'bar' && (
                    <div className="classic-bar-chart">
                      {statsData[urlKey].map((item, i) => {
                        const values = statsData[urlKey].map(d => parseFloat(d.value));
                        const maxValue = Math.max(...values);
                        return (
                          <div key={i} className="bar-item">
                            <div className="bar-label">{item.label}</div>
                            <div className="bar">
                              <div
                                className="bar-fill"
                                style={{
                                  width: `${(parseFloat(item.value) / maxValue * 100)}%`
                                }}
                              >
                                {item.value}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {type === 'percentageBar' && (
                    <div className="percentage-bar-chart">
                      {statsData[urlKey]
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => {
                          const total = statsData[urlKey].reduce((sum, d) => sum + Number(d.value), 0);
                          const percent = total > 0 ? (Number(item.value) / total * 100) : 0;
                          const hue = (index * 360) / statsData[urlKey].length;

                          return (
                            <div key={index} className="percentage-bar-item">
                              <div className="service-name">
                                {item.label}
                              </div>
                              <div className="bar-container">
                                <div
                                  className="bar-fill"
                                  style={{
                                    width: `${percent}%`,
                                    backgroundColor: `hsl(${hue}, 70%, 50%)`
                                  }}
                                >
                                  {percent.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(decryptingResponse)}
          onEncrypted={handleEncryptedData}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
            setLoading(false);
          }}
        />
      )}

      {decryptingResponse && !encrypting && typeof decryptingResponse === 'string' && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => {
            setError(err);
            setLoading(false);
            setDecryptingResponse(null);
          }}
        />
      )}
    </div>
  );
};