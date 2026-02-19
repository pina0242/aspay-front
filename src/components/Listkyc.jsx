import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listkyc.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listkyc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');


  const [numid, setNumid] = useState('');

  const [perList, setPerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleDeleteClick = (item) => {
    navigate('/Delkyc', { state: { token, userToEdit: item } });
  };
  

  
  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPerList([]);

    const payload = {
      num_id:numid,

    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selkyc`, {
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
      
      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener calificación KYC.';
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
      if (Array.isArray(parsedData)) {
        setPerList(parsedData);
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regkyc', { state: { token } })}>
              <div className="product">Reg. KYC</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listkyc-content-container">
        <h1 className="listkyc-title">Calificación KYC</h1>
        <form className="listkyc-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Numero de ID</label>
            <input type="number" id="numid" value={numid} onChange={(e) => setNumid(e.target.value)} />
          </div>
         
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar Calificación'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {perList.length > 0 && (
        <div className="kyc-table-container">
          <h2 className="grid-title">Consulta Calificación</h2>
          <table className="kyc-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Riesgo Geog</th>
                <th>Riesgo Activ Econ</th>
                <th>Ind PEP</th>
                <th>Riesgo Lista Sanciones</th> 
                <th>Riesgo Medios Adversos</th> 
                <th>Resumen Analisis</th> 
                <th>Num Tx Alto Valor</th> 
                <th>Num Tx Sospechosas</th> 
                <th>Aprobación x Movs Cta</th> 
                <th>Razon Riesgo x Movs</th> 
                <th>Score Crediticio</th> 
                <th>Razon Score</th> 
                <th>Cuota Max. Sugerida</th>                                                                                                 
                <th>Fecha Calif</th> 
                <th>Usuario de Calif</th> 
                <th>Acciones</th>                               
              </tr>
            </thead>
            <tbody>
              {perList.map((item, index) => (
                <tr key={index}>
                  <td>{item.num_id}</td>
                  <td>{item.entidad}</td>
                  <td>{item.riesgo_geog}</td>
                  <td>{item.riesgo_act_econ}</td>
                  <td>{item.riesgo_pep}</td>
                  <td>{item.riesgo_list_sanc}</td>
                  <td>{item.riesgo_med_adv}</td>
                  <td>{item.resumen_analisis}</td>
                  <td>{item.tx_alto_valor}</td>
                  <td>{item.tx_sospechosas}</td>
                  <td>{item.riesgo_movs}</td>
                  <td>{item.razon_riesgo_movs}</td>
                  <td>{item.score_crediticio}</td>
                  <td>{item.razon_score_cred}</td>
                  <td>{item.cuota_max_sugerida}</td>
                  <td>{item.fecha_alta}</td>
                  <td>{item.usuario_alta}</td>


                  {/* Se corrige el anidamiento y se añade el botón de eliminación */}
                  <td className="kyc-actions-cell">
                    <button className="kyc-delete-btn" onClick={() => handleDeleteClick(item)}>
                       <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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