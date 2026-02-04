import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const Decryptor = ({ password, encryptedMessage, onDecrypted, onError }) => {
  const [isDecrypting, setIsDecrypting] = useState(true);

  useEffect(() => {
    const decryptData = () => {
      try {
        if (!password || !encryptedMessage) {
          throw new Error('Password and encrypted message are required');
        }

        // 1. Convertir Base64 URL-safe a estándar
        let base64 = encryptedMessage
          .replace(/-/g, '+')
          .replace(/_/g, '/');

        // 2. Añadir padding si es necesario
        const pad = base64.length % 4;
        if (pad) base64 += '==='.slice(0, 4 - pad);

        // 3. Decodificar a WordArray
        const decoded = CryptoJS.enc.Base64.parse(base64);
        const decodedStr = CryptoJS.enc.Hex.stringify(decoded);

        // 4. Extraer componentes (salt:16, iv:16, ciphertext:resto)
        const salt = CryptoJS.enc.Hex.parse(decodedStr.substr(0, 32));
        const iv = CryptoJS.enc.Hex.parse(decodedStr.substr(32, 32));
        const ciphertext = CryptoJS.enc.Hex.parse(decodedStr.substr(64));

        // 5. Derivar clave
        const key = CryptoJS.PBKDF2(password, salt, {
          keySize: 256/32,
          iterations: 100000,
          hasher: CryptoJS.algo.SHA256
        });

        // 6. Descifrar
        const decrypted = CryptoJS.AES.decrypt(
          { ciphertext: ciphertext },
          key,
          { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
        );

        // 7. Convertir a string UTF-8
        const result = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!result) {
          throw new Error('Decryption failed - possibly wrong password');
        }
        console.log('está decriptando')
        onDecrypted(result);
      } catch (error) {
        onError(error.message);
      } finally {
        setIsDecrypting(false);
      }
    };

    decryptData();
  }, [password, encryptedMessage, onDecrypted, onError]);

  return null;
};




export default Decryptor;