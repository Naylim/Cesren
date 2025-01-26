//import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        width: '100vw',  // Ocupar el 100% del ancho de la ventana
        height: '100vh',  // Ocupar el 100% de la altura de la ventana
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8f9fa',  // Fondo claro
        textAlign: 'center', 
        padding: '20px', 
        boxSizing: 'border-box'  // Asegurar que padding no altere el tamaño
      }}
    >
      {/* Imagen de acceso denegado */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        mb: 3  // Espacio inferior entre imagen y texto
      }}>
        <img 
          src="/images/molang.png" 
          alt="Acceso denegado" 
          style={{ maxWidth: '300px', height: 'auto' }}
        />
      </Box>

      {/* Mensaje */}
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 'bold', 
          color: '#d32f2f', 
          mb: 2  // Espaciado inferior
        }}
      >
        Acceso Denegado
      </Typography>

      <Typography 
        variant="body1" 
        sx={{ 
          color: '#555', 
          fontSize: '18px', 
          maxWidth: '500px',  // Limitar el ancho del texto
          lineHeight: '1.5',
          mb: 4 
        }}
      >
        Lo sentimos, no tienes los permisos necesarios para acceder a esta sección.
      </Typography>

      {/* Botón para volver */}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/inicio')}
        sx={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          textTransform: 'none'  // Evitar que el texto se convierta en mayúsculas
        }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );
};

export default AccessDenied;
