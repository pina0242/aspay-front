import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regper.css'; // Reutilizar estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regcta = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [tknper, setTknper] = useState('');
  const [pais, setPais] = useState('');
  const [moneda, setMoneda] = useState('');
  const [entban, setEntban] = useState('');
  const [tipo, setTipo] = useState('');
  const [alias, setAlias] = useState('');
  const [datos, setDatos] = useState('');
  const [indoper, setIndoper] = useState('');
  const [categoria, setCategoria] = useState('ALL');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  const [listaCategorias, setListaCategorias] = useState([]); 
  const [datosCategoriasCifrados, setDatosCategoriasCifrados] = useState(null);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
    const fetchCategoriasCifradas = async () => {
      try {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/listcateg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify('vIhvNK07HRwKFp-cCcVvTAYiOfY3xOeAPlyXH3DuKrV842aFcNpodyF5kwg1CTeJNTehSGsVPN_ZEsbIrqnTHw')
        });



        if (response.status >= 400) {
          const errorText = await response.text();
          console.error("Error del servidor:", errorText);
          return;
        }
    const data = await response.json();
    let valorCifrado = null;

    if (typeof data === 'string') {
        valorCifrado = data;
    } else if (Array.isArray(data) && data[0]?.response) {
        valorCifrado = data[0].response;
    } else if (data?.response) {
        valorCifrado = data.response;
    }

    if (valorCifrado) {

        setDatosCategoriasCifrados(valorCifrado);
    } else {
        console.error("Estructura de datos no reconocida:", data);
        setError("El servidor respondió con un formato inesperado.");
    }

      } catch (err) {
        console.error("Error catastrófico en el fetch:", err);
      }
    };
        fetchCategoriasCifradas();
  
  }, [token]);

const handleDecryptedCategorias = (data) => {
  try {
    const parsedData = JSON.parse(data); 
    setListaCategorias(parsedData); 
  } catch (err) {
    console.error("Error al parsear categorías desencriptadas:", err);
  } finally {
    setDatosCategoriasCifrados(null);
    setCargandoCategorias(false);
  }
};



  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      tknper: tknper,
      pais:pais,
      moneda:moneda,
      entban:entban,
      tipo: tipo,
      alias: alias,
      datos:datos,
      indoper:indoper,
      categoria:categoria,
    };

    setEncrypting(true);
    setDataToProcess(payload); // Iniciar el proceso de cifrado
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regcta`, {
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
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar Cuenta.';
        setError(errorMessage);
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
      const message = parsedData[0]?.response;
      if (message === 'Exito') {
        setSuccess('¡Registro exitoso!');
        setTimeout(() => {
          navigate('/Listcta', { state: { token } });
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
        <h1 className="regusr-title">Registrar Cuenta</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>


        <div className="form-group">
          <div className="form-grid">

          
            <label htmlFor="nivel">Tkn persona</label>
            <input type="text" id="tknper" value={tknper} onChange={(e) => setTknper(e.target.value)} maxLength="36" required />
            
            <label htmlFor="nivel">Pais</label>
            <select className="form-select" aria-label="Default select example"value={pais} onChange={(e) => setPais(e.target.value)}required >
              <option value="">Seleccione Pais</option>
              <option value="ES">España</option>
              <option value="PT">Portugal</option>
              <option value="DK">Dinamarca</option>
              <option value="SE">Suecia</option>
            </select>
            
            <label htmlFor="nivel">Moneda</label>
            <input type="text" id="moneda" value={moneda} onChange={(e) => setMoneda(e.target.value)} maxLength="3" required />
            
            <label htmlFor="nivel">Entban</label>
            <input type="number" id="entban" value={entban} onChange={(e) => setEntban(e.target.value)} maxLength="4" required />
            
            <label htmlFor="nivel">Tipo de Cuenta</label>
            <select className="form-select" aria-label="Default select example"value={tipo} onChange={(e) => setTipo(e.target.value)}required >
              <option value="">Seleccione Tipo de Cuenta</option>
              <option value="001">IBAN</option>
              <option value="002">Tarjeta</option>
              <option value="003">Cuenta</option>
            </select> 
            
            <label htmlFor="nivel">Alias</label>
            <input type="text" id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} maxLength="10"  />        
            <label htmlFor="nivel">Cuenta</label>
            <input type="text" id="datos" value={datos} onChange={(e) => setDatos(e.target.value)} maxLength="36" required /> 
            <label htmlFor="nivel">Ind Cta Operativa</label>
            <select className="form-select" aria-label="Default select example"value={indoper} onChange={(e) => setIndoper(e.target.value)}required >
              <option value="">Seleccione</option>
              <option value="CO">Operativa</option>
              <option value="NO">No Operativa</option>
            </select>        
            {/* <label htmlFor="nivel">Categoria</label>
            <input type="text" id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} maxLength="20" required />   */}
            <label htmlFor="categoria">Categoría</label>
            <select 
              className="form-select" 
              id="categoria"
              value={categoria} 
              onChange={(e) => setCategoria(e.target.value)} 
              required
            >
              <option value="ALL">Selecciona una categoria</option>
              {listaCategorias.length > 0 && listaCategorias.map((cat, index) => (
                <option key={index} value={cat.categoria || cat.nombre}>
                  {cat.categoria || cat.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Cuenta'}
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
        {datosCategoriasCifrados && (
        <Decryptor
          encryptedMessage={datosCategoriasCifrados}
          password={encryptionPassword}
          onDecrypted={handleDecryptedCategorias}
          onError={(err) => {
            console.error("Error descifrando categorías:", err);
            setCargandoCategorias(false);
          }}
        />
)}
      </div>
    </div>
  );
};