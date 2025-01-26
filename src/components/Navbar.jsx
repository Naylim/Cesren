import { AppBar, Toolbar, IconButton, Typography, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

// eslint-disable-next-line react/prop-types
const Navbar = ({ toggleDrawer }) => {
  const name = localStorage.getItem('userName');

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1976d2", width: "100%" }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, textAlign: "center", fontWeight: "bold" }}
        >
          Gestión de Inventario CESREN
        </Typography>
        <Box sx={{ ml: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {name ? `Usuario: ${name}` : "Bienvenido"}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
