import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listnivtran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [nivtranList, setNivtranList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  const handleEditClick = (item) => {
    navigate('/Updnivtran', { state: { token, userToEdit: item } });
  };
  
  // Función para manejar la eliminación
  const handleDeleteClick = (item) => {
    // Redirige al componente Delnivtran y pasa los datos del item
    navigate('/Delnivtran', { state: { token, userToEdit: item } });
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
    setNivtranList([]);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listnivtran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener la lista de niveles de transacción.';
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
        setNivtranList(parsedData);
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/regnivtran', { state: { token } })}>
              <div className="product">Reg_Tran</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista de Niveles de Transacción</h1>
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
            {loading ? 'Cargando...' : 'Consultar Niveles de Transacción'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {nivtranList.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Niveles de Transacción</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Entidad</th>
                <th>Servicio</th>
                <th>Nivel</th>
                <th>IndAuth</th>
                <th>IndCost</th>
                <th>IndMon</th>
                <th>IndExc</th>
                <th>ImpMax</th>
                <th>Fecha de Alta</th>
                <th>Usuario Alta</th>
                <th>Acciones</th> 
              </tr>
            </thead>
            <tbody>
              {nivtranList.map((item, index) => (
                <tr key={index}>
                  <td>{item.id}</td>
                  <td>{item.entidad}</td>
                  <td>{item.Servicio}</td>
                  <td>{item.nivel}</td>
                  <td>{item.indauth}</td>
                  <td>{item.indcost}</td>
                  <td>{item.indmon}</td>
                  <td>{item.indexc}</td>
                  <td>{item.impmax}</td>
                  <td>{item.fecha_alta}</td>
                  <td>{item.usuario_alt}</td>
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