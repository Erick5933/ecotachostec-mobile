import axios from "./axiosConfig";

export const getProvincias = () => axios.get("/ubicacion/provincias/");
export const getCiudades = () => axios.get("/ubicacion/ciudades/");
export const getCantones = () => axios.get("/ubicacion/cantones/");
// Añade esta función - VERIFICA que esté exportada correctamente
export const getUbicaciones = () => {
    // Devuelve la promesa directamente
    return axios.get("/ubicacion/cantones/");
};

// También puedes crear un export default
export default {
    getProvincias,
    getCiudades,
    getCantones,
    getUbicaciones
};