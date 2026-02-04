import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Regusr = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [claveColab, setClaveColab] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [tipo, setTipo] = useState('');
  const [password, setPassword] = useState('');
  const [nivel, setNivel] = useState('');
  const [usuarioAlt, setUsuarioAlt] = useState('');

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

    const payload = {
      claveColab: claveColab,
      name: name,
      email: email,
      tel: tel,
      tipo: tipo,
      password: password,
      nivel: nivel,
      usuario_alt: usuarioAlt,
    };

    setEncrypting(true);
    setDataToProcess(payload); // Iniciar el proceso de cifrado
  };

  const handleEncryptedData = async (encryptedBody) => {
   setEncrypting(false);
   
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/regusr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
        });

    const responseData = await response.json();
    if (response.status === 201) {
    // Corrección: Pasar el objeto de respuesta completo para descifrar, como en Listusr
        setDataToProcess(responseData);
     } else {
    // En caso de error, el JSON contiene el mensaje de error
    const errorMessage = responseData && responseData[0]?.response ? responseData[0].response : 'Error al registrar el usuario.';
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
      if (message) {
        setSuccess(message);
        // Redirigir a Listusr después de 2 segundos en caso de éxito
        setTimeout(() => {
          navigate('/listusr', { state: { token } });
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
            <div className="acme-co">BALQUILER</div>
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
        <h1 className="regusr-title">Alta de Usuario</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="claveColab">Clave Colaborador (10 pos):</label>
            <input type="text" id="claveColab" value={claveColab} onChange={(e) => setClaveColab(e.target.value)} maxLength="10" required />
          </div>
          <div className="form-group">
            <label htmlFor="name">Nombre (60 pos):</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength="60" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="tel">Tel:</label>
            <input type="text" id="tel" value={tel} onChange={(e) => setTel(e.target.value)} maxLength="15" required  />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">Tipo (1 pos):</label>
            <input type="text" id="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} maxLength="1" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (10 pos):</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength="10" required />
          </div>
          <div className="form-group">
            <label htmlFor="nivel">Nivel (1 pos, numérico):</label>
            <input type="number" id="nivel" value={nivel} onChange={(e) => setNivel(e.target.value)} min="0" max="9" required />
          </div>
          <div className="form-group">
            <label htmlFor="usuarioAlt">Usuario Alta (8 pos):</label>
            <input type="text" id="usuarioAlt" value={usuarioAlt} onChange={(e) => setUsuarioAlt(e.target.value)} maxLength="8" required />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Registrar Usuario'}
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