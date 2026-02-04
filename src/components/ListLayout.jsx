import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';
import { FaTrashAlt, FaEdit } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const ListLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');

    // Estados de captura (Inicializados según tu JSON de ejemplo)
    const [entidad, setEntidad] = useState('');
    const [fechaInicio, setFechaInicio] = useState('0001-01-01');
    const [fechaFin, setFechaFin] = useState('9999-12-31');
    
    const [layoutList, setLayoutList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);

    useEffect(() => {
        if (!token) {
            setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
        }
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setLayoutList([]);

        // Payload según tu requerimiento
        const payload = {
            entidad: entidad,
            fecha_ini: fechaInicio,
            fecha_fin: fechaFin,
        };

        setEncrypting(true);
        setDataToProcess(payload);
    };

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/listlayout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();

            if (response.status === 201) {
                // Si es exitoso, procedemos a desencriptar
                setDecryptingResponse(responseData);
            } else {
                // En caso de error (400, 401, 500), recuperamos el mensaje directamente del JSON sin desencriptar
                const errorMsg = responseData[0]?.response || 'Error en la petición.';
                setError(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            setError('Error en la comunicación con el servidor.');
            setLoading(false);
        }
    };

    const handleDecryptedResponse = (data) => {
        try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                setLayoutList(parsedData);
            } else {
                setError('Respuesta inesperada del servidor.');
            }
        } catch (err) {
            setError("Error al procesar la respuesta desencriptada.");
        }
        setLoading(false);
        setDecryptingResponse(null);
    };

    // Navegación de botones de acción
    const handleEdit = (item) => navigate('/UpdLayout', { state: { token, layout: item } });
    const handleBorrar = (item) => navigate('/DelLayout', { state: { token, layout: item } });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; 
    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return layoutList.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, layoutList]);
    const totalPages = Math.ceil(layoutList.length / itemsPerPage);

    return (
        <div className="main-container">
            {/* Header con Menú solicitado */}
            <div className="depth-2-frame-0">
                <div className="depth-3-frame-0">
                    <div className="depth-4-frame-1">
                        <div className="acme-co">ASPAY</div>
                    </div>
                </div>
                <div className="depth-3-frame-1">
                    <div className="depth-4-frame-02">
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
                            <div className="product">Regresar</div>
                        </div>
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/RegLayout', { state: { token } })}>
                            <div className="product">Reg_Layout</div>
                        </div>
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
                            <div className="product">Inicio</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="listusr-content-container">
                <h1 className="listusr-title">Catálogo de Layouts</h1>
                
                <form className="listusr-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Entidad:</label>
                        <input 
                            placeholder="Ej: 0001"
                            type="text" 
                            value={entidad} 
                            onChange={(e) => setEntidad(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha Inicio:</label>
                        <input 
                            type="text" 
                            value={fechaInicio} 
                            onChange={(e) => setFechaInicio(e.target.value)} 
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                    <div className="form-group">
                        <label>Fecha Fin:</label>
                        <input 
                            type="text" 
                            value={fechaFin} 
                            onChange={(e) => setFechaFin(e.target.value)} 
                            placeholder="YYYY-MM-DD"
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Procesando...' : 'Consultar'}
                    </button>
                </form>

                {error && <div className="error-message" style={{marginTop: '20px'}}>{error}</div>}

                {layoutList.length > 0 && (
                    <div className="container">
                        <div className="table-container">
                            <h2 className="grid-title">Registros de Layout</h2>
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        <th>Acciones</th>
                                        <th>ID</th>
                                        <th>Entidad</th>
                                        <th>Llave</th>
                                        <th>Clave (Archivo)</th>
                                        <th>Datos (Campo)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="actions-cell">
                                                <button className="icon-btn" title="Modificar" onClick={() => handleEdit(item)}>
                                                    <FaEdit />
                                                </button>
                                                <button className="icon-btn" title="Borrar" onClick={() => handleBorrar(item)}>
                                                    <FaTrashAlt />
                                                </button>
                                            </td>
                                            <td>{item.id}</td>
                                            <td>{item.entidad}</td>
                                            <td>{item.llave}</td>
                                            <td>{item.clave}</td>
                                            <td>{item.datos}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {totalPages > 1 && (
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Componentes de Seguridad */}
            {encrypting && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(dataToProcess)}
                    onEncrypted={handleEncryptedData}
                    onError={(msg) => { setError(msg); setLoading(false); setEncrypting(false); }}
                />
            )}

            {decryptingResponse && (
                <Decryptor
                    encryptedMessage={decryptingResponse}
                    password={encryptionPassword}
                    onDecrypted={handleDecryptedResponse}
                    onError={(err) => { setError(err); setLoading(false); setDecryptingResponse(null); }}
                />
            )}
        </div>
    );
};

// Subcomponente de Paginación
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '5px' }}>
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        &laquo;
                    </button>
                </li>
                {pageNumbers.map(n => (
                    <li key={n}>
                        <button 
                            onClick={() => onPageChange(n)} 
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                backgroundColor: n === currentPage ? '#beb6ecff' : 'white',
                                color: n === currentPage ? 'white' : 'black',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}
                        >
                            {n}
                        </button>
                    </li>
                ))}
                <li>
                    <button 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                    >
                        &raquo;
                    </button>
                </li>
            </ul>
        </nav>
    );
};