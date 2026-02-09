import React from 'react';
import '../styles/calificacion.css';

export const CalificacionForm = ({ formData, selectedEndpoints, onChange, onSubmit, loading }) => {
    const showField = (endpointNumber, fieldName) => {
        return selectedEndpoints.includes(endpointNumber);
    };

    return (
        <form className="calificacion-form" onSubmit={onSubmit}>
            <h2>Datos de Entrada</h2>
            
            {/* Campos comunes */}
            <div className="form-section">
                <h3>Información Común</h3>
                <div className="form-group">
                    <label htmlFor="doc_id">Documento ID *</label>
                    <input
                        type="text"
                        id="doc_id"
                        name="doc_id"
                        value={formData.doc_id}
                        onChange={onChange}
                        maxLength={20}
                        required
                        placeholder="20 caracteres maximo"
                    />
                    <span className="char-counter">{formData.doc_id.length}/20</span>
                </div>
            </div>

            {/* Opción 1 - Actividad Económica y Riesgo Geográfico */}
            {showField(1, 'all') && (
                <div className="form-section">
                    <h3 className="section-title-option1">Opción 1: Actividad Económica y Riesgo Geográfico</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="pais">País *</label>
                            <input
                                type="text"
                                id="pais"
                                name="pais"
                                value={formData.pais}
                                onChange={onChange}
                                maxLength={30}
                                required={selectedEndpoints.includes(1)}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.pais.length}/30</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="actecon">Actividad Económica *</label>
                            <input
                                type="text"
                                id="actecon"
                                name="actecon"
                                value={formData.actecon}
                                onChange={onChange}
                                maxLength={30}
                                required={selectedEndpoints.includes(1)}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.actecon.length}/30</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Opción 2 - PEP y Medios Adversos */}
            {showField(2, 'all') && (
                <div className="form-section">
                    <h3 className="section-title-option2">Opción 2-3: PEP y Medios Adversos</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre *</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={onChange}
                                maxLength={60}
                                required={selectedEndpoints.includes(2)}
                                placeholder="Máximo 60 caracteres"
                            />
                            <span className="char-counter">{formData.nombre.length}/60</span>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="ap_paterno">Apellido Paterno *</label>
                            <input
                                type="text"
                                id="ap_paterno"
                                name="ap_paterno"
                                value={formData.ap_paterno}
                                onChange={onChange}
                                maxLength={30}
                                required={selectedEndpoints.includes(2)}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.ap_paterno.length}/30</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="ap_materno">Apellido Materno *</label>
                            <input
                                type="text"
                                id="ap_materno"
                                name="ap_materno"
                                value={formData.ap_materno}
                                onChange={onChange}
                                maxLength={20}
                                required={selectedEndpoints.includes(2)}
                                placeholder="Máximo 20 caracteres"
                            />
                            <span className="char-counter">{formData.ap_materno.length}/20</span>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fecha_nac_const">Fecha de Nacimiento</label>
                            <input
                                type="date"
                                id="fecha_nac_const"
                                name="fecha_nac_const"
                                value={formData.fecha_nac_const}
                                onChange={onChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="nacionalidad">Nacionalidad</label>
                            <input
                                type="text"
                                id="nacionalidad"
                                name="nacionalidad"
                                value={formData.nacionalidad}
                                onChange={onChange}
                                maxLength={30}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.nacionalidad.length}/30</span>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="alias">Alias</label>
                            <input
                                type="text"
                                id="alias"
                                name="alias"
                                value={formData.alias}
                                onChange={onChange}
                                maxLength={50}
                                placeholder="Máximo 50 caracteres"
                            />
                            <span className="char-counter">{formData.alias.length}/50</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="ocupa_giro">Ocupación/Giro</label>
                            <input
                                type="text"
                                id="ocupa_giro"
                                name="ocupa_giro"
                                value={formData.ocupa_giro}
                                onChange={onChange}
                                maxLength={30}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.ocupa_giro.length}/30</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="pais2">País de Residencia</label>
                            <input
                                type="text"
                                id="pais2"
                                name="pais"
                                value={formData.pais}
                                onChange={onChange}
                                maxLength={30}
                                placeholder="Máximo 30 caracteres"
                            />
                            <span className="char-counter">{formData.pais.length}/30</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Opción 4 - Calificación de Cuenta */}
            {showField(4, 'all') && (
                <div className="form-section">
                    <h3 className="section-title-option3">Opción 4: Calificación de Cuenta</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tkncli">Token Cliente *</label>
                            <input
                                type="text"
                                id="tkncli"
                                name="tkncli"
                                value={formData.tkncli}
                                onChange={onChange}
                                maxLength={36}
                                required={selectedEndpoints.includes(3)}
                                placeholder="36 caracteres exactos"
                            />
                            <span className="char-counter">{formData.tkncli.length}/36</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="alias2">Alias *</label>
                            <input
                                type="text"
                                id="alias2"
                                name="alias2"
                                value={formData.alias2}
                                onChange={onChange}
                                maxLength={10}
                                required={selectedEndpoints.includes(3)}
                                placeholder="10 caracteres exactos"
                            />
                            <span className="char-counter">{formData.alias2.length}/10</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Opción 5 - Scoring Credito */}
            {showField(5, 'all') && (
                <div className="form-section">
                    <h3 className="section-title-option3">Opción 5: Scoring de crédito</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tkncli">Token Cliente *</label>
                            <input
                                type="text"
                                id="tkncli"
                                name="tkncli"
                                value={formData.tkncli}
                                onChange={onChange}
                                maxLength={36}
                                required={selectedEndpoints.includes(3)}
                                placeholder="36 caracteres exactos"
                            />
                            <span className="char-counter">{formData.tkncli.length}/36</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="alias2">Alias *</label>
                            <input
                                type="text"
                                id="alias2"
                                name="alias2"
                                value={formData.alias2}
                                onChange={onChange}
                                maxLength={10}
                                required={selectedEndpoints.includes(3)}
                                placeholder="10 caracteres exactos"
                            />
                            <span className="char-counter">{formData.alias2.length}/10</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="form-actions">
                <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={loading || selectedEndpoints.length === 0}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Procesando...
                        </>
                    ) : (
                        `Ejecutar Calificación${selectedEndpoints.length > 1 ? 'es' : ''} (${selectedEndpoints.length})`
                    )}
                </button>
            </div>
        </form>
    );
};

