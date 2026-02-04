import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regper.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regdir = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

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

  // Estados específicos para la validación del CP
  const [validatingCP, setValidatingCP] = useState(false);
  const [dataToValidate, setDataToValidate] = useState(null);
  const [cpEncrypted, setCpEncrypted] = useState(false);
  const [valcp, setValcp] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  // 🔹 1️⃣ VALIDACIÓN AUTOMÁTICA DEL CÓDIGO POSTAL CON CIFRADO
  const handleCPChange = (e) => {
    const nuevoCP = e.target.value;
    setCodpostal(nuevoCP);
    setValcp(false);
    setError('');

    if (!pais || nuevoCP.length < 5) return; // esperar país y CP válidos

    // Crear payload a cifrar
    const payload = {
      cod_postal: nuevoCP,
      pais: pais
    };

    setValidatingCP(true);
    setDataToValidate(payload);
    setCpEncrypted(true); // activa Encryptor para CP
  };

  // 🔹 2️⃣ Enviar CP cifrado al backend
  const handleEncryptedCP = async (encryptedBody) => {
    setCpEncrypted(false);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verifcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (response.status === 201) {
        // El servidor devuelve algo cifrado → pasamos a Decryptor
        setDataToValidate(responseData);
      } else {
        const errorMessage = responseData[0]?.response || 'Error al validar CP.';
        setError(errorMessage);
        setValidatingCP(false);
      }
    } catch (err) {
      console.error('Error al validar el CP:', err);
      setError('Error en la comunicación con el servidor.');
      setValidatingCP(false);
    }
  };

  // 🔹 3️⃣ Procesar respuesta descifrada del CP
  const handleDecryptedCP = (data) => {
    try {
      const parsed = JSON.parse(data);
      const message = parsed[1]?.response;
      

      if (message === 'Exito') {
        if (parsed[0].ciudad) setCiudad(parsed[0].ciudad);
        if (parsed[0].latitud) setLatitud(parsed[0].latitud);
        if (parsed[0].longitud) setLongitud(parsed[0].longitud);
        setValcp(true);
        setError('');
      } else {
        setValcp(false);
        setError(message || 'Código postal inválido.');
      }
    } catch (err) {
      console.error('Error al descifrar la respuesta del CP:', err);
      setError('Error inesperado al validar el CP.');
      setValcp(false);
    } finally {
      setValidatingCP(false);
      setDataToValidate(null);
    }
  };

  // 🔹 4️⃣ ENVÍO DE FORMULARIO NORMAL (registro de dirección)
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!valcp) {
      setError('Debes validar un código postal correcto antes de registrar.');
      return;
    }

    setLoading(true);

    const payload = {
      num_id: numid,
      tipo_dir: tipodir,
      direccion,
      cod_postal: codpostal,
      ciudad,
      pais,
      latitud,
      longitud,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  // 🔹 5️⃣ Enviar registro cifrado
  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regdir`, {
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
        const errorMessage = responseData[0]?.response || 'Error al registrar dirección.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 6️⃣ Procesar respuesta descifrada del registro
  const handleDecryptedResponse = (data) => {
    try {
      const parsed = JSON.parse(data);
      const message = parsed[0]?.response;

      if (message === 'Exito') {
        setSuccess('¡Registro exitoso!');
        setTimeout(() => navigate('/Listdir', { state: { token } }), 2000);
      } else {
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error('Error al procesar la respuesta descifrada:', err);
      setError('Respuesta inesperada del servidor.');
    } finally {
      setLoading(false);
      setDataToProcess(null);
    }
  };

  // 🔹 7️⃣ RENDER
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
      <h1 className="regusr-title">Registrar Direccion</h1>

      <form className="regusr-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="form-grid">
        <label>ID</label>
        <input type="text" value={numid} onChange={(e) => setNumid(e.target.value)} required />

        <label>Tipo de Dirección</label>

        <select className="form-select" aria-label="Default select example"value={tipodir} onChange={(e) => setTipodir(e.target.value)}required >
          <option value="">Seleccione Tipo de Direccion</option>
          <option value="F">Fiscal</option>
          <option value="P">Postal</option>
          <option value="C">Particular</option>
        </select> 

        <label>Dirección</label>
        <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

        <label>País</label>
        <input type="text" value={pais} onChange={(e) => setPais(e.target.value)} required />

        <label>Código Postal</label>
        <input
          type="number"
          value={codpostal}
          onChange={handleCPChange}
          disabled={validatingCP}
          style={{ borderColor: valcp ? 'green' : 'red' }}
          
        />
         <label></label>
        <label></label>
        {validatingCP && <small style={{ color: 'blue' }}>Validando...</small>}
        {!validatingCP && valcp && <small style={{ color: 'green' }}>✔ CP válido</small>}
        {!validatingCP && !valcp && codpostal && <small style={{ color: 'red' }}>✖ No validado</small>}
</div>
<div className="form-grid">
        <label>Ciudad</label>
        <input type="text" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />

        <label>Latitud</label>
        <input type="text" value={latitud} onChange={(e) => setLatitud(e.target.value)} required />

        <label>Longitud</label>
        <input type="text" value={longitud} onChange={(e) => setLongitud(e.target.value)} required />
          </div>
</div>
        <button type="submit" disabled={loading || !valcp}>
          {loading ? 'Cargando...' : 'Registrar Dirección'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* 🔹 Encryptor / Decryptor para registro */}
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

      {/* 🔹 Encryptor / Decryptor para validación de CP */}
      {cpEncrypted && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(dataToValidate)}
          onEncrypted={handleEncryptedCP}
          onError={(errorMsg) => {
            setError(errorMsg);
            setCpEncrypted(false);
            setValidatingCP(false);
          }}
        />
      )}
      {dataToValidate && !cpEncrypted && typeof dataToValidate === 'string' && (
        <Decryptor
          encryptedMessage={dataToValidate}
          password={encryptionPassword}
          onDecrypted={handleDecryptedCP}
          onError={(err) => {
            setError(err);
            setValidatingCP(false);
            setDataToValidate(null);
          }}
        />
      )}
    </div>
    </div>
  );
};
