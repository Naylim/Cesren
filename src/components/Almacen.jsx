import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, getDoc, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Container, IconButton, Typography, Box, Tooltip, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ExistingItems = () => {
  const [items, setItems] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Obtener datos de Firestore
  const fetchItems = async () => {
    const itemsCollection = collection(db, "inventory");
    const itemsSnapshot = await getDocs(itemsCollection);
    const itemsList = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setItems(itemsList);
  };

  // Eliminar artículo
  const deleteItem = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      try {
        const itemRef = doc(db, "inventory", id);
        const itemSnapshot = await getDoc(itemRef);

        if (itemSnapshot.exists()) {
          const deletedItem = itemSnapshot.data();

          // Guardar el movimiento de eliminación antes de eliminar el artículo
          const movimientosRef = collection(db, "movimientos");
          await addDoc(movimientosRef, {
            fechaHora: new Date().toLocaleString("es-MX"),
            responsable: localStorage.getItem('userName'),
            tipoMovimiento: "Eliminación",

            nombre: deletedItem.nombre,
            modelo: deletedItem.modelo,
            descripcion: deletedItem.descripcion,
            precio: deletedItem.precio,
            cantidad: deletedItem.cantidad,
            categoria: deletedItem.categoria,
          });

          // Eliminar el artículo después de registrar el movimiento
          await deleteDoc(itemRef);
          fetchItems();
        } else {
          console.error("El artículo no existe o ya ha sido eliminado.");
        }
      } catch (error) {
        console.error("Error eliminando el artículo:", error);
      }
    }
  };

  
  const handleEditOpen = (item) => {
    setCurrentItem(item);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setCurrentItem(null);
  };

  // Validar cambios solo para precio y cantidad
  const handleEditChange = (e) => {
  const { name, value } = e.target;

  // Validar que Precio y Cantidad sean siempre positivos
  if ((name === "precio" || name === "cantidad") && Number(value) < 0) {
    return; // Bloquear valores negativos
  }

  setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleEditSave = async () => {
    if (currentItem) {
      const itemRef = doc(db, "inventory", currentItem.id);
  
      // Datos previos para comparar
      const itemSnapshot = await getDoc(itemRef);
      const previousData = itemSnapshot.data();
  
      // Actualización del artículo
      await updateDoc(itemRef, {
        nombre: currentItem.nombre,
        modelo: currentItem.modelo,
        descripcion: currentItem.descripcion,
        precio: Number(currentItem.precio),
        cantidad: Number(currentItem.cantidad),
        categoria: currentItem.categoria,
      });
  
      // Registrar el movimiento en la colección "movimientos"
      const movimientosRef = collection(db, "movimientos");
      await addDoc(movimientosRef, {
        fechaHora: new Date().toLocaleString("es-MX"),
        responsable: localStorage.getItem('userName'),
        tipoMovimiento: "Edición",

        nombreNuevo: currentItem.nombre,
        nombreAnterior: previousData.nombre,

        modeloNuevo: currentItem.modelo,
        modeloAnterior: previousData.modelo,

        descripcionNueva: currentItem.descripcion,
        descripcionAnterior: previousData.descripcion,

        precioAnterior: Number(previousData.precio),
        precioNuevo: Number(currentItem.precio),
        cantidadAnterior: Number(previousData.cantidad),
        cantidadNueva: Number(currentItem.cantidad),
        categoriaNueva: currentItem.categoria,
        categoriaAnterior: previousData.categoria,
      });
  
      // Actualizar la lista de artículos en la interfaz
      fetchItems();
      handleEditClose();
    }
  };
  

  useEffect(() => {
    fetchItems();
  }, []);


  const role = localStorage.getItem('userRole'); // Obtener el rol del usuario
  // Columnas de la tabla
  const columns = [
    { field: "nombre", headerName: "Nombre", flex: 1, minWidth: 120 },
    { field: "modelo", headerName: "Modelo", flex: 1, minWidth: 120 },
    { field: "descripcion", headerName: "Descripción", flex: 2, minWidth: 200 },
    ...(role === 'admin' ? [
      {
        field: "precio", headerName: "Precio", flex: 1, minWidth: 100, type: "number",
        renderCell: (params) => {
          const value = Number(params.value);
          return isNaN(value) ? "$0.00" : `$${value.toFixed(0)}`;
        }
      }
    ] : []),
    { field: "cantidad", headerName: "Cantidad", flex: 1, minWidth: 100, type: "number" },
    { field: "categoria", headerName: "Categoría", flex: 1, minWidth: 120 },
    ...(role === 'admin' ? [
      {
        field: "acciones",
        headerName: "Acciones",
        width: 120,
        renderCell: (params) => (
          <>
            <Tooltip title="Editar">
              <IconButton color="primary" onClick={() => handleEditOpen(params.row)}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton color="error" onClick={() => deleteItem(params.row.id)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ),
      }
    ] : []),
  ];

  return (
    <Box sx={{ flexGrow: 1, width: '100vw', overflowX: 'auto' }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          mt: 4,
          px: 0,
          backgroundColor: "#f5f5f5",
          padding: 7,
          borderRadius: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 4, color:"black"}}>
          Artículos Existentes 
        </Typography>

        <Paper sx={{ height: 800, width: "100%", overflow: "hidden" }}>
          <DataGrid
            rows={items}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#e0e0e0",  // Fondo gris
                color: "#000",               // Títulos en negro
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f5f5",
              },
              "& .MuiDataGrid-root": {
                fontSize: {
                  xs: "0.75rem", // Tamaño más pequeño para pantallas pequeñas
                  sm: "0.9rem",
                  md: "1rem",
                },
              },
            }}
          />
        </Paper>
      </Container>
      
      {/* Ventana emergente para editar */}
      <Dialog open={openEdit} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Artículo</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nombre" name="nombre" fullWidth value={currentItem?.nombre || ""} onChange={handleEditChange} />
          <TextField margin="dense" label="Modelo" name="modelo" fullWidth value={currentItem?.modelo || ""} onChange={handleEditChange} />
          <TextField margin="dense" label="Descripción" name="descripcion" fullWidth value={currentItem?.descripcion || ""} onChange={handleEditChange} />
          <TextField margin="dense" label="Precio" name="precio" type="number" inputProps={{ min: 0 }} fullWidth value={currentItem?.precio || ""} onChange={handleEditChange} />
          <TextField margin="dense" label="Cantidad" name="cantidad" type="number" inputProps={{ min: 0 }} fullWidth value={currentItem?.cantidad || ""} onChange={handleEditChange} />
          <TextField margin="dense" label="Categoría" name="categoria" fullWidth value={currentItem?.categoria || ""} onChange={handleEditChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExistingItems;
