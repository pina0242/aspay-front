import React, { useState } from 'react';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Cypher = () => {
  const [inputText, setInputText] = useState('');
  const [encryptedText, setEncryptedText] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [showEncryptor, setShowEncryptor] = useState(false);
  const [showDecryptor, setShowDecryptor] = useState(false);

  const handleEncryptClick = () => {
    setShowEncryptor(true);
    setError('');
    setDecryptedText('');
    setEncryptedText('');
  };

  const handleDecryptClick = () => {
    setShowDecryptor(true);
    setError('');
    setDecryptedText('');
  };

  return (
    <div>
      <h2>Encriptador y Desencriptador</h2>
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Ingrese el mensaje"
      />
      <button onClick={handleEncryptClick}>Cifrar</button>

      {showEncryptor && (
        <Encryptor
          password={encryptionPassword}
          message={inputText}
          onEncrypted={(result) => {
            setEncryptedText(result);
            setShowEncryptor(false);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setShowEncryptor(false);
          }}
        />
      )}

      {encryptedText && (
        <div>
          <h3>Resultado Encriptado:</h3>
          <code>{encryptedText}</code>
          <button onClick={handleDecryptClick}>Descifrar</button>
        </div>
      )}

      {showDecryptor && (
        <Decryptor
          password={encryptionPassword}
          encryptedMessage={encryptedText}
          onDecrypted={(result) => {
            setDecryptedText(result);
            setShowDecryptor(false);
          }}
          onError={(errorMsg) => {
            setError(errorMsg);
            setShowDecryptor(false);
          }}
        />
      )}

      {decryptedText && (
        <div>
          <h3>Mensaje Descifrado:</h3>
          <code>{decryptedText}</code>
        </div>
      )}

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
    </div>
  );
};
