import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regper.css'; // Reutilizar estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regrel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [numidprinc, setNumidprinc] = useState('');
  const [numidrelac, setNumidrelac] = useState('');
  const [tiporelac, setTiporelac] = useState('');
  const [nivelrelac, setNivelrelac] = useState('');
  const [porcentajep, setPorcentajep] = useState('');
  const [fecinirel, setFecinirel] = useState('');
  const [fecfinrel, setFecfinrel] = useState('');
  const [doctoref, setDoctoref] = useState('');

  
  // const fecinirels = '9999-12-31'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    

    if (!fecfinrel) {
      setFecfinrel("9999-12-31");

    } else {
      setFecfinrel(fecfinrel);
    }

    const fechaFinFinal = fecfinrel ? fecfinrel : "9999-12-31";

    const payload = {
      num_id_princ: numidprinc,
      num_id_relac: numidrelac,
      tipo_relac: tiporelac,
      nivel_relac:nivelrelac,
      porcentaje_partic:porcentajep,
      fecha_ini_rel:fecinirel,
      fecha_fin_rel:fechaFinFinal,
      docto_referencia:doctoref,

    };



    setEncrypting(true);
    setDataToProcess(payload); // Iniciar el proceso de cifrado
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regrel`, {
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
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar Relacion.';
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
          navigate('/Listrel', { state: { token } });
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
        <h1 className="regusr-title">Registrar Relacion</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>


        <div className="form-group">
          <div className="form-grid">

          
            <label htmlFor="nivel">ID Principal</label>
            <input type="text" id="numidprinc" value={numidprinc} onChange={(e) => setNumidprinc(e.target.value)} maxLength="10" required />


            <label htmlFor="nivel">Numero ID Relacion</label>
            <input type="text" id="numidrelac" value={numidrelac} onChange={(e) => setNumidrelac(e.target.value)} maxLength="10" required />


            <label htmlFor="nivel">Tipo de Relacion</label>
            <select className="form-select" aria-label="Default select example"value={tiporelac} onChange={(e) => setTiporelac(e.target.value)} >
              <option value="">Seleccione Tipo de Relacion</option>
              <option value="SOCI">Socio</option>
              <option value="REPL">Representante Legal</option>
              <option value="APOD">Apoderado</option>
              <option value="DIRE">Director</option>
              <option value="ACCI">Accionista</option>
              <option value="OTRO">Otro</option>
            </select> 

            <label htmlFor="nivel">Nivel de Relacion</label>

            <select className="form-select" aria-label="Default select example"value={nivelrelac} onChange={(e) => setNivelrelac(e.target.value)}required >
              <option value="">Seleccione Nivel de Relacion</option>
              <option value="P">Primario</option>
              <option value="S">Secundario</option>
              <option value="T">Terciario</option>
              <option value="O">Otro</option>
            </select> 
           
            <label htmlFor="nivel">Porcentaje de Participacion</label>
            <input type="text" id="porcentajep" value={porcentajep} onChange={(e) => setPorcentajep(e.target.value)} maxLength="6" required />
            <label htmlFor="nivel">Fecha Inicio de Relacion</label>
            <input type="date" id="fecinirel" value={fecinirel} onChange={(e) => setFecinirel(e.target.value)} maxLength="10" required />
            <label htmlFor="nivel">Fecha Fin de Relacion</label>
            <input type="date" id="fecfinrel" value={fecfinrel} onChange={(e) => setFecfinrel(e.target.value) } maxLength="10"  />
            <label htmlFor="nivel">Documento de Referencia</label>
            <input type="text" id="doctoref" value={doctoref} onChange={(e) => setDoctoref(e.target.value)} maxLength="50" required />
          
          </div>
</div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Relacion'}
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