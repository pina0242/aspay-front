import React, { useState, useEffect,useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listpdet = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, id, entidad, filename } = location.state || {};

  const [detailList, setDetailList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  useEffect(() => {
    if (!token || !id || !entidad || !filename) {
      setError("Datos de transacción incompletos. Por favor, regrese a la lista y seleccione un registro válido.");
    } else {
      setLoading(true);
      setError('');
      setDetailList([]);
      
      const payload = {
        id: id,
        entidad: entidad,
        filename: filename,
      };

      setDataToProcess(payload);
      setEncrypting(true);
    }
  }, [token, id, entidad, filename]);


  useEffect(() => {
    if (detailList.length > 0) {
      setCurrentPage(1); // Siempre empezar en la página 1 con nuevos datos
    }
  }, [detailList]);


  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/listpdet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });
      
      if (response.status === 201) {
        const responseData = await response.json();
        setDecryptingResponse(responseData);
      } else if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.msg === "Token has expired") {
          setError("Su sesión ha expirado. Por favor, inicie sesión nuevamente.");
          setTimeout(() => {
            navigate('/login');
          }, 3000); 
        } else {
          const errorMessage = errorData?.[0]?.response || 'Error de autenticación.';
          setError(errorMessage);
        }
        setLoading(false);
      } else {
        const responseData = await response.json();
        const errorData = responseData?.[0]?.response || 'Error al obtener los detalles de la transacción.';
        setError(errorData);
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
      if (Array.isArray(parsedData)) {
        setDetailList(parsedData);
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
  
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; 


  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return detailList.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage,detailList]);

  // 2. CÁLCULO DEL TOTAL DE PÁGINAS
  const totalPages = Math.ceil(detailList.length / itemsPerPage);

  // 3. FUNCIÓN PARA CAMBIAR DE PÁGINA
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
          </div>
        </div>
      </div>

      <div className="listusr-content-container">
        <h1 className="listusr-title">Detalle de Transacción</h1>
        <p className="subtitle"> Archivo: {filename}</p>

        {loading && <div className="loading-message">Cargando detalles...</div>}
        {error && <div className="error-message">{error}</div>}

    <div className="container">

      
      {/* Lista de elementos de la página actual */}
      <ItemList items={currentItems} />
      
     {detailList.length > 0 && (
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        />
      )}
    </div>
    
      </div>

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

      {decryptingResponse && !encrypting && (
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

const ItemList = ({ items }) => (



  
    <div className="table-container"  style={{width:'800px'}}>
      <h2 className="grid-title">Resultados de Detalle</h2>
        <table className="user-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Alias Origen</th>
            <th>Alias Destino</th>
            <th>Concepto</th>
            <th>Importe</th>
            <th>Fecha de Ejecución</th>
            <th>Estatus</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.cliente}</td>
              <td>{item.aliasori}</td>
              <td>{item.aliasdes}</td>
              <td>{item.concepto}</td>
              <td>{item.importe}</td>
              <td>{item.fecha_ejec}</td>
              <td>{item.status}</td>
              <td>{item.error}</td>
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
            style={buttonStyle}
          >
            &laquo; Anterior
          </button>
        </li>

    
        {pageNumbers.map(number => (
          <li key={number}>
            <button
              onClick={() => onPageChange(number)}
              style={numberButtonStyle(number === currentPage)}
            >
              {number}
            </button>
          </li>
        ))}

        <li>
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={buttonStyle}
          >
            Siguiente &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};


const buttonStyle = {
  padding: '8px 15px',
  cursor: 'pointer',

};

const numberButtonStyle = (isActive) => ({
  ...buttonStyle,
  backgroundColor: isActive ? '#beb6ecff' : 'white',
  color: isActive ? 'white' : 'black',
  borderColor: isActive ? '#565e68ff' : '#ccc',
  fontWeight: isActive ? 'bold' : 'normal',
});