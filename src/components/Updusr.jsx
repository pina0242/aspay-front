import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/regusr.css';

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Updusr = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, userToEdit } = location.state || {};

  const [idcolab, setIdcolab] = useState('');
  const [claveColab, setClaveColab] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
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
      setError("Authentication token not found. Please log in again.");
    }
    if (userToEdit) {
      setIdcolab(userToEdit.id || '');
      setClaveColab(userToEdit.claveColab || '');
      setName(userToEdit.name || '');
      setEmail(userToEdit.email || '');
      setTel(userToEdit.tel || '');
      setPassword(''); // La contraseña siempre se inicializa en blanco para que sea opcional
      setNivel(userToEdit.nivel || '');
      setUsuarioAlt(userToEdit.usuario_alta || '');
    }
  }, [token, userToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const payload = {
      idcolab: idcolab,
      clvcol: claveColab,
      name: name,
      email: email,
      tel: tel,
      passuser: password,
      nivel: nivel,
      usuario_alt: usuarioAlt,
    };

    setEncrypting(true);
    setDataToProcess(payload);
  };

  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updusr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      const responseData = await response.json();

      if (response.status === 201) {
        setDataToProcess(responseData);
      } else {
        const errorData = responseData[0]?.response ? responseData[0].response : 'Error updating user.';
        setError(errorData);
        setLoading(false);
      }
    } catch (err) {
      console.error('API call error:', err);
      setError('Communication error with the server.');
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
          navigate('/listusr', { state: { token } });
        }, 2000);
      } else {
        setError('Unexpected server response.');
      }
    } catch (err) {
      console.error("Error processing decrypted response:", err);
      setError("Unexpected server response.");
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
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>

      <div className="regusr-content-container">
        <h1 className="regusr-title">Editar Usuario</h1>
        <form className="regusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="idcolab">ID:</label>
            <input type="text" id="idcolab" value={idcolab} disabled />
          </div>
          <div className="form-group">
            <label htmlFor="claveColab">Clave Colaborador:</label>
            <input type="text" id="claveColab" value={claveColab} onChange={(e) => setClaveColab(e.target.value)} maxLength="10" required />
          </div>
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength="60" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="tel">Tel:</label>
            <input type="text" id="tel" value={tel} onChange={(e) => setTel(e.target.value)} maxLength="15" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (opcional):</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} maxLength="10" />
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