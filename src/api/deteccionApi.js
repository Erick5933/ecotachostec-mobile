// src/api/deteccionApi.js
import axios from "./axiosConfig";

// ==================== CRUD BÁSICO ====================
export const getDetecciones = () => axios.get("/detecciones/");
export const getDeteccionById = (id) => axios.get(`/detecciones/${id}/`);
export const createDeteccion = (data) => axios.post("/detecciones/", data);
export const updateDeteccion = (id, data) => axios.put(`/detecciones/${id}/`, data);
export const deleteDeteccion = (id) => axios.delete(`/detecciones/${id}/`);

// ==================== FILTROS AVANZADOS ====================
export const getDeteccionesByTacho = (tachoId) =>
    axios.get(`/detecciones/?tacho=${tachoId}`);

export const getDeteccionesByTipo = (tipo) =>
    axios.get(`/detecciones/?tipo=${tipo}`);

export const getDeteccionesByFecha = (fechaInicio, fechaFin) =>
    axios.get(`/detecciones/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);

export const getDeteccionesByNivel = (nivel) =>
    axios.get(`/detecciones/?nivel=${nivel}`);

export const getDeteccionesFiltradas = (params) =>
    axios.get("/detecciones/", { params });

// ==================== ESTADÍSTICAS ====================
export const getEstadisticasGenerales = () =>
    axios.get("/detecciones/estadisticas/");

export const getEstadisticasPorTacho = (tachoId) =>
    axios.get(`/detecciones/estadisticas/tacho/${tachoId}/`);

export const getEstadisticasPorFecha = (fechaInicio, fechaFin) =>
    axios.get(`/detecciones/estadisticas/?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`);

// ==================== HISTORIAL Y SERIES TEMPORALES ====================
export const getHistorialDetecciones = (tachoId, limite = 50) =>
    axios.get(`/detecciones/historial/?tacho=${tachoId}&limit=${limite}`);

export const getSerieTemporal = (tachoId, tipo, dias = 7) =>
    axios.get(`/detecciones/serie-temporal/?tacho=${tachoId}&tipo=${tipo}&dias=${dias}`);

// ==================== DASHBOARD Y REPORTES ====================
export const getUltimasDetecciones = (limite = 10) =>
    axios.get(`/detecciones/?limit=${limite}&ordering=-fecha_deteccion`);

export const getDeteccionesCriticas = () =>
    axios.get("/detecciones/?nivel=high&ordering=-fecha_deteccion");

export const getResumenDiario = (fecha) =>
    axios.get(`/detecciones/resumen-diario/?fecha=${fecha}`);

// ==================== OPERACIONES POR LOTE ====================
export const crearDeteccionesPorLote = (datos) =>
    axios.post("/detecciones/lote/", datos);

export const eliminarDeteccionesAntiguas = (dias = 30) =>
    axios.delete(`/detecciones/limpiar/?dias=${dias}`);

// ==================== EXPORTACIÓN ====================
export const exportarDeteccionesCSV = (params) =>
    axios.get("/detecciones/export/csv/", {
        params,
        responseType: 'blob'
    });

export const exportarDeteccionesExcel = (params) =>
    axios.get("/detecciones/export/excel/", {
        params,
        responseType: 'blob'
    });

export const exportarReportePDF = (deteccionId) =>
    axios.get(`/detecciones/${deteccionId}/reporte/pdf/`, {
        responseType: 'blob'
    });

// ==================== FUNCIONES AUXILIARES ====================
export const getTiposDeteccion = () =>
    axios.get("/detecciones/tipos/");

export const getNivelesDeteccion = () =>
    axios.get("/detecciones/niveles/");

export const getDispositivosActivos = () =>
    axios.get("/detecciones/dispositivos-activos/");

// ==================== FUNCIONES DE MONITOREO ====================
export const getEstadoSensores = () =>
    axios.get("/detecciones/estado-sensores/");

export const getAlertasRecientes = (limite = 5) =>
    axios.get(`/detecciones/alertas/?limit=${limite}`);

export const getMetricasTiempoReal = () =>
    axios.get("/detecciones/metricas-tiempo-real/");

// ==================== FUNCIONES DE MAPA ====================
export const getDeteccionesPorUbicacion = (lat, lon, radio = 1000) =>
    axios.get(`/detecciones/por-ubicacion/?lat=${lat}&lon=${lon}&radio=${radio}`);

export const getHeatmapDetecciones = () =>
    axios.get("/detecciones/heatmap/");

// ==================== FUNCIONES DE ANÁLISIS ====================
export const getTendencias = (tipo, periodo = "week") =>
    axios.get(`/detecciones/tendencias/?tipo=${tipo}&periodo=${periodo}`);

export const getCorrelaciones = () =>
    axios.get("/detecciones/correlaciones/");

export const getPredicciones = (tachoId, tipo) =>
    axios.get(`/detecciones/predicciones/?tacho=${tachoId}&tipo=${tipo}`);