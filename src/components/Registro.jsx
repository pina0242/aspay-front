import React from 'react';
import '../styles/style.css';

const translations = {
  es: {
    title: 'Iniciar Sesión',
    submit: 'Iniciar Sesión con Microsoft',
    alreadyAccount: '¿Ya tienes una cuenta?',
    logIn: 'Inicia sesión',
    errorGeneral: 'Error en el inicio de sesión',
  },
};

export const Registro = () => {
  const handleLogin = () => {
    // Redirige al backend para iniciar el proceso de Microsoft OAuth.
    // El parámetro `prompt=select_account` le dice a Microsoft que
    // obligue al usuario a elegir una cuenta, incluso si ya hay una sesión activa.
    window.location.href = 'http://localhost:9000/login?prompt=select_account';
  };

  return (
    <div className="stitch-design">
      <div className="stitch-design2">
        <div className="depth-0-frame-0">
          <div className="depth-1-frame-0">
            <div className="depth-2-frame-1">
              <div className="depth-3-frame-02">
                <div className="depth-4-frame-03">
                  <div className="start-your-free-trial">{translations.es.title}</div>
                </div>
                {/* Botón de Inicio de Sesión con OAuth */}
                <div className="depth-4-frame-6">
                  <div className="depth-5-frame-06">
                    <button type="button" className="depth-6-frame-04" onClick={handleLogin}>
                      <div className="start-free-trial">
                        {translations.es.submit}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};