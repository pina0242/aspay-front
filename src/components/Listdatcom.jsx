import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listdatcom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');


  const [numid, setNumid] = useState('');

  const [perList, setPerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleEditClick = (item) => {
    navigate('/Upddatcom', { state: { token, userToEdit: item } });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seldcomper`, {
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
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener datos complementarios.';
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regdatcom', { state: { token } })}>
              <div className="product">Reg. Datos Com</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista datos Complementarios</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Numero de ID</label>
            <input type="number" id="numid" value={numid} onChange={(e) => setNumid(e.target.value)} />
          </div>
         
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar datos Complementarios'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {perList.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Consulta datos Complementarios</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email Principal</th>
                <th>Email Alternativo</th>
                <th>Numero Telefonico 1</th>
                <th>Numero Telefonico 2</th>
                <th>Indicador de Persona</th> 
                <th>Ingreso Maximo</th> 
                <th>Periodo de Ingreso</th> 
                <th>Moneda Ingreso</th> 
                <th>Volumen TX </th> 
                <th>Alias</th> 
                <th>Pagina WEB</th> 
                <th>Red Social 1</th> 
                <th>Red Social 2</th> 
                <th>Red Social 3</th>                                                                                                 
                <th>Direccion IP</th>                                                                 
                <th>Direccion MAC</th> 
                <th>Acciones</th>                               
              </tr>
            </thead>
            <tbody>
              {perList.map((item, index) => (
                <tr key={index}>
                  <td>{item.num_id}</td>
                  <td>{item.email_princ}</td>
                  <td>{item.email_alt}</td>
                  <td>{item.num_tel1}</td>
                  <td>{item.num_tel2}</td>
                  <td>{item.ind_pep}</td>
                  <td>{item.ingreso_max}</td>
                  <td>{item.period_ingreso}</td>
                  <td>{item.moneda_ingreso}</td>
                  <td>{item.volumen_tx}</td>
                  <td>{item.alias_nom_comer}</td>
                  <td>{item.pagina_web}</td>
                  <td>{item.red_social1}</td>
                  <td>{item.red_social2}</td>
                  <td>{item.red_social3}</td>
                  <td>{item.direcc_ip}</td>
                  <td>{item.direcc_mac}</td>


                  {/* Se corrige el anidamiento y se añade el botón de eliminación */}
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEditClick(item)}>
                      <FaEdit />
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