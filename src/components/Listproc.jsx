import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css';
import { FaSearch, FaDownload } from 'react-icons/fa'; 

const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

/**
 * Función que convierte un array de objetos a CSV y dispara la descarga.
 */
const exportToCsv = (data, filename) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] === null || row[header] === undefined ? '' : String(row[header]);
            return `"${value.replace(/"/g, '""')}"`; 
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_detalle_ejecucion.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const Listproc = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const token = location.state?.token || localStorage.getItem('userToken');

    // --- Estados ---
    const [entidad, setEntidad] = useState(''); // Nuevo: Estado Entidad
    const [fechaInicio, setFechaInicio] = useState('0001-01-01');
    const [fechaFin, setFechaFin] = useState('9999-12-31');
    const [listProcList, setListProcList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [encrypting, setEncrypting] = useState(false);
    const [dataToProcess, setDataToProcess] = useState(null);
    const [decryptingResponse, setDecryptingResponse] = useState(null);
    const [isDownload, setIsDownload] = useState(false); 

    useEffect(() => {
        if (!token) setError("Token no encontrado. Inicie sesión nuevamente.");
    }, [token]);

    // --- Handlers ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setListProcList([]);
        setIsDownload(false);

        const payload = {
            entidad: entidad, 
            fecha_ini: fechaInicio,
            fecha_fin: fechaFin,
        };

        setEncrypting(true);
        setDataToProcess(payload);
    };

    const handleDownloadClick = (item) => {
        setError('');
        setLoading(true);
        setIsDownload(true); 
        
        const payload = {
            id: String(item.id), 
            entidad: item.entidad, 
            filename: item.filename,
        };
        
        setEncrypting(true);
        setDataToProcess(payload);
    };

    const handleEncryptedData = async (encryptedBody) => {
        setEncrypting(false);
        const endpoint = isDownload ? '/listpdet' : '/listproc';

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${token}`
                },
                body: JSON.stringify(encryptedBody)
            });

            const responseData = await response.json();

            if (response.status === 201) {
                setDecryptingResponse(responseData);
            } else {
                const msg = responseData?.[0]?.response || (isDownload ? 'Error en descarga' : 'Error en consulta');
                setError(msg);
                setLoading(false);
                setIsDownload(false);
                if (response.status === 401 && responseData.msg === "Token has expired") navigate('/login');
            }
        } catch (err) {
            setError('Error de comunicación con el servidor.');
            setLoading(false);
            setIsDownload(false);
        }
    };

    const handleDecryptedResponse = (data) => {
        try {
            const parsedData = JSON.parse(data);
            if (isDownload) {
                if (Array.isArray(parsedData)) exportToCsv(parsedData, dataToProcess.filename);
                setIsDownload(false);
            } else if (Array.isArray(parsedData)) {
                setListProcList(parsedData);
            }
        } catch (err) {
            setError("Error al procesar la respuesta.");
        }
        setLoading(false);
        setDecryptingResponse(null);
    };

    // --- Paginación ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; 
    const currentItems = useMemo(() => {
        const last = currentPage * itemsPerPage;
        return listProcList.slice(last - itemsPerPage, last);
    }, [currentPage, listProcList]);
    const totalPages = Math.ceil(listProcList.length / itemsPerPage);

    return (
        <div className="main-container">
            {/* Header simplificado por brevedad */}
            <div className="depth-2-frame-0">
                <div className="depth-4-frame-1"><div className="acme-co">ASPAY</div></div>
                <div className="depth-4-frame-02">
                    <button className="product" onClick={() => navigate(-1)}>Regresar</button>
                    <button className="product" onClick={() => navigate('/Principal', { state: { token } })}>Inicio</button>
                </div>
            </div>

            <div className="listusr-content-container">
                <h1 className="listusr-title">Consulta de Archivos Procesados</h1>
                
                <form className="listusr-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Entidad:</label>
                        <input type="text" value={entidad} onChange={(e) => setEntidad(e.target.value)} placeholder="Ej: 0001" required />
                    </div>
                    <div className="form-group">
                        <label>Fecha Inicio:</label>
                        <input type="text" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} placeholder="YYYY-MM-DD" required />
                    </div>
                    <div className="form-group">
                        <label>Fecha Fin:</label>
                        <input type="text" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} placeholder="YYYY-MM-DD" required />
                    </div>
                    <button type="submit" disabled={loading || encrypting}>
                        {(loading || encrypting) && !isDownload ? 'Cargando...' : 'Consultar'}
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}

                {listProcList.length > 0 && (
                    <div className="container">
                        <ItemList 
                            items={currentItems} 
                            handleConsultarClick={(item) => navigate('/Listpdet', { state: { token, id: item.id, entidad: item.entidad, filename: item.filename } })}
                            onDownloadClick={handleDownloadClick}
                            isProcessing={loading || encrypting}
                        />
                        <PaginationControls 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                )}
            </div>

            {encrypting && (
                <Encryptor password={encryptionPassword} message={JSON.stringify(dataToProcess)} onEncrypted={handleEncryptedData} onError={(m)=>{setError(m); setEncrypting(false); setLoading(false);}} />
            )}
            {decryptingResponse && (
                <Decryptor encryptedMessage={decryptingResponse} password={encryptionPassword} onDecrypted={handleDecryptedResponse} onError={(e)=>{setError(e); setLoading(false);}} />
            )}
        </div>
    );
};

// --- Subcomponentes ---

const ItemList = ({ items, handleConsultarClick, onDownloadClick, isProcessing }) => (
    <div className="table-container">
        <h2 className="grid-title">Resultados</h2>
        <table className="user-table">
            <thead>
                <tr>
                    <th>Acciones</th>
                    <th>ID</th>
                    <th>Entidad</th>
                    <th>Archivo</th>
                    <th>Total</th>
                    <th>Insertados</th>
                    <th>Saltados</th>
                </tr>
            </thead>
            <tbody>
                {items.map((item) => (
                    <tr key={item.id}> 
                        <td className="actions-cell">
                            <button className="icon-btn" onClick={() => handleConsultarClick(item)} disabled={isProcessing}><FaSearch /></button>
                            <button className="icon-btn" onClick={() => onDownloadClick(item)} disabled={isProcessing}><FaDownload /></button>
                        </td>
                        <td>{item.id}</td>
                        <td>{item.entidad}</td>
                        <td>{item.filename}</td>
                        <td>{item.total}</td>
                        <td>{item.inserted}</td>
                        <td>{item.skipped_existing}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px' }}>
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
            {pages.map(n => (
                <button key={n} onClick={() => onPageChange(n)} style={{ backgroundColor: n === currentPage ? '#beb6ecff' : 'white' }}>{n}</button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
        </nav>
    );
};