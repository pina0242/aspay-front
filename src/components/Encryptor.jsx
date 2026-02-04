import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const Encryptor = ({ password, message, onEncrypted, onError }) => {
  const [isEncrypting, setIsEncrypting] = useState(true);

  useEffect(() => {
    const encryptData = async () => {
      if (!password || !message) {
        onError('Password and message are required');
        setIsEncrypting(false);
        return;
      }

      try {
        // 1. Generar valores aleatorios
        const salt = CryptoJS.lib.WordArray.random(16);
        const iv = CryptoJS.lib.WordArray.random(16);

        // 2. Derivación de clave
        const key = CryptoJS.PBKDF2(password, salt, {
          keySize: 8, // 256 bits (8 palabras de 32 bits)
          iterations: 100000,
          hasher: CryptoJS.algo.SHA256
        });

        // 3. Proceso de encriptación
        const encrypted = CryptoJS.AES.encrypt(message, key, {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });

        // 4. Formateo del resultado
        const combined = CryptoJS.lib.WordArray.create()
          .concat(salt)
          .concat(iv)
          .concat(encrypted.ciphertext);

        const result = combined
          .toString(CryptoJS.enc.Base64)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        onEncrypted(result);
      } catch (error) {
        onError(`Encryption failed: ${error.message}`);
      } finally {
        setIsEncrypting(false);
      }
    };
    encryptData();
  }, [password, message, onEncrypted, onError]);

  return null;
};

export default Encryptor;