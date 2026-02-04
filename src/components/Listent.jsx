import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entList, setEntList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setEntList([]);

    // Payload con fechas capturadas o valores por defecto
    const payload = {
      fecha_inicio: startDate || "0001-01-01",
      fecha_fin: endDate || "9999-12-31"
    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      // Error 401: Sesión caducada
      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Error 400: Desplegar valor del response sin decriptar
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error en la solicitud (400).';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Éxito 201: Proceder a desencriptar
      if (response.status === 201) {
        const responseData = await response.json();
        setDecryptingResponse(responseData);
      } else {
        setError('Error al obtener la lista de entidades.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Error en el API:', err);
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setEntList(parsedData);
      } else {
        setError('Formato de datos incorrecto.');
      }
    } catch (err) {
      console.error("Error al procesar respuesta descifrada:", err);
      setError("Error al procesar los datos recibidos.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  return (
    <div className="main-container">
      {/* Cabecera estándar de ASPAY */}
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
        <h1 className="listusr-title">Listado de Entidades</h1>
        
        {/* Formulario de Fechas */}
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Fecha de Inicio:</label>
            <input 
              type="date" 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">Fecha de Fin:</label>
            <input 
              type="date" 
              id="endDate" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar Entidades'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {/* Tabla de Resultados */}
        {entList.length > 0 && (
          <div className="table-container">
            <h2 className="grid-title">Entidades Registradas</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Entidad</th>
                  <th>Nombre</th>
                </tr>
              </thead>
              <tbody>
                {entList.map((ent, index) => (
                  <tr key={index}>
                    <td>{ent.entidad}</td>
                    <td>{ent.nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Componentes de Seguridad */}
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