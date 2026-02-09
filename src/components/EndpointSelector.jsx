import React from 'react';
import '../styles/calificacion.css';

export const EndpointSelector = ({ selectedEndpoints, onToggle }) => {
    const endpoints = [
        { id: 1, label: 'Opción 1', title: 'Actividad Económica y Riesgo Geográfico', description: 'Evalúa riesgo basado en país y actividad económica' },
        { id: 2, label: 'Opción 2-3', title: 'PEP y Medios Adversos', description: 'Analiza exposición política y reputación en medios' },
        { id: 4, label: 'Opción 4', title: 'Por Cuenta', description: 'Verifica transacciones sospechosas y aprobación de cuenta' },
        { id: 5, label: 'Opción 5', title: 'Scoring Crediticio', description: 'Verifica transacciones para generar scoring' }
    ];

    return (
        <div className="endpoint-selector">
            <h3>Seleccione las opciones de calificación:</h3>
            <div className="endpoint-options">
                {endpoints.map(endpoint => (
                    <div 
                        key={endpoint.id}
                        className={`endpoint-card ${selectedEndpoints.includes(endpoint.id) ? 'selected' : ''}`}
                        onClick={() => onToggle(endpoint.id)}
                    >
                        <div className="endpoint-header">
                            <input
                                type="checkbox"
                                checked={selectedEndpoints.includes(endpoint.id)}
                                onChange={() => {}}
                                className="endpoint-checkbox"
                            />
                            <span className="endpoint-label">{endpoint.label}</span>
                        </div>
                        <div className="endpoint-title">{endpoint.title}</div>
                        <div className="endpoint-description">{endpoint.description}</div>
                    </div>
                ))}
            </div>
            <div className="selection-info">
                Seleccionadas: {selectedEndpoints.length} de 4 opciones
            </div>
        </div>
    );
};

// export default EndpointSelector;