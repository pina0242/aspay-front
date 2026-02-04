import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';
import { FaTrashAlt, FaSearch, FaCheckSquare, FaDownload, FaHourglassHalf } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

const exportToCsv = (data, filename) => {
    if (data.length === 0) return;
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            const escaped = value.replace(/"/g, '""'); 
            return `"${escaped}"`; 
        });
        csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const downloadFilename = `${filename.replace(/\.csv$/, '')}_detalle_pendientes.csv`;
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', downloadFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const Listsing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');

    // Estados de captura
    const [entidad, setEntidad] = useState(''); // Nuevo estado para Entidad
    const [fechaInicio, setFechaInicio] = useState('0001-01-01');
    const [fechaFin, setFechaFin] = useState('9999-12-31');
    
    const [listSingList, setListSingList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);
    const [isDownload, setIsDownload] = useState(false); 
    const [isSelectProcess, setIsSelectProcess] = useState(false); 

    useEffect(() => {
        if (!token) {
            setError("Token de autenticación no encontrado. Por favor, inicie sesión nuevamente.");
        }
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setListSingList([]);
        setIsDownload(false); 
        setIsSelectProcess(false);

        // Payload actualizado con Entidad
        const payload = {
            entidad: entidad,
            fecha_ini: fechaInicio,
            fecha_fin: fechaFin,
        };

        setEncrypting(true);
        setDataToProcess(payload);
    };

    // ... Handlers de clicks (handleDownloadClick, handleSelectProcessClick, handleEncryptedData, handleDecryptedResponse) 
    // se mantienen igual, el cambio solo afecta al payload inicial de búsqueda ...

    const handleDownloadClick = (item) => {
        setError('');
        setLoading(true);
        const payload = { id: String(item.id), entidad: item.entidad, filename: item.filename };
        setEncrypting(true);
        setIsDownload(true); 
        setIsSelectProcess(false);
        setDataToProcess(payload);
    };

    const handleSelectProcessClick = (item) => {
        setError('');
        setLoading(true);
        const payload = { id: String(item.id), entidad: item.entidad, filename: item.filename, inserted: item.inserted };
        setEncrypting(true);
        setIsDownload(false);
        setIsSelectProcess(true);
        setDataToProcess(payload);
    };

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);
        const endpoint = isDownload ? '/listsdet' : (isSelectProcess ? '/selproej' : '/listsing');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            if (response.status === 201) {
                const responseData = await response.json();
                if (isSelectProcess) {
                    navigate('/Selproej', { 
                        state: { 
                            token, 
                            encryptedData: responseData, 
                            entidad: dataToProcess.entidad,
                            filename: dataToProcess.filename,
                            ingestId: dataToProcess.id
                        } 
                    });
                    setLoading(false);
                } else {
                    setDecryptingResponse(responseData);
                }
            } else if (response.status === 401) {
                const errorData = await response.json();
                setError(errorData[0]?.response || 'Error de autenticación.');
                if (errorData.msg === "Token has expired") navigate('/login');
                setLoading(false);
            } else {
                const errorData = await response.json();
                setError(errorData[0]?.response || 'Error en la petición.');
                setLoading(false);
            }
        } catch (err) {
            setError('Error en la comunicación con el servidor.');
            setLoading(false);
        }
    };

    const handleDecryptedResponse = (data) => {
        if (isSelectProcess) {
             setLoading(false);
             setDecryptingResponse(null);
             return;
        }
        try {
            const parsedData = JSON.parse(data);
            if (isDownload) {
                if (Array.isArray(parsedData)) exportToCsv(parsedData, dataToProcess.filename);
                setIsDownload(false);
            } else if (Array.isArray(parsedData)) {
                setListSingList(parsedData);
            } else {
                setError('Respuesta inesperada.');
            }
        } catch (err) {
            setError("Error al procesar respuesta.");
        }
        setLoading(false);
        setDecryptingResponse(null);
    };

    const handleBorrarClick = (item) => navigate('/Delsing', { state: { token, ingestToDelete: item } });
    const handleConsultarClick = (item) => navigate('/Listsdet', { state: { token, id: item.id, entidad: item.entidad, filename: item.filename } });
    const handleAplicarClick = (item) => navigate('/Ejecarch', { state: { token, ingestToProcess: item } });
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return listSingList.slice(indexOfFirstItem, indexOfLastItem);
    }, [currentPage, listSingList]);
    const totalPages = Math.ceil(listSingList.length / itemsPerPage);

    return (
        <div className="main-container">
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
                        <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
                            <div className="product">Inicio</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="listusr-content-container">
                <h1 className="listusr-title">Consulta de Archivos</h1>
                <form className="listusr-form" onSubmit={handleSubmit}>
                    {/* CAMBIO: Agregado campo Entidad */}
                    <div className="form-group">
                        <label htmlFor="entidad">Entidad:</label>
                        <input 
                            type="text" 
                            id="entidad" 
                            value={entidad} 
                            onChange={(e) => setEntidad(e.target.value)} 
                            placeholder="Ej: 0001"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaInicio">Fecha de Inicio:</label>
                        <input 
                            type="text" 
                            id="fechaInicio" 
                            value={fechaInicio} 
                            onChange={(e) => setFechaInicio(e.target.value)} 
                            placeholder="YYYY-MM-DD"
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fechaFin">Fecha de Fin:</label>
                        <input 
                            type="text" 
                            id="fechaFin" 
                            value={fechaFin} 
                            onChange={(e) => setFechaFin(e.target.value)} 
                            placeholder="YYYY-MM-DD"
                            required 
                        />
                    </div>
                    <button type="submit" disabled={loading || encrypting}>
                        {(loading || encrypting) && !isDownload && !isSelectProcess ? 'Cargando...' : 'Consultar'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {listSingList.length > 0 && (
                    <div className="container">
                        <ItemList 
                            items={currentItems} 
                            onBorrarClick={handleBorrarClick}
                            onConsultarClick={handleConsultarClick}
                            onAplicarClick={handleAplicarClick}
                            onDownloadClick={handleDownloadClick}
                            onSelectProcessClick={handleSelectProcessClick}
                            isProcessing={loading || encrypting}
                        />
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                )}
            </div>

            {encrypting && (
                <Encryptor
                    password={encryptionPassword}
                    message={JSON.stringify(dataToProcess)}
                    onEncrypted={handleEncryptedData}
                    onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); }}
                />
            )}

            {decryptingResponse && !encrypting && (
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

// --- Subcomponentes ItemList y PaginationControls se mantienen idénticos ---
const ItemList = ({ items, onBorrarClick, onConsultarClick, onAplicarClick, onDownloadClick, onSelectProcessClick, isProcessing }) => (
    <div className="table-container">
        <h2 className="grid-title">Resultados de Archivos</h2>
        <table className="user-table">
            <thead>
                <tr>
                    <th>Acciones</th>
                    <th>ID</th>
                    <th>Entidad</th>
                    <th>Nombre Archivo</th>
                    <th>Total</th>
                    <th>Inválidos</th>
                    <th>Duplicados</th>
                    <th>Insertados</th>
                    <th>Pendiente</th>
                    <th>Saltados</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => {
                    const isApplicableOrDeletable = (item.inserted === item.pending);
                    return (
                        <tr key={item.id}> 
                            <td className="actions-cell">
                                <button className="icon-btn" onClick={() => onBorrarClick(item)} disabled={isProcessing || !isApplicableOrDeletable}><FaTrashAlt /></button>
                                <button className="icon-btn" onClick={() => onConsultarClick(item)} disabled={isProcessing}><FaSearch /></button>
                                <button className="icon-btn" onClick={() => onAplicarClick(item)} disabled={isProcessing || !isApplicableOrDeletable}><FaCheckSquare /></button>
                                <button className="icon-btn" onClick={() => onDownloadClick(item)} disabled={isProcessing}><FaDownload /></button>
                                <button className="icon-btn" onClick={() => onSelectProcessClick(item)} disabled={isProcessing || isApplicableOrDeletable}><FaHourglassHalf /></button>
                            </td>
                            <td>{item.id}</td>
                            <td>{item.entidad}</td>
                            <td>{item.filename}</td>
                            <td>{item.total}</td>
                            <td>{item.invalid}</td>
                            <td>{item.duplicates_in_file}</td>
                            <td>{item.inserted}</td>
                            <td>{item.pending}</td>
                            <td>{item.skipped_existing}</td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    const buttonStyle = { padding: '8px 15px', cursor: 'pointer' };
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '5px' }}>
                <li><button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} style={buttonStyle}>&laquo; Anterior</button></li>
                {pageNumbers.map(n => (
                    <li key={n}>
                        <button onClick={() => onPageChange(n)} style={{...buttonStyle, backgroundColor: n === currentPage ? '#beb6ecff' : 'white'}}>{n}</button>
                    </li>
                ))}
                <li><button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} style={buttonStyle}>Siguiente &raquo;</button></li>
            </ul>
        </nav>
    );
};