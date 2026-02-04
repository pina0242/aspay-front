import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import { FaEdit, FaTrashAlt, FaDownload } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listdoc = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [numid, setNumid] = useState('');
  const [tipoDocto, settipoDocto] = useState('');
  const [docList, setDocList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);

  
  // Función para manejar la eliminación
  const handleDeleteClick = (item) => {
    // Redirige al componente Deldoc y pasa los datos del item
    navigate('/Deldoc', { state: { token, userToEdit: item } });
  };

  // Función simplificada que mantiene la extensión original
const handleDownloadClick = (item) => {
  if (!item.image_docto) {
    setError('No hay documento disponible para descargar');
    return;
  }

  try {
    let base64Data = item.image_docto;
    
    // Remover prefijos de data URLs si existen
    if (base64Data.includes('base64,')) {
      base64Data = base64Data.split('base64,')[1];
    }
    
    // Decodificar base64
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Crear blob con tipo genérico
    const blob = new Blob([bytes], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Usar el nombre de archivo exacto que viene del backend
    link.download = item.nombre_archivo || `documento_${item.num_id}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error('Error al descargar el documento:', err);
    setError('Error al descargar el documento: ' + err.message);
  }
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
    setDocList([]);

    const payload = {
      num_id:numid,
      tipo_docto:tipoDocto,
    };

    setEncrypting(true);
    setDecryptingResponse(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seldoc`, {
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
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener el documento.';
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
        setDocList(parsedData);
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regdocto', { state: { token } })}>
              <div className="product">Reg_Docto</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Datos de Documento</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">ID</label>
            <input type="number" id="numid" value={numid} onChange={(e) => setNumid(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="tipodocto">Tipo de Documento</label>
            <select className="form-select" aria-label="Default select example"value={tipoDocto} onChange={(e) => settipoDocto(e.target.value)}required >
              <option value="">Seleccione Tipo de Documento</option>
              <option value="DNI_ESPAÑOL">DNI_ESPAÑOL</option>
              <option value="CIF_ESPAÑOL">CIF_ESPAÑOL</option>
              <option value="NIE_EXTRANJERO">NIE_EXTRANJERO</option>
              <option value="CC_PORTUGUES">CC_PORTUGUES</option>
              <option value="NIF_PORTUGUES">NIF_PORTUGUES</option>
              <option value="PASAPORTE">PASAPORTE</option>
              <option value="ESCRIT_CONSTIT">ESCRITURA_CONSTITUCION</option>
            </select>
          </div>                            
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Buscar'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

      {docList.length > 0 && (
        <div className="table-container">
          <h2 className="grid-title">Consulta de Documento</h2>
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Documento</th>
                <th>Nombre Documento</th>
                <th>Estatus de Validacion</th>
                <th>Motivo Rechazo</th>
                <th>Fecha Vencimiento</th>                                                             
                <th>Fecha Alta</th> 
                <th>Acciones</th>                                  
              </tr>
            </thead>
            <tbody>
              {docList.map((item, index) => (
                <tr key={index}>
                  <td>{item.num_id}</td>
                  <td>{item.tipo_docto}</td>
                  <td>{item.nombre_archivo}</td>
                  <td>{item.estatus_validacion_docto}</td>
                  <td>{item.motivo_rechazo}</td>
                  <td>{item.fecha_caducidad_docto}</td>
                  <td>{item.fecha_alta}</td>

                  {/* Celda de acciones con botones de descarga y eliminación */}
                  <td className="actions-cell">
                    <button 
                      className="download-btn" 
                      onClick={() => handleDownloadClick(item)}
                      title={`Descargar ${item.nombre_archivo || 'documento'}`}
                    >
                      <FaDownload />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => handleDeleteClick(item)}
                      title="Eliminar documento"
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