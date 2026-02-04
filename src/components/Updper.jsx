import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css'; // Reutilizamos el estilo

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Updper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {}; // userToEdit contiene los datos del item seleccionado

  const [numid, setNumid] = useState('');
  const [idpersona, setIdpersona] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoid, setTipoid] = useState('');
  const [appaterno, setAppaterno] = useState('');
  const [apmaterno, setApmaterno] = useState('');    
  const [genero, setGenero] = useState('');    
  const [tipoper, setTipoper] = useState('');    
  const [tipocte, setTipocte] = useState('');    
  const [fecnac, setFecnac] = useState('');   
  
  const [ocupacion, setOcupacion] = useState('');   
  const [giro, setGiro] = useState('');   
  const [paisnac, setPaisnac] = useState('');
  const [nacionalid, setNacionalid] = useState('');
  const [edocivil, setEdocivil] = useState('');
  const [mercantil, setMercantil] = useState('');   
  const [migrada, setMigrada] = useState('');   
  
  // Nuevos estados para la actividad económica
  const [actividadEconomica, setActividadEconomica] = useState('');
  const [giros, setGiros] = useState([]);
  const [loadingGiros, setLoadingGiros] = useState(false);
  const [encryptedGirosData, setEncryptedGirosData] = useState(null);
  const [cargadoInicialmente, setCargadoInicialmente] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);

  // Opciones para actividad económica 
  const opcionesActividadEconomica = [
    { valor: 'ACTECONA', etiqueta: 'Agricultura, ganadería, silvicultura y pesca' },
    { valor: 'ACTECONB', etiqueta: 'Industrias extractivas' },
    { valor: 'ACTECONC', etiqueta: 'Industria manufacturera' },
    { valor: 'ACTECOND', etiqueta: 'Suministro de energía eléctrica, gas, vapor y aire acondicionado' },
    { valor: 'ACTECONE', etiqueta: 'Suministro de agua, actividades de saneamiento, gestión de residuos y descontaminación' },
    { valor: 'ACTECONF', etiqueta: 'Construcción' },
    { valor: 'ACTECONG', etiqueta: 'Comercio al por mayor y al por menor; reparación de vehículos y motocicletas' },
    { valor: 'ACTECONH', etiqueta: 'Transporte y almacenamiento' },
    { valor: 'ACTECONI', etiqueta: 'Hostelería' },
    { valor: 'ACTECONJ', etiqueta: 'Información y comunicaciones' },
    { valor: 'ACTECONK', etiqueta: 'Actividades financieras y de seguros' },
    { valor: 'ACTECONL', etiqueta: 'Actividades inmobiliarias' },
    { valor: 'ACTECONM', etiqueta: 'Actividades profesionales, científicas y técnicas' },
    { valor: 'ACTECONN', etiqueta: 'Actividades administrativas y servicios auxliares' },
    { valor: 'ACTECONO', etiqueta: 'Administración Pública y defensa; Seguridad Social obligatoria' },
    { valor: 'ACTECONP', etiqueta: 'Educación' },
    { valor: 'ACTECONQ', etiqueta: 'Actividades sanitarias y de servicios sociales' },
    { valor: 'ACTECONR', etiqueta: 'Actividades artísticas, recreativas y de entrenimiento' },
    { valor: 'ACTECONS', etiqueta: 'Otros servicios' },
    { valor: 'ACTECONT', etiqueta: 'Actividades en hogares, productos o servicios uso propio' },
    { valor: 'ACTECONU', etiqueta: 'Actividades de organizaciones y organismos extraterritoriales' }
  ];

  // Función para obtener la etiqueta de una actividad económica
  const obtenerEtiquetaActividad = (valor) => {
    const opcion = opcionesActividadEconomica.find(op => op.valor === valor);
    return opcion ? opcion.etiqueta : valor;
  };

  // Función para obtener la descripción de un giro
  const obtenerDescripcionGiro = (claveGiro) => {
    const giroEncontrado = giros.find(g => g.clave === claveGiro);
    return giroEncontrado ? giroEncontrado.datos : claveGiro;
  };

  useEffect(() => {
    if (!token) {
      setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
    }
    if (userToEdit && !cargadoInicialmente) {
      const fechaCompleta = new Date(userToEdit.fecha_nac_const);
      const año = fechaCompleta.getFullYear();
      const mes = String(fechaCompleta.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaCompleta.getDate()).padStart(2, '0');
      const soloFechaFormateada = `${año}-${mes}-${dia}`;

      console.log(soloFechaFormateada); 

      setNumid(userToEdit.num_id || '');
      setIdpersona(userToEdit.id_persona || '');
      setTipoid(userToEdit.tipo_id || '');
      setNombre(userToEdit.nombre || '');
      setAppaterno(userToEdit.ap_paterno || '');
      setApmaterno(userToEdit.ap_materno || '');
      setGenero(userToEdit.genero || '');
      setTipoper(userToEdit.tipo_per || '');
      setTipocte(userToEdit.tipo_cte || '');
      setFecnac(soloFechaFormateada);      
      setOcupacion(userToEdit.ocupacion || '');     
      setGiro(userToEdit.giro || '');   
      setPaisnac(userToEdit.pais_nac_const || '');
      setNacionalid(userToEdit.nacionalidad || '');             
      setEdocivil(userToEdit.estado_civil || '');     
      setMercantil(userToEdit.num_reg_mercantil || '');     
      setMigrada(userToEdit.ind_pers_migrada || '');     

      // SOLO CARGAR LA ACTIVIDAD ECONÓMICA, NO LLAMAR AL SERVICIO AUTOMÁTICAMENTE
      if (userToEdit.actecon) {
        setActividadEconomica(userToEdit.actecon);
      }
      
      setCargadoInicialmente(true);
    }
  }, [token, userToEdit, cargadoInicialmente]);

  // Manejador para el cambio en la actividad económica
  const handleActividadEconomicaChange = async (e) => {
    const nuevaActividad = e.target.value;
    setActividadEconomica(nuevaActividad);
    setGiro(''); // Limpiar el giro cuando cambia la actividad económica
    setGiros([]); // Limpiar giros anteriores
    
    if (nuevaActividad) {
      await cargarGiros(nuevaActividad);
    } else {
      setGiros([]);
    }
  };

  // Función para cargar los giros desde el servicio /seltcorp - SOLO CUANDO EL USUARIO INTERACTÚA
  const cargarGiros = async (actividad) => {
    setLoadingGiros(true);
    setError('');
    
    try {
      const payload = { llave: actividad };
      
      // Primero ciframos el payload
      setEncrypting(true);
      setDataToProcess({ type: 'LOAD_GIROS', payload });
      
    } catch (err) {
      console.error('Error al preparar carga de giros:', err);
      setError('Error al preparar la solicitud de giros');
      setLoadingGiros(false);
    }
  };

  // Función para manejar el envío cifrado al servicio /seltcorp
  const handleEncryptedGirosRequest = async (encryptedBody) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seltcorp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      if (response.ok) {
        const encryptedResponse = await response.json();
        // La respuesta viene cifrada, la guardamos para descifrar
        setEncryptedGirosData(encryptedResponse);
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al cargar los giros económicos';
        setError(errorMessage);
        setLoadingGiros(false);
        setEncrypting(false);
      }
    } catch (err) {
      console.error('Error al cargar giros:', err);
      setError('Error de conexión al cargar giros');
      setLoadingGiros(false);
      setEncrypting(false);
    }
  };

  // Función para manejar la respuesta descifrada del servicio /seltcorp
  const handleDecryptedGirosResponse = (decryptedData) => {
    try {
      const parsedData = JSON.parse(decryptedData);
      
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // Si el primer elemento tiene 'response', puede ser un mensaje de error
        if (parsedData[0].response && parsedData[0].response === 'No hay datos a listar') {
          setGiros([]);
          setError('No se encontraron giros para esta actividad económica');
        } else {
          // Procesar los datos de giros
          const girosArray = parsedData.map(item => ({
            id: item.id,
            llave: item.llave,
            clave: item.clave,
            datos: item.datos,
            status: item.status,
            fecha_alta: item.fecha_alta,
            usuario_alta: item.usuario_alta,
            fecha_mod: item.fecha_mod,
            usuario_mod: item.usuario_mod
          }));
          setGiros(girosArray);
        }
      } else {
        setGiros([]);
        setError('No se encontraron datos de giros');
      }
    } catch (err) {
      console.error('Error al procesar giros descifrados:', err);
      setError('Error al procesar la respuesta del servidor');
      setGiros([]);
    } finally {
      setLoadingGiros(false);
      setEncrypting(false);
      setEncryptedGirosData(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      num_id: numid,
      id_persona: idpersona,
      tipo_id: tipoid,
      nombre: nombre,
      ap_paterno: appaterno,
      ap_materno: apmaterno,      
      genero: genero,
      tipo_per: tipoper,
      tipo_cte: tipocte,
      fecha_nac_const: fecnac,
      ocupacion: ocupacion,
      giro: giro, // Este campo ahora contendrá la CLAVE del giro seleccionado     
      pais_nac_const: paisnac,
      nacionalidad: nacionalid,      
      estado_civil: edocivil,      
      num_reg_mercantil: mercantil,    
      ind_pers_migrada:migrada,              
    };

    setEncrypting(true);
    setDataToProcess({ type: 'UPDATE_PERSON', payload });
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    // Determinar a qué servicio enviar basado en el tipo de operación
    const operationType = dataToProcess?.type;
    
    if (operationType === 'LOAD_GIROS') {
      await handleEncryptedGirosRequest(encryptedBody);
      return;
    }

    // Palabras clave para errores de autorización
    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/upddgenper`, {
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
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error al actualizar la persona.';
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
          navigate('/listper', { state: { token } });
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
        <h1 className="regusr-title">Editar Personas</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="numid">ID:</label>
              <input type="number" id="numid" readOnly={true}  value={numid} disabled />
            </div>

            <div className="form-group">
              <label htmlFor="idpersona">ID de Persona</label>
              <input type="text" id="idpersona" value={idpersona} onChange={(e) => setIdpersona(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="tipoid">Tipo de ID</label>
              <select className="form-select" value={tipoid} onChange={(e) => setTipoid(e.target.value)} >
                <option value={tipoid}>{tipoid}</option>
                <option value="">Seleccione Un Tipo de ID</option>
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="CIF">CIF</option>
                <option value="PASAP">PASAP</option>
                <option value="CC">CC</option>
                <option value="NIF">NIF</option>
                <option value="BI">BI</option>
                <option value="NIPC">NIPC</option>
              </select> 
            </div>

            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="appaterno">Apellido Paterno</label>
              <input type="text" id="appaterno" value={appaterno} onChange={(e) => setAppaterno(e.target.value)} />
            </div>       

            <div className="form-group">
              <label htmlFor="apmaterno">Apellido Materno</label>
              <input type="text" id="apmaterno" value={apmaterno} onChange={(e) => setApmaterno(e.target.value)} />
            </div>   

            <div className="form-group">
              <label htmlFor="genero">Genero</label>
              <input type="text" id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} />
            </div>   

            <div className="form-group">
              <label htmlFor="tipoper">Tipo Persona</label>
              <input type="text" id="tipoper" value={tipoper} onChange={(e) => setTipoper(e.target.value)} />
            </div>   

            <div className="form-group">
              <label htmlFor="tipocte">Tipo cliente</label>
              <input type="text" id="tipocte" value={tipocte} onChange={(e) => setTipocte(e.target.value)} />
            </div>                                       

            <div className="form-group">
              <label htmlFor="fecnac">Fecha Nacimiento</label>
              <input type="date" id="fecnac" value={fecnac} onChange={(e) => setFecnac(e.target.value)} />
            </div>   

            <div className="form-group">
              <label htmlFor="ocupacion">Ocupación</label>
              <input type="text" id="ocupacion" value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} />
            </div> 

            {/* NUEVO CAMPO: Actividad Económica - CORREGIDO */}
            <div className="form-group">
              <label htmlFor="actividadEconomica">Actividad económica</label>
              <select 
                className="form-select" 
                value={actividadEconomica} 
                onChange={handleActividadEconomicaChange}
              >
                {/* Mostrar la opción actual si existe */}
                {actividadEconomica && (
                  <option value={actividadEconomica}>
                    {obtenerEtiquetaActividad(actividadEconomica)}
                  </option>
                )}
                <option value="">Seleccione Actividad Económica</option>
                {opcionesActividadEconomica.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            {/* CAMPO GIRO ACTUALIZADO - ahora depende de la actividad económica */}
            <div className="form-group">
              <label htmlFor="giro">Giro</label>
              <select 
                className="form-select" 
                value={giro} 
                onChange={(e) => setGiro(e.target.value)}
                disabled={!actividadEconomica || loadingGiros}
              >
                {/* Mostrar el giro actual si existe */}
                {giro && (
                  <option value={giro}>
                    {obtenerDescripcionGiro(giro)}
                  </option>
                )}
                <option value="">Seleccione Giro</option>
                {loadingGiros ? (
                  <option value="">Cargando giros...</option>
                ) : (
                  giros.map((giroItem) => (
                    <option key={giroItem.clave} value={giroItem.clave}>
                      {giroItem.datos}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="paisnac">Pais de Nacimiento</label>
              <input type="text" id="paisnac" value={paisnac} onChange={(e) => setPaisnac(e.target.value)} />
            </div> 

            <div className="form-group">
              <label htmlFor="nacionalid">Nacionalidad</label>
              <input type="text" id="nacionalid" value={nacionalid} onChange={(e) => setNacionalid(e.target.value)} />
            </div>

            <div className="form-group">
              <label htmlFor="edocivil">Estado Civil</label>
              <input type="text" id="edocivil" value={edocivil} onChange={(e) => setEdocivil(e.target.value)} />
            </div> 

            <div className="form-group">
              <label htmlFor="mercantil">Num. reg. Mercantil</label>
              <input type="text" id="mercantil" value={mercantil} onChange={(e) => setMercantil(e.target.value)} />
            </div> 

            <div className="form-group">
              <label htmlFor="migrada">ID Persona Migrada</label>
              <input type="text" id="migrada" value={migrada} onChange={(e) => setMigrada(e.target.value)} />
            </div>             

          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Guardar Cambios'}
          </button>
                    
        </form>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Componente Encryptor para cifrar solicitudes */}
        {encrypting && dataToProcess && (
          <Encryptor
            password={encryptionPassword}
            message={JSON.stringify(dataToProcess.payload || dataToProcess)}
            onEncrypted={handleEncryptedData}
            onError={(errorMsg) => {
              setError(errorMsg);
              setEncrypting(false);
              setLoading(false);
              setLoadingGiros(false);
            }}
          />
        )}

        {/* Componente Decryptor para descifrar respuestas de giros */}
        {encryptedGirosData && (
          <Decryptor
            encryptedMessage={encryptedGirosData}
            password={encryptionPassword}
            onDecrypted={handleDecryptedGirosResponse}
            onError={(err) => {
              setError(err);
              setLoadingGiros(false);
              setEncrypting(false);
              setEncryptedGirosData(null);
            }}
          />
        )}

        {/* Componente Decryptor para respuestas de actualización de persona */}
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