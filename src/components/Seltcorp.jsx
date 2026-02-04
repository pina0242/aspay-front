import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Seltcorp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [llave, setLlave] = useState('');
  const [corporationList, setCorporationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleEditClick = (corporation) => {
  navigate('/updtacorp', { state: { token, userToEdit: corporation } });
  };

  const handleDeleteClick = (corporation) => {
navigate('/Deltacorp', { state: { token, userToDelete: corporation } });
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
    setCorporationList([]);

    const payload = {
      llave: llave || "00000000"
    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seltcorp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: encryptedBody
      });

      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener la lista de registros corporativos.';
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
        setCorporationList(parsedData);
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/regtcorp', { state: { token } })}>
              <div className="product">Agregar Llave</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista de Valores Corporativos</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="llave">Llave:</label>
            <input 
              type="text" 
              id="llave" 
              value={llave} 
              onChange={(e) => setLlave(e.target.value)} 
              maxLength="8"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar llaves corporativas'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {corporationList.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Valores Corporativos Registrados</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Llave</th>
                <th>Clave</th>
                <th>Datos</th>
                <th>Estatus</th>
                <th>Fecha de Alta</th>
                <th>Usuario de Alta</th>
                <th>Fecha de Modificación</th>
                <th>Usuario de Modificación</th>
                <th>Acciones</th> 
              </tr>
            </thead>
            <tbody>
              {corporationList.map((corp, index) => (
                <tr key={index}>
                  <td>{corp.id}</td>
                  <td>{corp.llave}</td>
                  <td>{corp.clave}</td>
                  <td>{corp.datos}</td>
                  <td>{corp.status}</td>
                  <td>{corp.fecha_alta}</td>
                  <td>{corp.usuario_alta}</td>
                  <td>{corp.fecha_mod}</td>
                  <td>{corp.usuario_mod}</td>
                  <td className="actions-cell">
                    <button className="edit-btn" onClick={() => handleEditClick(corp)}>
                      <FaEdit />
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(corp)}>
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