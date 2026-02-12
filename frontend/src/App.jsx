/**
 * SINDESCOL - Sistema de Gestión Sindical
 * 
 * Archivo: App.jsx
 * Descripción: Componente principal y configuración de rutas
 * 
 * @author Omar Santiago Salazar
 * @email ossy2607@gmail.com
 * @date 2025-2026
 * @version 1.0.0
 * @license MIT
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Afiliados from "./pages/Afiliados";
import Cargos from "./pages/Cargos";
import Cuotas from "./pages/Cuotas";
import Salarios from "./pages/Salarios";
import Departamentos from "./pages/Departamentos";
import GestionUsuarios from "./pages/GestionUsuarios";
import InformacionPresidencias from "./pages/InformacionPresidencias";
import "./styles/global.css";

// Componente para proteger rutas
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Ruta pública: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <>
                <Sidebar />
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/afiliados" element={<Afiliados />} />
                  <Route path="/cargos" element={<Cargos />} />
                  <Route path="/cuotas" element={<Cuotas />} />
                  <Route path="/salarios" element={<Salarios />} />
                  <Route path="/departamentos" element={<Departamentos />} />
                  <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
                  <Route path="/informacion-presidencias" element={<InformacionPresidencias />} />
                </Routes>
              </>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;