import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt,FaTasks  } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listcta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');


  const [tknper, setTknper] = useState('');

  const [perCta, setPerCta] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleEditClick = (item) => {
    navigate('/Updcta', { state: { token, userToEdit: item } });
  };
  
  // Función para manejar la eliminación
  const handleDeleteClick = (item) => {
    // Redirige al componente Delcta y pasa los datos del item
    navigate('/Delcta', { state: { token, userToEdit: item } });
  };
    // Función para asignar categoria
  const handleCategoriaClick = (item) => {
    // Redirige al componente Delcta y pasa los datos del item
    navigate('/Updcta', { state: { token, userToEdit: item } });
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
    setPerCta([]);

    const payload = {
      tknper:tknper,

    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selctas`, {
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

      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener Cuenta.';
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
        setPerCta(parsedData);
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regcta', { state: { token } })}>
              <div className="product">Registra Cta</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista Cuentas</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Token Persona</label>
            <input type="text" id="tknper" value={tknper} onChange={(e) => setTknper(e.target.value)} />
          </div>
         
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar Cuentas'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {perCta.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Consulta Cuentas</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Tknper</th>
                <th>Pais</th>
                <th>Moneda</th>
                <th>Tipo cambio</th>
                <th>EntBan</th>
                <th>Tipo</th>
                <th>Alias</th>
                <th>Cuenta</th> 
                <th>IndOper</th>
                <th>Categoria</th>
                <th>Fecha de Alta </th> 
                <th>Usuario de Alta</th> 
                <th>Fecha de Modificacion</th> 
                <th>Usuario Modificacion</th> 
                <th>Acciones</th>                               
              </tr>
            </thead>
            <tbody>
              {perCta.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.entidad}</td>
                  <td>{item.tknper}</td>
                  <td>{item.pais}</td>
                  <td>{item.moneda}</td>
                  <td>{item.tipo_cambio}</td>
                  <td>{item.entban}</td>
                  <td>{item.tipo}</td>
                  <td>{item.alias}</td>
                  <td>{item.datos}</td>
                  <td>{item.indoper}</td>
                  <td>{item.categoria}</td>
                  <td>{item.fecha_alta}</td>
                  <td>{item.usuario_alta}</td>
                  <td>{item.fecha_mod}</td>
                  <td>{item.usuario_mod}</td>

                  {/* Se corrige el anidamiento y se añade el botón de eliminación */}
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEditClick(item)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(item)}>
                      <FaTrashAlt />
                    </button>
                    <button className="edit-btn" onClick={() => handleCategoriaClick(item)}>
                      <FaTasks  />
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