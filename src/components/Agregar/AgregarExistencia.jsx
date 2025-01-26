import { useState, useEffect } from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  Autocomplete,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DeleteIcon from "@mui/icons-material/Delete";

const AgregarExistencia = () => {
  const [articulos, setArticulos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [listaAgregar, setListaAgregar] = useState([]);
  const [mensaje, setMensaje] = useState({ open: false, text: "", severity: "" });

  // Obtener artículos existentes
  const fetchArticulos = async () => {
    const itemsCollection = collection(db, "inventory");
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setArticulos(itemsList);
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  // Añadir artículo a la lista
  const agregarALaLista = () => {
    if (!seleccionado || !cantidad || cantidad <= 0) {
      setMensaje({ open: true, text: "Selecciona un artículo y una cantidad válida.", severity: "warning" });
      return;
    }

    const yaExiste = listaAgregar.find(item => item.id === seleccionado.id);

    if (yaExiste) {
      setMensaje({ open: true, text: "Este artículo ya está en la lista.", severity: "info" });
      return;
    }

    setListaAgregar([
      ...listaAgregar,
      { ...seleccionado, cantidadAgregar: parseInt(cantidad) }
    ]);

    setSeleccionado(null);
    setCantidad("");
  };

  // Eliminar artículo de la lista
  const eliminarDeLaLista = (id) => {
    setListaAgregar(listaAgregar.filter(item => item.id !== id));
  };

  // Agregar todos los artículos a la base de datos
  const agregarTodos = async () => {
    if (listaAgregar.length === 0) {
      setMensaje({ open: true, text: "No hay artículos para agregar.", severity: "info" });
      return;
    }
  
    try {
      // Iterar sobre la lista de artículos a agregar y actualizar la cantidad en la base de datos
      for (const item of listaAgregar) {
        const itemRef = doc(db, "inventory", item.id);
        await updateDoc(itemRef, {
          cantidad: parseInt(item.cantidad) + parseInt(item.cantidadAgregar),
        });
      }
  
      // Guardar el registro de la transacción en la colección 'agregaciones'
      await addDoc(collection(db, "movimientos"), {
        fechaHora: new Date().toLocaleString("es-MX"),
        articulos: listaAgregar.map(item => ({
          id: item.id,
          nombre: item.nombre,
          modelo: item.modelo,
          cantidadAgregada: item.cantidadAgregar,
        })),
        responsable: localStorage.getItem('userName'),
        tipoMovimiento: "Agrego Existencia"
      });
  
      setMensaje({ open: true, text: "¡Existencias actualizadas y registradas correctamente!", severity: "success" });
      setListaAgregar([]);
      fetchArticulos();
    } catch (error) {
      console.error("Error al actualizar existencias:", error);
      setMensaje({ open: true, text: "Error al actualizar existencias.", severity: "error" });
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
        <Typography variant="h4" sx={{ mb: 4, color:"black" }}>
          Agregar Existencias
        </Typography>

        <Grid container spacing={3}>
          {/* Selector de artículo */}
            <Grid item xs={12} sm={7}>
              <Autocomplete
                options={articulos.filter(a => !listaAgregar.find(l => l.id === a.id))}
                getOptionLabel={(option) => `${option.nombre} - ${option.modelo}`}
                value={seleccionado}
                onChange={(e, newValue) => setSeleccionado(newValue)}
                renderInput={(params) => <TextField {...params} label="Selecciona un artículo" fullWidth />}
              />
            </Grid>

            {/* Cantidad actual (NO editable) */}
            <Grid item xs={12} sm={2}>
              <TextField
                label="Cantidad Actual"
                value={seleccionado ? seleccionado.cantidad : ""}
                fullWidth
                disabled
              />
            </Grid>

            {/* Cantidad a agregar */}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Cantidad a agregar"
                type="number"
                value={cantidad}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (parseInt(value) >= 0 && !isNaN(value))) {
                    setCantidad(value);
                  }
                }}
                inputProps={{ min: 0 }}
                fullWidth
              />
            </Grid>
        


          {/* Botón para agregar a la lista */}
          <Grid item xs={12}>
            <ListItemButton
              onClick={agregarALaLista}
              sx={{
                backgroundColor: "#388e3c",
                borderRadius: 2,
                mx: 1,
                height: "60px",
                "&:hover": {
                  backgroundColor: "#2e7d32",
                  color: "#fff",
                },
                transition: "0.3s",
              }}
            >
              <ListItemIcon sx={{ color: "#fff" }}>
                <PlaylistAddIcon fontSize="large" />
              </ListItemIcon>
              <ListItemText
                primary="Agregar a la Lista"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
            </ListItemButton>
          </Grid>

          {/* Tabla siempre visible */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Modelo</TableCell>
                    <TableCell>Cantidad a agregar</TableCell>
                    <TableCell>Acción</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaAgregar.length > 0 ? (
                    listaAgregar.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nombre}</TableCell>
                        <TableCell>{item.modelo}</TableCell>
                        <TableCell>{item.cantidadAgregar}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => eliminarDeLaLista(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No hay artículos en la lista.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Botón para agregar todos */}
          <Grid item xs={12}>
            <ListItemButton
              onClick={agregarTodos}
              sx={{
                backgroundColor: "#1976d2",
                borderRadius: 2,
                mx: 1,
                height: "60px",
                "&:hover": {
                  backgroundColor: "#1565c0",
                  color: "#fff",
                },
              }}
            >
              <ListItemText
                primary="Agregar al Inventario"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
            </ListItemButton>
          </Grid>
        </Grid>

        {/* Mensaje de confirmación */}
        <Snackbar
          open={mensaje.open}
          autoHideDuration={3000}
          onClose={() => setMensaje({ ...mensaje, open: false })}
        >
          <Alert severity={mensaje.severity} sx={{ width: '100%' }}>
            {mensaje.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default AgregarExistencia;
