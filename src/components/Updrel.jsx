import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos el estilo

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Updrel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {}; // userToEdit contiene los datos del item seleccionado

  const [id, setId] = useState('');
  const [numidprinc, setNumidprinc] = useState('');
  const [numidrelac, setNumidrelac] = useState('');
  const [tiporelac, setTiporelac] = useState('');
  const [nivelrelac, setNivelrelac] = useState('');
  const [porcentajep, setPorcentajep] = useState('');
  const [fecinirel, setFecinirel] = useState('');
  const [fecfinrel, setFecfinrel] = useState('');
  const [doctoref, setDoctoref] = useState('');

  

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
      
      const fechaCompletaI = new Date(userToEdit.fecha_ini_rel);

      const año = fechaCompletaI.getFullYear();

      const mes = String(fechaCompletaI.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaCompletaI.getDate()).padStart(2, '0');

      const soloFechaFormateadaI = `${año}-${mes}-${dia}`;

      console.log(soloFechaFormateadaI); 

      const fechaCompletaF = new Date(userToEdit.fecha_fin_rel);

      const añoF = fechaCompletaF.getFullYear();

      const mesF = String(fechaCompletaF.getMonth() + 1).padStart(2, '0');
      const diaF = String(fechaCompletaF.getDate()).padStart(2, '0');

      const soloFechaFormateadaF = `${añoF}-${mesF}-${diaF}`;

      console.log(soloFechaFormateadaF); 

  
      setId(userToEdit.id || '');
      setNumidprinc(userToEdit.num_id_princ || '');
      setNumidrelac(userToEdit.num_id_relac || '');
      setTiporelac(userToEdit.tipo_relac || '');
      setNivelrelac(userToEdit.nivel_relac || '');
      setPorcentajep(userToEdit.porcentaje_partic || '');      
      setFecinirel(soloFechaFormateadaI);
      setFecfinrel(soloFechaFormateadaF);   
      setDoctoref(userToEdit.docto_referencia|| '');
             

    }
  }, [token, userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      id: id,
      num_id_princ: numidprinc,
      num_id_relac: numidrelac,
      tipo_relac:tiporelac,
      nivel_relac:nivelrelac,
      porcentaje_partic:porcentajep,
      fecha_ini_rel:fecinirel,
      fecha_fin_rel:fecfinrel,     
      docto_referencia:doctoref,     


    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updrel`, {
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
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al actualizar Relacion.';
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
        <h1 className="regusr-title">Editar Relacion</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-grid">


            <div className="form-group">
              <label htmlFor="nivel">ID</label>
              <input type="text" id="id" readOnly={true}  value={id} onChange={(e) => setId(e.target.value)} maxLength="10"  />
            </div>


            <div className="form-group">
              <label htmlFor="nivel">ID Principal</label>
              <input type="text" id="numidprinc" readOnly={true} value={numidprinc} onChange={(e) => setNumidprinc(e.target.value)} maxLength="10" required />
            </div>

            <div className="form-group">
              <label htmlFor="nivel">Numero ID Relacion</label>
              <input type="text" id="numidrelac" readOnly={true} value={numidrelac} onChange={(e) => setNumidrelac(e.target.value)} maxLength="10" required />
            </div>
            <div className="form-group">
              <label htmlFor="nivel">Tipo de Relacion</label>
              <input type="text" id="tiporelac" readOnly={true} value={tiporelac} onChange={(e) => setTiporelac(e.target.value)} maxLength="10" required />
            </div>    

            <div className="form-group">
              <label htmlFor="nivel">Nivel de Relacion</label>
              <input type="number" id="nivelrelac" value={nivelrelac} onChange={(e) => setNivelrelac(e.target.value)} maxLength="5"  />
            </div>    
             
            <div className="form-group">
              <label htmlFor="nivel">Porcentaje de Participacion</label>
              <input type="number" id="porcentajep" value={porcentajep} onChange={(e) => setPorcentajep(e.target.value)} maxLength="15"  />
            </div>      
 
            <div className="form-group">
              <label htmlFor="nivel">Fecha Inicio de Relacion</label>
              <input type="date" id="fecinirel" value={fecinirel} onChange={(e) => setFecinirel(e.target.value)} maxLength="15"  />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Fecha Fin de Relacion</label>
              <input type="date" id="fecfinrel" value={fecfinrel} onChange={(e) => setFecfinrel(e.target.value)} maxLength="15" required />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Documento de Referencia</label>
              <input type="text" id="doctoref" value={doctoref} onChange={(e) => setDoctoref(e.target.value)} maxLength="15" required />
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