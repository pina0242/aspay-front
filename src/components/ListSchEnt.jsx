import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import { FaTrashAlt, FaSearch } from 'react-icons/fa'; 
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ListSchEnt = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');
  
  const [entidad, setEntidad] = useState(''); 
  const [schedList, setSchedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleConsultar = (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSchedList([]);
    
    const payload = { entidad: entidad };
    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listschent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json().catch(() => null);

      if (response.status === 200 || response.status === 201) {
        setDecryptingResponse(responseData);
      } else {
        // Manejo de errores similar a ListLayout
        const errorMsg = responseData?.[0]?.response || 'Error inesperado al obtener la lista.';
        setError(errorMsg);
        
        if (response.status === 401) {
          setTimeout(() => navigate('/login'), 2000);
        }
        setLoading(false);
      }
    } catch (err) {
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setSchedList(parsedData);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      setError("Error al procesar los datos recibidos.");
    }
    setLoading(false);
    setDecryptingResponse(null);
  };

  // Navegación de acciones
  const handleConsultarClick = (item) => navigate('/ListSched', { state: { token, proceso: item } });
  const handleBorrarClick = (item) => navigate('/Delsched', { state: { token, procesoToDelete: item } });

  // Paginación (Consistente con ListLayout: 10 items)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return schedList.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, schedList]);
  
  const totalPages = Math.ceil(schedList.length / itemsPerPage);

  return (
    <div className="main-container">
      {/* HEADER */}
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/RegSched', { state: { token } })}>
              <div className="product">Reg_Scheduler</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Programación de Procesos (Schedule)</h1>
        
        <form className="listusr-form" onSubmit={handleConsultar}>
            <div className="form-group">
                <label>Entidad a Consultar:</label>
                <input 
                    type="text" 
                    value={entidad} 
                    onChange={(e) => setEntidad(e.target.value)}
                    placeholder="Ej: 0001"
                    required
                />
            </div>
            <button type="submit" disabled={loading || encrypting}>
                {loading ? 'Cargando...' : 'Obtener Procesos'}
            </button>
        </form>

        {error && <div className="error-message" style={{marginTop: '20px'}}>{error}</div>}

        {schedList.length > 0 && (
          <div className="container">
            <ScheduleTable 
              items={currentItems} 
              onConsultar={handleConsultarClick}
              onBorrar={handleBorrarClick}
              isProcessing={loading}
            />
            {totalPages > 1 && (
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
          </div>
        )}
      </div>

      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(dataToProcess)}
          onEncrypted={handleEncryptedData}
          onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); }}
        />
      )}

      {decryptingResponse && (
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

// --- Subcomponentes ---

const ScheduleTable = ({ items, onConsultar, onBorrar, isProcessing }) => (
  <div className="table-container">
    <h2 className="grid-title">Procesos Programados</h2>
    <table className="user-table">
      <thead>
        <tr>
          <th style={{ width: '100px' }}>Acciones</th>
          <th>Entidad</th>
          <th>Proceso</th>
          <th>Path Tarea</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td className="actions-cell">
              <button 
                className="icon-btn" 
                onClick={() => onConsultar(item)} 
                disabled={isProcessing}
                title="Consultar/Editar"
              >
                <FaSearch />
              </button>
              <button 
                className="icon-btn" 
                onClick={() => onBorrar(item)} 
                disabled={isProcessing}
                title="Borrar Proceso"
              >
                <FaTrashAlt style={{ color: '#e74c3c' }} />
              </button>
            </td>
            <td>{item.entidad}</td>
            <td>{item.nombre_proceso}</td>
            <td>{item.task_path}</td>
            <td>{item.is_active ? 'Activo' : 'Inactivo'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '5px' }}>
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        style={{ padding: '8px 12px', cursor: 'pointer' }}
                    >
                        &laquo;
                    </button>
                </li>
                {pageNumbers.map(n => (
                    <li key={n}>
                        <button 
                            onClick={() => onPageChange(n)} 
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: n === currentPage ? '#beb6ecff' : 'white',
                                color: n === currentPage ? 'white' : 'black',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            {n}
                        </button>
                    </li>
                ))}
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        style={{ padding: '8px 12px', cursor: 'pointer' }}
                    >
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
};