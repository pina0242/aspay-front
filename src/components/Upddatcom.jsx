import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos el estilo

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Upddatcom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {}; // userToEdit contiene los datos del item seleccionado

  const [numid, setNumid] = useState('');
  const [emailp, setEmailp] = useState('');
  const [emaila, setEmaila] = useState('');
  const [numtel1, setNumtel1] = useState('');
  const [numtel2, setNumtel2] = useState('');
  const [indpep, setIndpep] = useState('');    
  const [ingresomax, setIngresomax] = useState('');    
  const [periodoi, setPeriodoi] = useState('');    
  const [monedai, setMonedai] = useState('');    
  const [volumentx, setVolumentx] = useState('');   
  const [alias, setAlias] = useState('');   
  const [paginaweb, setPaginaweb] = useState('');   
  const [redsocial1, setRedsocial1] = useState('');
  const [redsocial2, setRedsocial2] = useState('');
  const [redsocial3, setRedsocial3] = useState('');   
  const [direccip, setDireccip] = useState('');   
  const [direccmac, setDireccmac] = useState('');   
  

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
      setEmailp(userToEdit.email_princ || '');
      setEmaila(userToEdit.email_alt || '');
      setNumtel1(userToEdit.num_tel1 || '');
      setNumtel2(userToEdit.num_tel2 || '');
      setIndpep(userToEdit.ind_pep || '');
      setIngresomax(userToEdit.ingreso_max || '');
      setPeriodoi(userToEdit.period_ingreso || '');   
      setMonedai(userToEdit.moneda_ingreso || '');     
      setVolumentx(userToEdit.volumen_tx || '');   
      setAlias(userToEdit.alias_nom_comer || '');             
      setPaginaweb(userToEdit.pagina_web || '');     
      setRedsocial1(userToEdit.red_social1 || '');     
      setRedsocial2(userToEdit.red_social2 || '');     
      setRedsocial3(userToEdit.red_social3 || '');     
      setDireccip(userToEdit.direcc_ip || '');           
      setDireccmac(userToEdit.direcc_mac || '');                 

    }
  }, [token, userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      num_id: numid,
      email_princ: emailp,
      email_alt: emaila,
      num_tel1:numtel1,
      num_tel2:numtel2,
      ind_pep:indpep,
      ingreso_max:ingresomax,
      period_ingreso:periodoi,
      moneda_ingreso:monedai,
      volumen_tx:volumentx,
      alias_nom_comer:alias,
      pagina_web:paginaweb,
      red_social1:redsocial1,
      red_social2:redsocial2,
      red_social3:redsocial3,
      direcc_ip:direccip,
      direcc_mac:direccmac,           

    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upddcomper`, {
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
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al actualizar los datos complementarios.';
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
          navigate('/Listdatcom', { state: { token } });
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
        <h1 className="regusr-title">Editar Datos Complementarios</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-grid">


            <div className="form-group">
              <label htmlFor="numid">ID</label>
              <input type="number" id="numid" readOnly={true} value={numid} onChange={(e) => setNumid(e.target.value)} />
            </div>


            <div className="form-group">
              <label htmlFor="nivel">Email Principal</label>
              <input type="email" id="emailp" value={emailp} onChange={(e) => setEmailp(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="nivel">Email Alternativo</label>
              <input type="email" id="emaila" value={emaila} onChange={(e) => setEmaila(e.target.value)} maxLength="50"  />
            </div>
            <div className="form-group">
              <label htmlFor="nivel">Numero Telefonico 1</label>
              <input type="text" id="numtel1" value={numtel1} onChange={(e) => setNumtel1(e.target.value)} maxLength="10" required />
            </div>       
            <div className="form-group">
              <label htmlFor="nivel">Numero Telefonico 2</label>
              <input type="text" id="numtel2" value={numtel2} onChange={(e) => setNumtel2(e.target.value)} maxLength="10"  />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Indicador de Persona</label>
              <input type="text" id="indpep" value={indpep} onChange={(e) => setIndpep(e.target.value)} maxLength="1" required />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Ingreso Maximo</label>
              <input type="number" id="ingresomax" value={ingresomax} onChange={(e) => setIngresomax(e.target.value)} maxLength="15" required />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Periodo de Ingreso</label>
              <input type="text" id="periodoi" value={periodoi} onChange={(e) => setPeriodoi(e.target.value)} maxLength="1"  />
            </div>                                       
            <div className="form-group">
              <label htmlFor="nivel">Moneda Ingreso </label>
              <input type="text" id="monedai" value={monedai} onChange={(e) => setMonedai(e.target.value)} maxLength="3" required />
            </div>   
            <div className="form-group">
              <label htmlFor="nivel">Volumen TX </label>
              <input type="number" id="volumentx" value={volumentx} onChange={(e) => setVolumentx(e.target.value)} maxLength="10"  />
            </div> 
            <div className="form-group">
              <label htmlFor="nivel">Alias </label>
              <input type="text" id="alias" value={alias} onChange={(e) => setAlias(e.target.value)} maxLength="50" required />
            </div> 
            <div className="form-group">
              <label htmlFor="nivel">Pagina WEB </label>
              <input type="text" id="paginaweb" value={paginaweb} onChange={(e) => setPaginaweb(e.target.value)} maxLength="50"  />
            </div> 

            <div className="form-group">
              <label htmlFor="nivel">Red Social 1 </label>
               <input type="text" id="redsocial1" value={redsocial1} onChange={(e) => setRedsocial1(e.target.value)} maxLength="50"  /> 
            </div> 

            <div className="form-group">
              <label htmlFor="nivel">Red Social 2</label>
              <input type="text" id="redsocial2" value={redsocial2} onChange={(e) => setRedsocial2(e.target.value)} maxLength="50"  />
            </div> 
            <div className="form-group">
              <label htmlFor="nivel">Red Social 3</label>
              <input type="text" id="redsocial3" value={redsocial3} onChange={(e) => setRedsocial3(e.target.value)} maxLength="50"  /> 
            </div>      
            <div className="form-group">
              <label htmlFor="nivel">Direccion IP</label>
              <input type="text" id="direccip" value={direccip} onChange={(e) => setDireccip(e.target.value)} maxLength="20"  />
            </div> 
            <div className="form-group">
              <label htmlFor="nivel">Direccion MAC</label>
              <input type="text" id="direccmac" value={direccmac} onChange={(e) => setDireccmac(e.target.value)} maxLength="20"  />
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