import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/principal.css';
import '../styles/style.css'; 

// 1. Array de configuración actualizado para incluir submenús en 'PERSONAS'.
const DROPDOWN_CONFIG = {
    OPERACIONES: [
        { label: 'Cat. Layout', path: '/ListLayout' },
        { label: 'Files', path: '/Files' },
        { label: 'Consulta Pendientes', path: '/Listsing' },
        { label: 'Consulta Procesados', path: '/Listproc' },
    ],
    // ESTRUCTURA DE SUBMENÚS ANIDADA EN 'PERSONAS'
    PERSONAS: [
        { 
            label: 'Personas', 
            submenuItems: [
                { label: 'Alta Persona', path: '/regdgenper' },
                { label: 'Lista Persona', path: '/Listper' },
            ]
        },
        {
            label: 'Datos complementarios', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Alta datos Complementarios', path: '/Regdatcom' },
                { label: 'Lista datos Complementarios', path: '/Listdatcom' },
            ]
        },
        {
            label: 'Direcciones', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Alta de Direcciones', path: '/Regdir' },
                { label: 'Lista Direcciones', path: '/Listdir' },
            ]
        },
        {
            label: 'Relaciones', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Alta de Relaciones', path: '/Regrel' },
                { label: 'Lista Relaciones', path: '/Listrel' },
            ]
        },
        {
            label: 'Cuentas', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Alta de Cuentas', path: '/Regcta' },
                { label: 'Lista Cuentas', path: '/Listcta' },
            ]
        },
        {
            label: 'Documentos', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Reg Docto', path: '/Regdocto' },
                { label: 'Buscar Docto', path: '/Listdoc' },
            ]
        },
        {
            label: 'Calif KYC', // Nuevo grupo de submenú
            submenuItems: [
                { label: 'Reg KYC', path: '/Regkyc' },
                { label: 'Buscar KYC', path: '/Listkyc' },
            ]
        },
    ],
    AGREGADORA: [
        { label: 'Alta de categoria', path: '/Regcateg' },
        { label: 'Listado categoria', path: '/Listcateg' },
        { label: 'Agregadora', path: '/Listagreg' },
        // { label: 'Graficos', path: '/Listgrap' },

    ],
    CONFIG: [
        { label: 'Parametros de operacion', path: '/Seltcorp' },
        { label: 'WAF', path: '/Listwaf' },
        { label: 'Analitics', path: '/Stats' },
        { label: 'Logs', path: '/Listlogs' },
    ],
    CONTROL: [
        { 
            label: 'Entidades', 
            submenuItems: [
                { label: 'Ver Entidades', path: '/Listent' },
            ]
        },
        { 
            label: 'Autorizaciones', 
            submenuItems: [
                { label: 'Registrar OTP', path: '/Registotp' },
                { label: 'Autorizaciones', path: '/Lisauts' },
                { label: 'Reg Aut/Serv', path: '/Listusrauts' },
            ]
        },
        { 
            label: 'Uso Transaccional', 
            submenuItems: [
                { label: 'Uso de Servicio', path: '/Listustran' },
            ]
        },
        { 
            label: 'Costos x Tipo Transaccion', 
            submenuItems: [
                { label: 'Registrar Costo', path: '/Regcosto' },
                { label: 'Consultar Costos', path: '/Listcosto' },
            ]
        },

        { 
            label: 'Control monitoreo', 
            submenuItems: [
                { label: 'MOnitoreo', path: '/Listmon' },
            ]
        }

    ],
};

export const Principal = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [dropdownsOpen, setDropdownsOpen] = useState({});
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const token = location.state?.token || localStorage.getItem('userToken');

    useEffect(() => {
        if (token) {
            localStorage.setItem('userToken', token);
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        setIsAuthenticated(false);
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
    };

    /**
     * Función de Toggle Centralizada para Dropdowns
     */
    const toggleDropdown = (name) => {
        setDropdownsOpen(prev => {
            const isCurrentlyOpen = prev[name];
            const newDropdownsOpen = Object.fromEntries(
                Object.keys(DROPDOWN_CONFIG).map(key => [key, false])
            );
            return {
                ...newDropdownsOpen,
                [name]: !isCurrentlyOpen,
            };
        });
    };
    
    /**
     * Función de Navegación Universal
     */
    const handleNavigation = useCallback((path, dropdownName) => () => {
        navigate(path, { state: { token: token } });
        
        // Cierra el dropdown después de la navegación
        if (dropdownName) {
            setDropdownsOpen(prev => ({ ...prev, [dropdownName]: false }));
        }
    }, [navigate, token]);
    
    // Manejadores para Items SIN Dropdown
    const handleUsuariosClick = handleNavigation('/Listusr');
    const handleListranClick = handleNavigation('/Listnivtran');

    /**
     * 2. Función de Renderizado de Dropdowns (Actualizada para Submenús)
     */
    const renderDropdown = (name, label) => {
        const items = DROPDOWN_CONFIG[name];
        const isOpen = dropdownsOpen[name];
        const [openSubmenu, setOpenSubmenu] = useState(null);


        if (!items) return null;

        return (
            <div 
                className="depth-5-frame-02 dropdown" 
                onClick={() => toggleDropdown(name)} 
                style={{ cursor: 'pointer' }}
            >
                <div className="roles">{label}</div>
               
{isOpen && (
    
  <div className="dropdown-menu">
    {items.map((group, index) => (
      <div key={index} className="dropdown-group">

        {group.submenuItems ? (
          <>
            {/* HEADER DEL SUBMENU */}
            <div
              className="dropdown-group-label"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpenSubmenu(openSubmenu === index ? null : index);
                }}
              style={{ cursor: "pointer" }}
            >
              {group.label}
              <span>{openSubmenu === index ? " ▲" : " ▼"}</span>
            </div>

            {/* CONTENIDO DEL SUBMENU */}
            
            {openSubmenu === index && (
              <div className="dropdown-submenu">
                {group.submenuItems.map(item => (
                  <div
                    key={item.path}
                    className="dropdown-item"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation(item.path, name)();
                        }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="dropdown-item"
            onClick={handleNavigation(group.path, name)}
          >
            {group.label}
          </div>
        )}

      </div>
    ))}
  </div>
)}

            </div>
        );
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
                        {/* Items sin Dropdown */}
                        <div className="depth-5-frame-02" onClick={handleUsuariosClick} style={{ cursor: 'pointer' }}>
                            <div className="usuarios">Usuarios</div>
                        </div>
                        <div className="depth-5-frame-02" onClick={handleListranClick} style={{ cursor: 'pointer' }}>
                            <div className="roles">Roles</div>
                        </div>
                        
                        {/* Dropdowns Renderizados de forma Reutilizable */}
                        {renderDropdown('OPERACIONES', 'Operaciones')}
                        {renderDropdown('PERSONAS', 'Pers/Ctas')}
                        {renderDropdown('AGREGADORA', 'Agregadora')}
                        {renderDropdown('CONFIG', 'Config')}
                        {renderDropdown('CONTROL', 'Control')}

                    </div>
                    <div className="depth-4-frame-12">
                        <div 
                            className="depth-5-frame-03" 
                            onClick={isAuthenticated ? handleLogout : () => navigate('/login')} 
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="log-in">
                                {isAuthenticated ? 'Log out' : 'Log in'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ padding: '24px', textAlign: 'center' }}>
                <h1>Welcome</h1>
                <p>Sistema de Administracion ASPAY</p>
            </div>
        </div>
    );
};