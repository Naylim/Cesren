import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

import Login from './components/login/Login';
import ProtectedRoute from './components/login/ProtectedRoute';

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Inicio from "./components/Inicio";
import Retirar from "./components/Retirar/Retirar";
import Agregar from "./components/Agregar/Agregar";
import AgregarNuevo from "./components/Agregar/AgregarNuevo";
import AgregarExistencias from "./components/Agregar/AgregarExistencia";
import Movimientos from "./components/Movimientos";

import Almacen from "./components/Almacen";

import AccessDenied from './components/AccessDenied';

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <>
      {/* Ocultar Navbar y Sidebar solo en la página de login */}
      {location.pathname !== "/" && (
        <>
          <Navbar toggleDrawer={toggleDrawer} />
          <Sidebar drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
        </>
      )}

      {/* Contenido de las páginas */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/agregar" element={<Agregar />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/agregar-existencias" element={<AgregarExistencias />} />
        <Route path="/acceso-denegado" element={<AccessDenied />} />
        <Route path="/almacen" element={<Almacen />} />

        <Route 
          path="/retirar" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Retirar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agregar-nuevo" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AgregarNuevo />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/movimientos" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Movimientos />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
