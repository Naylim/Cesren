import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import AddBoxIcon from "@mui/icons-material/AddBox";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import HistoryIcon from "@mui/icons-material/History";
//import AssessmentIcon from "@mui/icons-material/Assessment";
import { auth } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Button } from '@mui/material';



// eslint-disable-next-line react/prop-types
const Sidebar = ({ drawerOpen, toggleDrawer }) => {
  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, color: "#1976d2", path: "/inicio" },
    { text: "Agregar Artículos", icon: <AddBoxIcon />, color: "#388e3c", path: "/agregar" },
    { text: "Retirar Artículos", icon: <RemoveCircleOutlineIcon />, color: "#d32f2f", path: "/retirar" },
    { text: "Almacén", icon: <InventoryIcon />, color: "#f57c00", path: "/almacen" },
    { text: "Movimientos Realizados", icon: <HistoryIcon />, color: "#512da8", path: "/movimientos" },
   // { text: "Cierre del Día", icon: <AssessmentIcon />, color: "#00796b", path: "/cierre" },
  ];

  const navigate = useNavigate();
  const handleLogout = async () => {
      await auth.signOut();
      localStorage.removeItem('userRole');
      navigate('/');
  };

  return (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
      <Box
        sx={{
          width: 250,
          height: "100%",
          backgroundColor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
        }}
        role="presentation"
        onClick={toggleDrawer(false)}
      >
        {/* Título CESREN */ }
        <Box sx={{ py: 2, textAlign: "center", backgroundColor: "#1976d2" }}>
          <Typography variant="h5" sx={{ color: "#fff", fontWeight: "bold" }}>
            CESREN
          </Typography>
        </Box>

        <Divider />

        {/* Menú de Opciones */}
        <List sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  "&:hover": {
                    backgroundColor: item.color,
                    color: "#fff",
                  },
                  borderRadius: 2,
                  mx: 1,
                  transition: "0.3s",
                }}
              >
                <ListItemIcon sx={{ color: item.color }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            height: '100vh', 
            padding: '10px', 
            justifyContent: 'flex-end'  // Asegura que los elementos estén al final de la sidebar
          }}
        >
          <Typography 
            sx={{ 
              color: "#000", 
              fontWeight: "bold", 
              textAlign: "center",
              marginBottom: 2  // Espaciado entre texto y botón
            }}
          >
            {auth.currentUser?.email || "Usuario desconocido"}
          </Typography>
            
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<ExitToAppIcon />} 
            onClick={handleLogout}
            sx={{ 
              padding: '10px', 
              fontSize: '16px', 
              borderRadius: 2, 
              width: '100%'  // Asegura que el botón ocupe el ancho disponible
            }}
          >
            Cerrar Sesión
          </Button>
        </Box>

      </Box>
    </Drawer>
  );
};

export default Sidebar;
