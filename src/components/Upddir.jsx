import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos el estilo

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Upddir = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {}; // userToEdit contiene los datos del item seleccionado

  const [numid, setNumid] = useState('');
  const [tipodir, setTipodir] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codpostal, setCodpostal] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [pais, setPais] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');

  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
    if (userToEdit) {

  
      setNumid(userToEdit.num_id || '');
      setTipodir(userToEdit.tipo_dir || '');
      setDireccion(userToEdit.direccion || '');
      setCodpostal(userToEdit.cod_postal || '');
      setCiudad(userToEdit.ciudad || '');
      setPais(userToEdit.pais || '');
      setLatitud(userToEdit.latitud || '');
      setLongitud(userToEdit.longitud || '');   
             

    }
  }, [token, userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      num_id: numid,
      tipo_dir: tipodir,
      direccion: direccion,
      cod_postal:codpostal,
      ciudad:ciudad,
      pais:pais,
      latitud:latitud,
      longitud:longitud,     

    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upddir`, {
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

      const responseData = await response.json();

      if (response.status === 201) {
        setDataToProcess(responseData);
      } else {
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al actualizar Direccion.';
        setError(errorData);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error en la llamada al API:', err);
      setError('Error en la comunicación con el servidor.');
      setLoading(false);
    }
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      const message = parsedData[0]?.response;
      if (message) {
        setSuccess(message);
        setTimeout(() => {
          navigate('/Listdir', { state: { token } });
        }, 2000);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDataToProcess(null);
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
          </div>
        </div>
      </div>
      
      <div className="regusr-content-container">
        <h1 className="regusr-title">Editar Direccion</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-grid">


            <div className="form-group">
              <label htmlFor="nivel">ID</label>
              <input type="text" id="numid" readOnly={true}  value={numid} onChange={(e) => setNumid(e.target.value)} maxLength="10"  />
            </div>


            <div className="form-group">
              <label htmlFor="nivel">Tipo de Direccion</label>
              <input type="text" id="tipodir" readOnly={true}  value={tipodir} onChange={(e) => setTipodir(e.target.value)} maxLength="1"  />
            </div>

            <div className="form-group">
              <label htmlFor="nivel">Direccion</label>
              <input type="text" id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength="50"  />
            </div>
            <div className="form-group">
              <label htmlFor="nivel">Codigo Postal</label>
              <input type="number" id="codpostal" value={codpostal} onChange={(e) => setCodpostal(e.target.value)} maxLength="5"  />
            </div>       
            <div className="form-group">
              <label htmlFor="nivel">Cuidad</label>
              <input type="text" id="ciudad" value={ciudad} onChange={(e) => setCiudad(e.target.value)} maxLength="30"  />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Pais</label>
              <input type="text" id="pais" value={pais} onChange={(e) => setPais(e.target.value)} maxLength="15"  />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Latitud</label>
              <input type="text" id="latitud" value={latitud} onChange={(e) => setLatitud(e.target.value)} maxLength="15"  />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Longitud</label>
              <input type="text" id="longitud" value={longitud} onChange={(e) => setLongitud(e.target.value)} maxLength="15"  />
            </div>                                       
   
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Guardar Cambios'}
          </button>
                    
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

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

        {dataToProcess && !encrypting && typeof dataToProcess === 'string' && (
          <Decryptor
            encryptedMessage={dataToProcess}
            password={encryptionPassword}
            onDecrypted={handleDecryptedResponse}
            onError={(err) => {
              setError(err);
              setLoading(false);
              setDataToProcess(null);
            }}
          />
        )}
      </div>
    </div>
  );
};