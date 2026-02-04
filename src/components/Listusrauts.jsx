import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listusrauts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Recuperamos el token del estado o del storage
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [authList, setAuthList] = useState([]);
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
    setAuthList([]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listusrauts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 401) {
        setError('Su sesión ha caducado!!!');
        setLoading(false);
        return;
      }

      if (response.status !== 201) {
        const errorMessage = responseData && responseData[0]?.response 
            ? responseData[0].response 
            : 'Error al obtener la lista.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Si el status es 201, recibimos el string encriptado
      setDecryptingResponse(responseData);
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setAuthList(parsedData);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  return (
    <div className="main-container">
      {/* Cabecera / Navegación */}
      <div className="depth-2-frame-0">
        <div className="depth-3-frame-0">
          <div className="depth-4-frame-1">
            <div className="acme-co">ASPAY</div>
          </div>
        </div>
        <div className="depth-3-frame-1">
          <div className="depth-4-frame-02">
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
              <div className="product">Regresar</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regusraut', { state: { token } })}>
              <div className="product">Reg Aut/Serv</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Consulta de Usuarios Autorizadores</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha de Inicio:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Fecha de Fin:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Consultar'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {authList.length > 0 && (
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>Entidad</th>
                  <th>ID User</th>
                  <th>Servicio</th>
                  <th>Status</th>
                  <th>Email Auth</th>
                  <th>Fecha Alta</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {authList.map((item, index) => (
                  <tr key={index}>
                    <td>{item.id}</td>
                    <td>{item.entidad}</td>
                    <td>{item.iduser}</td>
                    <td>{item.Servicio}</td>
                    <td>{item.status}</td>
                    <td>{item.emailauth}</td>
                    <td>{item.fecha_alta}</td>
                    <td className="actions-cell">
                      {/* BOTÓN EDITAR -> Navega a Updusraut */}
                      <button 
                        className="edit-btn" 
                        title="Editar" 
                        onClick={() => navigate('/Updusraut', { state: { token, userToEdit: item } })}
                      >
                        <FaEdit />
                      </button>
                      
                      {/* BOTÓN ELIMINAR -> Navega a Delusraut */}
                      <button 
                        className="delete-btn" 
                        title="Eliminar"
                        onClick={() => navigate('/Delusraut', { state: { token, userToEdit: item } })}
                      >
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
          onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); }}
        />
      )}

      {decryptingResponse && !encrypting && typeof decryptingResponse === 'string' && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => { setError(err); setLoading(false); setDecryptingResponse(null); }}
        />
      )}
    </div>
  );
};