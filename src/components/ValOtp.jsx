import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';

console.log('estoy en ValOtp');
const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;
const translations = {
  es: {
    title: 'Verifica tu Código',
    subtitle: 'Hemos enviado un código a tu correo electrónico. Ingresa el código a continuación.',
    verify: 'Verificar',
    submitting: 'Verificando...',
    success: 'Verificación exitosa. Redirigiendo...',
    error: 'Error en la verificación. Código inválido o expirado.',
    emailNotProvided: 'Error: El correo electrónico no fue proporcionado.',
    invalidOtpLength: 'El código debe tener 6 dígitos.'
  },
};

export const ValOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const inputRefs = useRef([]);

  useEffect(() => {
    // Enfoca el primer campo al cargar el componente
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/[^0-9]/.test(value)) return; // Solo permite dígitos

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Mueve el foco al siguiente campo
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && index > 0 && !otp[index]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleApiRequest = async (encryptedBody) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/validotp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedBody)
      });
      
      console.log("Respuesta completa del servidor:", response);
      console.log("Código de estado (status):", response.status);

      if (response.status !== 201) {
        console.error("Error del servidor. Código de estado:", response.status);
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : translations.es.error;
        console.error("Mensaje de error del servidor:", errorMessage);
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      const responseData = await response.json();
      // Iniciar el proceso de descifrado con la respuesta del API
      setDecryptingResponse(responseData);

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError(translations.es.emailNotProvided);
      setLoading(false);
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError(translations.es.invalidOtpLength);
      setLoading(false);
      return;
    }

    const payload = {
      email,
      codigo: otpCode
    };

    setEncrypting(true);
  };

  const handleEncryptedData = (result) => {
    setEncrypting(false);
    handleApiRequest(result);
  };

  const handleDecryptedResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      if (parsedData && parsedData[0]?.response) {
        setSuccess(translations.es.success);
        const token = parsedData[0].response;
        //console.log(token)
        setTimeout(() => {
          navigate('/Principal', { state: { token: token } });
        }, 2000);
      } else {
        setError(translations.es.error);
      }
    } catch (err) {
      console.error("Error al procesar la respuesta descifrada:", err);
      setError("Respuesta inesperada del servidor.");
    }
    setLoading(false);
    setDecryptingResponse(null); // Limpiar el estado para evitar re-renderizados
  };

  return (
    <div className="stitch-design">
      <div className="stitch-design2">
        <div className="depth-0-frame-0">
          <div className="depth-1-frame-0">
            <div className="depth-2-frame-1">
              <div className="depth-3-frame-02">
                <div className="depth-4-frame-14">
                  <div className="enter-your-code">{translations.es.title}</div>
                  <div className="we-sent-a-code-to-your-phone-number-ending-in-1234">{translations.es.subtitle}</div>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="depth-4-frame-22">
                    <div className="depth-5-frame-09">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength="1"
                          className="depth-6-frame-06"
                          value={digit}
                          onChange={(e) => handleChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          ref={el => inputRefs.current[index] = el}
                          required
                        />
                      ))}
                    </div>
                  </div>
                  <div className="depth-4-frame-33">
                    <button type="submit" disabled={loading}>
                      <div className="verify">{loading ? translations.es.submitting : translations.es.verify}</div>
                    </button>
                  </div>
                </form>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify({
            email: email,
            codigo: otp.join('')
          })}
          onEncrypted={handleEncryptedData}
          onError={(errorMsg) => {
            setError(errorMsg);
            setEncrypting(false);
          }}
        />
      )}
      {decryptingResponse && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={handleDecryptedResponse}
          onError={(err) => {
            setError(err);
            setLoading(false);
            setDecryptingResponse(null);
          }}
        />
      )}
    </div>
  );
};