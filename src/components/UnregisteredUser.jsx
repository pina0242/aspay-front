import React from 'react';
import { Link } from 'react-router-dom';

export const UnregisteredUser = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Acceso Denegado</h1>
      <p>Tu cuenta no está registrada en nuestro sistema o no tiene los permisos necesarios.</p>
      <p>Por favor, contacta al administrador para obtener acceso.</p>
      <Link to="/login">
        <button>Regresar al inicio de sesión</button>
      </Link>
    </div>
  );
};