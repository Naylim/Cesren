import { Container, Typography, Box, Grid, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

const AgregarArticulos = () => {
  const navigate = useNavigate(); // Hook para cambiar de ruta

  return (
    <Box sx={{ flexGrow: 1, width: '100vw', overflowX: 'auto' }}>
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
          py: 4,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, color: "black"}}>
         Agregar Artículos
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {/* Botón: Agregar Nuevo Artículo */}
          <Grid item xs={12} sm={6}>
            <ListItemButton
              onClick={() => navigate("/agregar-nuevo")}
              sx={{
                backgroundColor: "#1976d2",
                borderRadius: 2,
                mx: 1,
                height: "100px",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  color: "#fff",
                },
                transition: "0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "#fff", fontSize: 50 }}>
                <AddBoxIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary="Agregar Nuevo Artículo"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
            </ListItemButton>
          </Grid>

          {/* Botón: Agregar Existencias */}
          <Grid item xs={12} sm={6}>
            <ListItemButton
              onClick={() => navigate("/agregar-existencias")}
              sx={{
                backgroundColor: "#388e3c",
                borderRadius: 2,
                mx: 1,
                height: "100px",
                "&:hover": {
                  backgroundColor: "#2e7d32",
                  color: "#fff",
                },
                transition: "0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "#fff", fontSize: 50 }}>
                <PlaylistAddIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary="Agregar Existencias"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
            </ListItemButton>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AgregarArticulos;
