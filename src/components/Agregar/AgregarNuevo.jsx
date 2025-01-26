import { useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";

const AgregarNuevoArticulo = () => {
  const [nuevoArticulo, setNuevoArticulo] = useState({
    nombre: "",
    modelo: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: ""
  });

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Validar que Precio y Cantidad sean siempre positivos
    if ((name === "precio" || name === "cantidad") && Number(value) < 0) {
      return; // Bloquear valores negativos
    }

    setNuevoArticulo({ ...nuevoArticulo, [name]: value });
  };

  // Agregar el nuevo artículo a Firestore
  const agregarArticulo = async () => {
    const { nombre, modelo, descripcion, precio, cantidad, categoria } = nuevoArticulo;
  
    if (!nombre || !modelo || !descripcion || !precio || !cantidad || !categoria) {
      alert("Por favor, completa todos los campos.");
      return;
    }
  
    try {
      // Agregar artículo al inventario
      await addDoc(collection(db, "inventory"), {
        nombre,
        modelo,
        descripcion,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
        categoria,
      });
  
      // Guardar registro del nuevo artículo en la colección 'nuevos_articulos'
      await addDoc(collection(db, "movimientos"), {
        fechaHora: new Date().toLocaleString("es-MX"),
        nombre,
        modelo,
        precio: parseFloat(precio),
        cantidad: parseInt(cantidad),
        responsable: localStorage.getItem('userName'),
        tipoMovimiento: "Agrego Nuevo"
      });
  
      alert("¡Artículo agregado y registrado correctamente!");
  
      // Limpiar el formulario
      setNuevoArticulo({
        nombre: "",
        modelo: "",
        descripcion: "",
        precio: "",
        cantidad: "",
        categoria: ""
      });
    } catch (error) {
      console.error("Error al agregar el artículo:", error);
      alert("Ocurrió un error al agregar el artículo.");
    }
  };
  

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
        <Typography variant="h4" sx={{ mb: 4, color:"black"}}>
          Agregar Nuevo Artículo
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Nombre"
              name="nombre"
              value={nuevoArticulo.nombre}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Modelo"
              name="modelo"
              value={nuevoArticulo.modelo}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              name="descripcion"
              value={nuevoArticulo.descripcion}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Precio"
              name="precio"
              type="number"
              value={nuevoArticulo.precio}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Cantidad"
              name="cantidad"
              type="number"
              value={nuevoArticulo.cantidad}
              onChange={handleChange}
              inputProps={{ min: 0 }}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Categoría"
              name="categoria"
              value={nuevoArticulo.categoria}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>

          {/* Botón Agregar */}
          <Grid item xs={12}>
            <ListItemButton
              onClick={agregarArticulo}
              sx={{
                backgroundColor: "#1976d2",
                borderRadius: 2,
                mx: 1,
                height: "60px",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  color: "#fff",
                },
                transition: "0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>
                <AddBoxIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary="Agregar Artículo"
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

export default AgregarNuevoArticulo;
