import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regper.css'; // Reutilizar estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regcosto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [entidad, setEntidad] = useState('');
  const [indcost, setIndcost] = useState('');
  const [numtxlib, setNumtxlib] = useState('');
  const [costotx, setCostotx] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      entidad: entidad,
      indcost:indcost,
      num_txs_libres:numtxlib,
      costo_tx:costotx,
    };

    setEncrypting(true);
    setDataToProcess(payload); // Iniciar el proceso de cifrado
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regcosto`, {
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
        
        // Solo si contiene palabras de auth, muestra el mensaje, sino redirige
        if (AUTH_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
          setError(errorMessage);
        } else {
          window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
        }
        
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      if (response.status === 201) {
        setDataToProcess(responseData);
      } else {
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar Costo.';
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = parsedData[0]?.response;
      if (message === 'Exito') {
        setSuccess('¡Registro exitoso!');
        setTimeout(() => {
          navigate('/Listcosto', { state: { token } });
        }, 2000);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDataToProcess(null);
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
          </div>
        </div>
      </div>
      
      <div className="regusr-content-container">
        <h1 className="regusr-title">Registrar Costos para Transacciones</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>


        <div className="form-group">
          <div className="form-grid">

          
            <label htmlFor="nivel">Entidad</label>
            <input type="text" id="entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)} maxLength="8" required />
            
            <label htmlFor="nivel">Tipo Costo</label>
            <select className="form-select" aria-label="Default select example"value={indcost} onChange={(e) => setIndcost(e.target.value)}required >
              <option value="">Seleccione Tipo</option>
              <option value="B">Fijo por Uso</option>
              <option value="C">Por volumen</option>
              <option value="D">Por complejidad</option>
              <option value="E">Premiun Costo Unico</option>
            </select>
            
            <label htmlFor="nivel">Transacciones Libres</label>
            <input type="number" id="numtxlib" value={numtxlib} onChange={(e) => setNumtxlib(e.target.value)} maxLength="10" required />
            
            <label htmlFor="nivel">Costo Transaccion</label>
            <input type="number" id="costotx" value={costotx} onChange={(e) => setCostotx(e.target.value)} maxLength="10" required />
                              
          </div>
        </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Costo'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {encrypting && (
          <Encryptor
            password={encryptionPassword}
            message={JSON.stringify(dataToProcess)}
            onEncrypted={handleEncryptedData}
            onError={(errorMsg) => {
              setError(errorMsg);
              setEncrypting(false);
              setLoading(false);
            }}
          />
        )}

        {dataToProcess && !encrypting && typeof dataToProcess === 'string' && (
          <Decryptor
            encryptedMessage={dataToProcess}
            password={encryptionPassword}
            onDecrypted={handleDecryptedResponse}
            onError={(err) => {
              setError(err);
              setLoading(false);
              setDataToProcess(null);
            }}
          />
        )}
      </div>
    </div>
  );
};