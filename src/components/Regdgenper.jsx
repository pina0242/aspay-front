import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regper.css'; // Reutilizar estilos

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regdgenper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');
  
  const [idpersona, setIdpersona] = useState('');
  const [nombre, setNombre] = useState('');
  const [appaterno, setAppaterno] = useState('');
  const [apmaterno, setApmaterno] = useState('');
  const [nacionalid, setNacionalid] = useState('');
  const [genero, SetGenero] = useState('');
  const [migrada, setMigrada] = useState('');
  const [entidad, setEntidad] = useState('');
  const [tipper,setTipper] = useState('');
  const [tipcte, setTipcte] = useState('');
  const [fecnac, setFecnac] = useState('');
  const [giro, setGiro] = useState('');
  const [ocupacion, setOcupacion] = useState('');
  const [mercantil, setMercantil] = useState('');
  const [edocivil, setEdocivil] = useState('');
  
  // Nuevos estados para la actividad económica
  const [actividadEconomica, setActividadEconomica] = useState('');
  const [giros, setGiros] = useState([]);
  const [loadingGiros, setLoadingGiros] = useState(false);
  const [encryptedGirosData, setEncryptedGirosData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [dataToProcess, setDataToProcess] = useState(null);
  
  // Estado para el primer combo
  const [paisnac, setPaisnac] = useState('');
  // Estado para las ciudades, que depende del país
  const [tipoid, setTipoid] = useState('');
  const [tipoidOpciones, setTipoidOpciones] = useState([]);

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

  // Objeto con las opciones de Id por país
  const IDPorPais = {
    España: ['DNI', 'NIE', 'CIF', 'PAS'],
    Portugal: ['CC', 'NIF', 'BI','PAS'],
  };

  // Manejador para el cambio en el primer combo
  const handlePaisChange = (e) => {
    const nuevoPais = e.target.value;
    setPaisnac(nuevoPais);
    setTipoidOpciones(IDPorPais[nuevoPais] || []);
    setTipoid('');
  };

  // Manejador para el cambio en el tipo de ID
  const handleTipoIdChange = (e) => {
    setTipoid(e.target.value);
  };

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

  // Función para cargar los giros desde el servicio /seltcorp
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

    const payload = {
      id_persona: idpersona,
      tipo_id: tipoid,
      nombre: nombre,
      ap_paterno: appaterno,
      ap_materno: apmaterno,
      genero: genero,
      tipo_per: tipper,
      tipo_cte: tipcte,
      fecha_nac_const: fecnac,
      ocupacion: ocupacion,
      giro: giro, // Este campo ahora contendrá la CLAVE del giro seleccionado
      pais_nac_const: paisnac,
      nacionalidad: nacionalid,
      estado_civil: edocivil,
      num_reg_mercantil: mercantil,
      ind_pers_migrada: migrada,
      entidad: entidad,
    };

    setEncrypting(true);
    setDataToProcess({ type: 'REGISTER_PERSON', payload });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regdgenper`, {
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
        const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar Persona.';
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
          navigate('/Listper', { state: { token } });
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
        <h1 className="regusr-title">Registrar persona</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-grid">
              <label htmlFor="idpersona">ID de Persona</label>
              <input type="text" id="idpersona" value={idpersona} onChange={(e) => setIdpersona(e.target.value)} maxLength="20" required />
              
              <label htmlFor="paisnac">Pais de Nacimiento</label>
              <select className="form-select" aria-label="Default select example" value={paisnac} onChange={handlePaisChange}>
                <option value="">Seleccione Pais de Nacimiento</option>
                {Object.keys(IDPorPais).map((pais) => (
                  <option key={pais} value={pais}>
                    {pais}
                  </option>
                ))}
              </select>  

              <label htmlFor="tipoid">Tipo de ID</label>
              <select 
                className="form-select" 
                value={tipoid} 
                onChange={handleTipoIdChange}
                required
                disabled={!paisnac}
              >
                <option value="">Selecciona un ID</option>
                {tipoidOpciones.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
              </select>   

              <label htmlFor="nombre">Nombre o Razón social</label>
              <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength="20" required />

              <label htmlFor="appaterno">Apellido Paterno</label>
              <input type="text" id="appaterno" value={appaterno} onChange={(e) => setAppaterno(e.target.value)} maxLength="20" />
              
              <label htmlFor="apmaterno">Apellido Materno</label>
              <input type="text" id="apmaterno" value={apmaterno} onChange={(e) => setApmaterno(e.target.value)} maxLength="20" />
              
              <label htmlFor="nacionalid">Nacionalidad</label>
              <input type="text" id="nacionalid" value={nacionalid} onChange={(e) => setNacionalid(e.target.value)} maxLength="20" />

              <label htmlFor="genero">Genero</label>
              <select className="form-select" aria-label="Default select example" value={genero} onChange={(e) => SetGenero(e.target.value)}>
                <option value="">Seleccione Genero</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="O">Otro</option>
              </select> 

              <label htmlFor="tipper">Tipo de Persona</label>
              <select className="form-select" aria-label="Default select example" value={tipper} onChange={(e) => setTipper(e.target.value)}>
                <option value="">Seleccione Tipo de Persona</option>
                <option value="F">Fisica</option>
                <option value="M">Moral</option>
              </select> 
             
              <label htmlFor="tipcte">Tipo de Cliente</label>
              <select className="form-select" aria-label="Default select example" value={tipcte} onChange={(e) => setTipcte(e.target.value)} required>
                <option value="">Seleccione Tipo de Cliente</option>
                <option value="1">Arrendador</option>
                <option value="2">Arrendatario</option>
                <option value="3">Ambos</option>
                <option value="0">Ninguno</option>
              </select> 
              
              <label htmlFor="fecnac">Fecha de Nac o Const</label>
              <input type="date" id="fecnac" value={fecnac} onChange={(e) => setFecnac(e.target.value)} maxLength="20" required />
              
              <label htmlFor="ocupacion">Ocupación</label>
              <input type="text" id="ocupacion" value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} maxLength="30" />

              {/* NUEVO CAMPO: Actividad Económica */}
              <label htmlFor="actividadEconomica">Actividad económica</label>
              <select 
                className="form-select" 
                value={actividadEconomica} 
                onChange={handleActividadEconomicaChange}
              >
                <option value="">Seleccione Actividad Económica</option>
                {opcionesActividadEconomica.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.etiqueta}
                  </option>
                ))}
              </select>

              {/* CAMPO GIRO ACTUALIZADO - ahora depende de la actividad económica */}
              <label htmlFor="giro">Giro</label>
              <select 
                className="form-select" 
                value={giro} 
                onChange={(e) => setGiro(e.target.value)}
                disabled={!actividadEconomica || loadingGiros}
              >
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

              <label htmlFor="edocivil">Estado Civil</label>
              <select className="form-select" aria-label="Default select example" value={edocivil} onChange={(e) => setEdocivil(e.target.value)}>
                <option value="">Seleccione Estado Civil</option>
                <option value="S">Soltero</option>
                <option value="C">Casado</option>
                <option value="O">Otro</option>
              </select>  
              
              <label htmlFor="mercantil">Num. Reg. Mercantil</label>
              <input type="number" id="mercantil" value={mercantil} onChange={(e) => setMercantil(e.target.value)} maxLength="20" /> 

              <label htmlFor="migrada">Ind Persona Migrada</label>
              <select className="form-select" aria-label="Default select example" value={migrada} onChange={(e) => setMigrada(e.target.value)}>
                <option value="">Persona Migrada</option>
                <option value="S">Si</option>
                <option value="N">No</option>
              </select>    
             <label htmlFor="entidad">Entidad</label>
              <input type="text" id="entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)} maxLength="4" />                                                    
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Persona'}
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

        {/* Componente Decryptor para respuestas del registro de persona */}
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