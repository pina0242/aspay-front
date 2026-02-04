import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Encryptor from './Encryptor';
import Decryptor from './Decryptor';
import '../styles/principal.css';
import '../styles/listusr.css'; 
import '../styles/Movimientos.css'; 
import { FaRegMoneyBillAlt, FaSpinner } from 'react-icons/fa'; 
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";


const encryptionPassword = import.meta.env.VITE_ENCRYPTION_PASSWORD;

export const Listagreg = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = location.state?.token || localStorage.getItem('userToken');

  const [entidad, setEntidad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [encrypting, setEncrypting] = useState(false);
  const [decryptingResponse, setDecryptingResponse] = useState(null);
  const [ctasaList, setctasaList] = useState([]);
  const [totales, setTotales] = useState(null);
  const [movimientosData, setMovimientosData] = useState([]);
  const [saldoData, setSaldoData] = useState([]);
  const [itemToDisplaySaldo, setItemToDisplaySaldo] = useState(null); 
  const [isSaldoLoading, setIsSaldoLoading] = useState(false); 
  const [showMovimientosModal, setShowMovimientosModal] = useState(false);
  const data = [
    { month: "Jan", a: 30, b: 20 },
    { month: "Feb", a: 50, b: 40 },
    { month: "Mar", a: 40, b: 60 },
    { month: "Apr", a: 25, b: 35 },
    { month: "May", a: 45, b: 55 },
    { month: "Jun", a: 35, b: 30 }
  ];

  
  useEffect(() => {
    if (!token) setError("Token no encontrado.");
  }, [token]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setctasaList([]);
    setTotales(null);
    setEncrypting(true);
    setDecryptingResponse({ entidad });
  };

  const handleSaldoClick = (item) => {
    setError('');
    setItemToDisplaySaldo(item); 
    setIsSaldoLoading(true); 
    setEncrypting(true);
    setDecryptingResponse({
      entidad: item.entban,
      tknper: item.entban === '9999' ? item.tknper : item.datos,
      alias: item.alias
    });
  };


  const handleDecryptedListResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      console.log("Datos Crudos:", parsedData); 


      if (Array.isArray(parsedData)) {

        const objResumen = parsedData.find(item => item.AGREGADORA !== undefined || item.resumen);
        setTotales(objResumen?.resumen || objResumen || null);


        const soloCuentas = parsedData.filter(item => item.entidad || item.datos);
        setctasaList(soloCuentas);
      }
    } catch (err) {
      setError("Error al procesar la lista.");
    } finally {
      setLoading(false);
      setDecryptingResponse(null);
    }
  };

  const handleDecryptedSaldoResponse = (data) => {
    try {
      const parsedData = JSON.parse(data);
      
      setMovimientosData(typeof parsedData.movimientos === 'string' ? JSON.parse(parsedData.movimientos) : (parsedData.movimientos || []));
      setShowMovimientosModal(true);
    } catch (err) {
      setError("Error en movimientos.");
      console.log('nooooo')
      setShowMovimientosModal(false);
    } finally {
      setIsSaldoLoading(false);
      setDecryptingResponse(null);
    }
    
  };


  const handleEncryptedData = async (encryptedBody) => {
    setEncrypting(false);


    const AUTH_KEYWORDS = ['usuario', 'autorización', 'permiso', 'acceso', 'rol', 'privilegio'];
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/selctaagr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify(encryptedBody)
      });

      // Validación para status 401 - Sesión caducada
      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        const lowerMessage = errorMessage.toLowerCase();
        
        // Solo si contiene palabras de auth, muestra el mensaje, sino redirige
        if (AUTH_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
          setError(errorMessage);
        } else {
          window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
        }
        
        setLoading(false);
        return;
      }

      if (response.status === 401) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Su sesión ha caducado!!!';
        window.location.href = `${import.meta.env.VITE_API_URL}/logout`;
        setError(errorMessage);
        setLoading(false);
        return;
      }
      
      if (response.status !== 201) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener Cuenta.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      const responseData = await response.json();
      setDecryptingResponse(responseData);

    } catch (err) {
      console.error('Error durante la llamada al API:', err);
      setError('Error en la comunicación con el servidor. Revisa tu conexión.');
      setLoading(false);
    }
  };


  const handleEncryptedSaldoData = async (encryptedBody) => {
    setEncrypting(false);

        try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/recmovagre`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`
          },
          body: JSON.stringify(encryptedBody)
        });

        if (response.status !== 201) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData && errorData[0]?.response ? errorData[0].response : 'Error al obtener el saldo.';
          setError(errorMessage);
          setIsSaldoLoading(false);
          setItemToDisplaySaldo(null);
          return;
        }

        const responseData = await response.json();
        setDecryptingResponse(responseData); 

      } catch (err) {
        console.error('Error durante la llamada al API de saldo:', err);
        setError('Error en la comunicación con el servidor de saldo.');
        setIsSaldoLoading(false);
        setItemToDisplaySaldo(null);
      }
    };

  const isDecryptingForSaldo = !!itemToDisplaySaldo;
  const dataSeparada = movimientosData.map(item => ({
    ...item,
    importeH: item.signo === 'H' ? item.importe : 0,
    importeD: item.signo === 'D' ? item.importe : 0,
  }));

  return (
    <div className="main-container">
      <div className="depth-2-frame-0">
        <div className="depth-3-frame-0">
          <div className="depth-4-frame-0"></div>
          <div className="depth-4-frame-1">
            <div className="acme-co">AGREGADORA ASPAY</div>
          </div>
        </div>
        <div className="depth-3-frame-1">
          <div className="depth-4-frame-02">
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
              <div className="product">Regresar</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Regcta', { state: { token } })}>
              <div className="product">Registra Cta</div>
            </div>
            <div className="depth-5-frame-02" style={{ cursor: 'pointer' }} onClick={() => navigate('/Principal', { state: { token } })}>
              <div className="product">Inicio</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="listusr-content-container">
        <h1 className="listusr-title">Mis Cuentas</h1>
        <form className="listusr-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="startDate">Entidad</label>
            <input type="text" id="entidad" value={entidad} onChange={(e) => setEntidad(e.target.value)} />
          </div>
         
          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner-icon-small" /> Cargando...
              </>
            ) : (
              'Consultar Cuentas'
            )}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}




        {totales && (
          <div className="resumen-container" style={{ display: 'flex', gap: '15px', marginBottom: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {Object.entries(totales).map(([key, value]) => {
              if(typeof value !== 'number') return null; 
              return (
                <div key={key} className="resumen-card" style={{ padding: '15px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderTop: '4px solid #007bff', textAlign: 'center', minWidth: '140px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold' }}>{key}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    €{value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* {isSaldoLoading && <div style={{textAlign:'center', marginTop:'20px'}}><FaSpinner className="spinner-icon" /> <p>Consultando movimientos...</p></div>} */}
        {isSaldoLoading && (
          <div className="loading-container">
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
              <FaSpinner className="spinner-icon" />
              <p>Consultando movimientos...</p>
            </div>
          </div>
        )}
        {ctasaList.length > 0 && (
          <div className="table-container">
            <table className="user-table" style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#eee'}}>

                <th>Entidad</th>

                <th>Cuenta</th>
                <th>Alias</th>
                <th>Categoria</th>
                <th>Estatus</th>
                <th>Saldos</th>
                <th>Fecha de Alta</th>
                <th>Moneda</th>
                <th>Movimientos</th> 
              </tr>

              </thead>
              <tbody>
              {ctasaList.map((item, index) => (
                <tr key={index}>
                  <td>{item.entidad}</td>

                  <td>{item.datos}</td>
                  <td>{item.alias}</td>
                  <td>{item.categoria}</td>
                  <td>{item.estatus}</td>
                  <td style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>€{item.saldo.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                  <td>{item.fecha_alta}</td>
                  <td>{item.moneda}</td>

                  <td className="actions-cell">
                    <button 
                        className="delete-btn" 
                        onClick={() => handleSaldoClick(item)} 
                        disabled={isSaldoLoading || encrypting || loading}>
                      <FaRegMoneyBillAlt />
                    </button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>


          </div>
          
        )}



      </div>
{showMovimientosModal && (
  <div className="modal-overlay">
    <div className="modal-content">

      <div className="modal-header">
        <h2>Movimientos</h2>
        <button 
          className="modal-close"
          onClick={() => {
            setShowMovimientosModal(false);
            setItemToDisplaySaldo(null);
            setMovimientosData([]);

          }}
        >
          salir
        </button>
      </div>

      <div className="table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>ID</th>
              <th style={{ textAlign: 'center' }}>Token</th>
              <th style={{ textAlign: 'center' }}>Alias</th>
              <th style={{ textAlign: 'center' }}>Signo</th>
              <th style={{ textAlign: 'center' }}>Fecha</th>
              <th style={{ textAlign: 'center' }}>Concepto</th>
              <th style={{ textAlign: 'center' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            
            {movimientosData.length > 0 ? (
              
              movimientosData.map((m, i) => (
                <tr key={i}>
                  <td>{m.id}</td>
                  <td>{m.tkncli}</td>
                  <td>{m.alias}</td>
                  <td>{m.signo}</td>
                  <td>{m.fecha_movto}</td>
                  <td>{m.concepto}</td>
                  <td style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>€{m.importe.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</td>
                </tr>
                
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No se encontraron movimientos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="listgrap-content-container">
        <h1 className="listusr-title">Grafico Mensual</h1>
        
        <ResponsiveContainer width={800} height={600}>
          <AreaChart data={dataSeparada}>
            <XAxis dataKey="fecha_movto"/>
            <YAxis />
            <Tooltip />
          <Area type="monotone" dataKey="importeH" stroke="#8884d8" fill="#8884d8" name="Haber"/>
          <Area type="monotone" dataKey="importeD"stroke="#82ca9d" fill="#82ca9d"name="Debe" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
)}



      {encrypting && (
        <Encryptor
          password={encryptionPassword}
          message={JSON.stringify(decryptingResponse)}
          onEncrypted={itemToDisplaySaldo ? handleEncryptedSaldoData : handleEncryptedData}
          onError={(msg) => { setError(msg); setEncrypting(false); setLoading(false); setIsSaldoLoading(false); }}
        />
      )}

      {decryptingResponse && !encrypting && typeof decryptingResponse === 'string' && (
        <Decryptor
          encryptedMessage={decryptingResponse}
          password={encryptionPassword}
          onDecrypted={isDecryptingForSaldo ? handleDecryptedSaldoResponse : handleDecryptedListResponse}
          onError={(err) => { setError(err); setLoading(false); setIsSaldoLoading(false); setDecryptingResponse(null); }}
        />
      )}
    </div>
  );
};