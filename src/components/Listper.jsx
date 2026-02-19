import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [idpersona, setIdpersona] = useState('');
  const [entidad, setEntidad] = useState('');
  const [numid, setNumid] = useState('');
  const [nombre, setNombre] = useState('');
  const [appaterno, setAppaterno] = useState('');
  const [apmaterno, setApmaterno] = useState('');
  const [perList, setPerList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleEditClick = (item) => {
    navigate('/Updper', { state: { token, userToEdit: item } });
  };
  
  // Función para manejar la eliminación
  const handleDeleteClick = (item) => {
    // Redirige al componente Delper y pasa los datos del item
    navigate('/Delper', { state: { token, userToEdit: item } });
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
      entidad:entidad,
      num_id:numid,
      id_persona: idpersona,
      nombre:nombre,
      ap_paterno:appaterno,
      ap_materno:apmaterno,
    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seldgenper`, {
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
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener la lista Personas.';
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regdgenper', { state: { token } })}>
              <div className="product">Reg_Per</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista de Personas</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Entidad</label>
            <input type="number" id="entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Numero de ID</label>
            <input type="number" id="numid" value={numid} onChange={(e) => setNumid(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="idpersona">ID de Persona</label>
            <input type="text" id="idpersona" value={idpersona} onChange={(e) => setIdpersona(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="appaterno">Apellido Paterno</label>
            <input type="text" id="appaterno" value={appaterno} onChange={(e) => setAppaterno(e.target.value)} />
          </div>       
          <div className="form-group">
            <label htmlFor="apmaterno">Apellido Materno</label>
            <input type="text" id="apmaterno" value={apmaterno} onChange={(e) => setApmaterno(e.target.value)} />
          </div>                             
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar Personas'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {perList.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Consulta de Persona</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Persona</th>
                <th>Tipo de Identificacion</th>
                <th>Nombre</th>
                <th>Apellido Paterno</th>
                <th>Apellido Materno</th>
                <th>Genero</th> 
                <th>Tipo de Persona</th> 
                <th>Tipo de Cliente</th> 
                <th>Fecha de Nacto</th> 
                <th>Ocupacion</th>
                <th>Act Economica</th> 
                <th>Giro</th> 
                <th>Pais Nacto</th>
                <th>Nacionalidad</th> 
                <th>Estado Civil</th> 
                <th>Num. Reg. Mercantil</th> 
                <th>Ind. Pers. Migrada</th>                                                                                                 
                <th>Avanreg</th>                                                                 
                <th>Fecha Alta</th> 
                <th>Token</th>    
                <th>Acciones</th>                                  
              </tr>
            </thead>
            <tbody>
              {perList.map((item, index) => (
                <tr key={index}>
                  <td>{item.num_id}</td>
                  <td>{item.entidad}</td>
                  <td>{item.id_persona}</td>
                  <td>{item.tipo_id}</td>                 
                  <td>{item.nombre}</td>
                  <td>{item.ap_paterno}</td>
                  <td>{item.ap_materno}</td>
                  <td>{item.genero}</td>
                  <td>{item.tipo_per}</td>
                  <td>{item.tipo_cte}</td>
                  <td>{item.fecha_nac_const}</td>
                  <td>{item.ocupacion}</td>
                  <td>{item.actecon}</td>
                  <td>{item.giro}</td>
                  <td>{item.pais_nac_const}</td>
                  <td>{item.nacionalidad}</td>
                  <td>{item.estado_civil}</td>
                  <td>{item.num_reg_mercantil}</td>
                  <td>{item.ind_pers_migrada}</td>
                  <td>{item.avanreg}</td>
                  <td>{item.fecha_alta}</td>
                  <td>{item.tknper}</td>

                  {/* Se corrige el anidamiento y se añade el botón de eliminación */}
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEditClick(item)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(item)}>
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