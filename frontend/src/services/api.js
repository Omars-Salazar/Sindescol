import axios from "axios";

const API_URL = "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// AFILIADOS
export const getAfiliados = () => api.get("/afiliados");
export const getAfiliadoById = (id) => api.get(`/afiliados/${id}`);
export const getAfiliadoByCedula = (cedula) => api.get(`/afiliados/cedula/${cedula}`);
export const createAfiliado = (data) => api.post("/afiliados", data);
export const updateAfiliado = (id, data) => api.put(`/afiliados/${id}`, data);
export const deleteAfiliado = (id) => api.delete(`/afiliados/${id}`);

// CARGOS
export const getCargos = () => api.get("/cargos");
export const getCargoById = (id) => api.get(`/cargos/${id}`);
export const getMunicipiosByCargo = (id) => api.get(`/cargos/${id}/municipios`);
export const createCargo = (data) => api.post("/cargos", data);
export const updateCargo = (id, data) => api.put(`/cargos/${id}`, data);
export const deleteCargo = (id) => api.delete(`/cargos/${id}`);

// CUOTAS
export const getCuotas = () => api.get("/cuotas");
export const getCuotaById = (id) => api.get(`/cuotas/${id}`);
export const getCuotasByCedula = (cedula) => api.get(`/cuotas/cedula/${cedula}`);
export const createCuota = (data) => api.post("/cuotas", data);
export const updateCuota = (id, data) => api.put(`/cuotas/${id}`, data);
export const deleteCuota = (id) => api.delete(`/cuotas/${id}`);

// SALARIOS
export const getSalarios = () => api.get("/salarios");
export const getSalarioById = (id) => api.get(`/salarios/${id}`);
export const createSalario = (data) => api.post("/salarios", data);
export const updateSalario = (id, data) => api.put(`/salarios/${id}`, data);
export const deleteSalario = (id) => api.delete(`/salarios/${id}`);

export default api;