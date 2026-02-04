import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEye } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

// --- Componente Modal de Autorización ---
const AuthorizationModal = ({ authFolio, onClose, setParentError, setEncrypting, setDecryptingResponse, setCurrentAction }) => {
  const [otp, setOtp] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthorize = (e) => {
    e.preventDefault();
    setModalError('');
    
    if (otp.length !== 6 || isNaN(otp)) {
      setModalError('Por favor, ingresa un código OTP válido de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    
    // 1. Conformar el JSON para la encriptación (/valotp)
    const payload = { codigo: otp };
    
    // 2. Iniciar el proceso de encriptación
    setCurrentAction('authorize');
    setEncrypting(true);
    setDecryptingResponse({ payload, action: 'authorize' }); // Enviar al Encryptor
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Autorización Requerida</h2>
          <button className="close-button" onClick={onClose} disabled={isSubmitting}>&times;</button>
        </div>
        <p className="modal-message">
          Va a autorizar el folio **{authFolio}**.
        </p>
        <form onSubmit={handleAuthorize}>
          <div className="form-group">
            <label htmlFor="otp">Código OTP (6 dígitos):</label>
            <input 
              type="text" 
              id="otp" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              maxLength="6"
              disabled={isSubmitting}
              required
            />
          </div>
          
          {modalError && <div className="error-message">{modalError}</div>}

          <div className="modal-actions">
            <button type="submit" className="authorize-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Verificando...' : 'Autorizar'}
            </button>
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Componente Principal Lisauts ---
export const Lisauts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [authList, setAuthList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para manejo de encriptación/desencriptación
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null); // Puede ser string (respuesta) o objeto (payload)

  // Estados para el Modal de Autorización
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAuthFolio, setSelectedAuthFolio] = useState(null);
  
  // Estados para ejecutar el servicio final
  const [selectedServiceEndpoint, setSelectedServiceEndpoint] = useState(null);
  const [selectedServicePayload, setSelectedServicePayload] = useState(null); // JSON string de DatosIn
  
  // Flag para saber la acción actual: 'list', 'authorize', 'resolve_auth', 'execute_service'
  const [currentAction, setCurrentAction] = useState('list'); 

  // Función para abrir el modal
  const handleViewClick = (auth) => {
    setSelectedAuthFolio(auth.folauth);
    // Guardar los datos del servicio para el paso final
    setSelectedServiceEndpoint(auth.Servicio);
    setSelectedServicePayload(auth.DatosIn); // Esto es un JSON string
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAuthFolio(null);
    setSelectedServiceEndpoint(null);
    setSelectedServicePayload(null);
    setCurrentAction('list');
    // Si la resolución falla, el error ya fue establecido.
    if (!loading) { // Previene limpiar errores si está en medio de una carga
        setError(''); 
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  // Maneja el envío del formulario para obtener la lista de autorizaciones
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setAuthList([]); 

    const payload = {
      fecha_inicio: startDate || "0001-01-01",
      fecha_fin: endDate || "9999-12-31"
    };

    setCurrentAction('list');
    setEncrypting(true);
    setDecryptingResponse({ payload, action: 'list' }); // Enviar al Encryptor con una acción de listado
  };

  // Se ejecuta después de que los datos de la solicitud han sido encriptados (LIST, AUTH, RESOLVE o EXECUTE)
  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);
    
    // Determinar la URL
    let apiUrl, requiresDecryption = false;
    let successMessage = '';
    
    // 1. Configuración de la acción actual
    if (currentAction === 'list') {
      apiUrl = `${import.meta.env.VITE_API_URL}/lisauts`;
      requiresDecryption = true;
    } else if (currentAction === 'authorize') {
      apiUrl = `${import.meta.env.VITE_API_URL}/valotp`;
      requiresDecryption = false;
    } else if (currentAction === 'resolve_auth') {
        apiUrl = `${import.meta.env.VITE_API_URL}/resaut`;
        requiresDecryption = false; 
    } else if (currentAction === 'execute_service') {
        // Ejecución del endpoint dinámico
        apiUrl = `${import.meta.env.VITE_API_URL}${selectedServiceEndpoint}`;
        requiresDecryption = false; // La respuesta del servicio final no se desencripta
        successMessage = `Servicio ${selectedServiceEndpoint} ejecutado correctamente.`;
    } else {
      setError('Acción desconocida.');
      setLoading(false);
      return;
    }

    try {
      // 2. Llamada al API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      // 3. Manejo de status 401
      if (response.status === 401) {
        setError('Su sesión ha caducado!!!');
        setLoading(false);
        handleCloseModal();
        return;
      }
      
      const responseData = await response.json().catch(() => null);

      // 4. Manejo de status 400 (y otros errores que no sean 201)
      if (response.status !== 201) {
        // Recuperar el mensaje de error del backend
        const errorMessage = responseData && Array.isArray(responseData) && responseData[0]?.response 
            ? responseData[0].response 
            : `Error ${response.status} al procesar la solicitud para ${currentAction}.`;
        
        setError(errorMessage);
        
        // Si el error ocurre durante la autorización, resolución o ejecución, mostramos alerta y cerramos el modal/proceso.
        if (currentAction !== 'list') {
            alert(`Error en ${currentAction}: ${errorMessage}`);
            handleCloseModal();
        }

        setLoading(false);
        setDecryptingResponse(null);
        return;
      }
      
      // 5. Manejo de status 201 (Éxito y Encadenamiento)

      if (currentAction === 'authorize') {
        // Éxito en /valotp -> Iniciar el proceso de /resaut
        
        const resolvePayload = { folauth: selectedAuthFolio };
        
        setCurrentAction('resolve_auth');
        setEncrypting(true);
        setDecryptingResponse({ payload: resolvePayload, action: 'resolve_auth' }); 

      } else if (currentAction === 'resolve_auth') {
        // Éxito en /resaut -> Iniciar el proceso de execute_service
        
        alert(`Folio ${selectedAuthFolio} autorizado correctamente. Ejecutando servicio ${selectedServiceEndpoint}...`);

        setCurrentAction('execute_service');
        setEncrypting(true);
        // El payload es el JSON string de DatosIn, convertido a objeto para el Encryptor
        setDecryptingResponse({ payload: JSON.parse(selectedServicePayload), action: 'execute_service' }); 

      } else if (currentAction === 'execute_service') {
        // Éxito en execute_service -> Proceso completado
        alert(successMessage);
        handleCloseModal(); 
        // Recargar la lista de autorizaciones después de la ejecución exitosa.
        handleSubmit({ preventDefault: () => {} }); 

      } else if (currentAction === 'list' && requiresDecryption) {
        // Éxito en /lisauts -> iniciar desencriptación
        setDecryptingResponse(responseData);
      } else {
        setLoading(false);
        setDecryptingResponse(null);
      }

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
      handleCloseModal();
    }
  };

  // Se ejecuta después de que la respuesta del API ha sido desencriptada (Solo para LISTADO)
  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (Array.isArray(parsedData)) {
        setAuthList(parsedData);
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
      {/* --- Encabezado y Navegación --- */}
      <div className="depth-2-frame-0">
        <div className="depth-3-frame-0">
          <div className="depth-4-frame-0"></div>
          <div className="depth-4-frame-1">
            <div className="acme-co">BALQUILER</div>
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
      
      {/* --- Contenido Principal --- */}
      <div className="listusr-content-container">
        <h1 className="listusr-title">Lista de Autorizaciones</h1>
        
        {/* --- Formulario de Consulta --- */}
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
            {loading ? 'Cargando...' : 'Consultar Autorizaciones'}
          </button>
        </form>

        {/* --- Mensaje de Error (Global) --- */}
        {error && <div className="error-message">{error}</div>}

        {/* --- Grid de Autorizaciones --- */}
        {authList.length > 0 && (
          <div className="table-container">
            <h2 className="grid-title">Autorizaciones Pendientes</h2>
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Folio Auth</th>
                  <th>Servicio</th>
                  <th>Status</th>
                  <th>Email Auth</th>
                  <th>Fecha de Alta</th>
                  <th>Usuario Alt</th>
                  <th>Datos de Entrada</th>
                  <th>Acción</th> 
                </tr>
              </thead>
              <tbody>
                {authList.map((auth, index) => (
                  <tr key={index}>
                      <td>{auth.id}</td>
                      <td>{auth.folauth}</td>
                      <td>{auth.Servicio}</td>
                      <td>{auth.status}</td>
                      <td>{auth.emailauth}</td>
                      <td>{auth.fecha_alta}</td>
                      <td>{auth.usuario_alt}</td>
                      <td><pre className="data-in-cell">{auth.DatosIn}</pre></td>
                      <td className="actions-cell">
                      <button className="edit-btn" onClick={() => handleViewClick(auth)} title="Ver/Autorizar">
                          <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      
      </div>

      {/* --- Componente Encryptor para la Solicitud (LIST, AUTH, RESOLVE o EXECUTE) --- */}
      {encrypting && decryptingResponse && (
        <Encryptor
          password={encryptionPassword}
          // El mensaje a encriptar es el payload dentro del objeto decryptingResponse
          message={JSON.stringify(decryptingResponse.payload)} 
          onEncrypted={handleEncryptedData}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
            setLoading(false);
            setDecryptingResponse(null);
            handleCloseModal(); // Cierra el modal si falla la encriptación
          }}
        />
      )}

      {/* --- Componente Decryptor para la Respuesta (Solo LIST) --- */}
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

      {/* --- Modal de Autorización --- */}
      {isModalOpen && selectedAuthFolio && (
        <AuthorizationModal
          authFolio={selectedAuthFolio}
          onClose={handleCloseModal}
          setParentError={setError}
          setEncrypting={setEncrypting}
          setCurrentAction={setCurrentAction}
          // El modal establece el payload de autorización
          setDecryptingResponse={setDecryptingResponse}
        />
      )}
    </div>
  );
};