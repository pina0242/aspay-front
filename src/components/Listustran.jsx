import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; // Reutilizamos los estilos de lista para mantener consistencia

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listustran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tranList, setTranList] = useState([]);
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
    setTranList([]);

    // Payload con valores por defecto si están vacíos
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listustran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      // Manejo de Error 401 (No autorizado/Sesión caducada)
      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Manejo de Error 400 (Solicitud incorrecta - Según requerimiento, desplegar valor sin decriptar)
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error en la solicitud (400).';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Respuesta Exitosa 201
      if (response.status === 201) {
        const responseData = await response.json();
        setDecryptingResponse(responseData);
      } else {
        setError('Error inesperado al obtener la lista transaccional.');
        setLoading(false);
      }

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setTranList(parsedData);
      } else {
        setError('El formato de respuesta no es una lista válida.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Error al procesar los datos recibidos.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  return (
    <div className="main-container">
      {/* Header idéntico a Principal/Listusr */}
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
        <h1 className="listusr-title">Uso Transaccional</h1>
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
            {loading ? 'Consultando...' : 'Consultar Transacciones'}
          </button>
        </form>

        {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

        {tranList.length > 0 && (
          <div className="table-container">
            <h2 className="grid-title">Resultados de Uso</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Entidad</th>
                  <th>Indicador Costo</th>
                  <th>Servicio</th>
                  <th>Cantidad</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {tranList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.entidad}</td>
                    <td>{item.indcost}</td>
                    <td>{item.Servicio}</td>
                    <td>{item.cantidad}</td>
                    <td>{item.costo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lógica de Encriptación */}
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

      {/* Lógica de Desencriptación */}
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