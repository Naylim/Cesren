import { useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Container, Typography, Box, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([]);
  const [filteredMovimientos, setFilteredMovimientos] = useState([]);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filterToday, setFilterToday] = useState(false);

  // Obtener datos de la colección 'movimientos'
  const fetchMovimientos = async () => {
    const movimientosCollection = collection(db, "movimientos");
    const movimientosSnapshot = await getDocs(movimientosCollection);
    const movimientosList = movimientosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMovimientos(movimientosList);
    setFilteredMovimientos(movimientosList);  // Inicialmente mostrar todos
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  // Manejar clic en fila
  const handleRowClick = (params) => {
    setSelectedMovimiento(params.row);
    setOpenDialog(true);
  };

  // Filtrar movimientos del día actual
  const handleFilterToday = () => {
    if (filterToday) {
      setFilteredMovimientos(movimientos);  // Mostrar todos si se desactiva el filtro
    } else {
      const today = new Date().toLocaleDateString("es-MX");
      const filtered = movimientos.filter((mov) => {
        const fechaMovimiento = mov.fechaHora.split(",")[0]; // Extraer solo la parte de la fecha
        return fechaMovimiento === today;
      });
      setFilteredMovimientos(filtered);
    }
    setFilterToday(!filterToday);
  };

  // Definir columnas para la tabla DataGrid
  const columns = [
    { field: "fechaHora", headerName: "Fecha y Hora", flex: 1, minWidth: 200 },
    { field: "responsable", headerName: "Responsable", flex: 1, minWidth: 200 },
    { field: "tipoMovimiento", headerName: "Tipo de Movimiento", flex: 1, minWidth: 200 },
  ];

  return (
    <Box sx={{ flexGrow: 1, width: "100vw", overflowX: "auto" }}>
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          mt: 4,
          px: 0,
          backgroundColor: "#f5f5f5",
          padding: 7,
          borderRadius: 2,
          width: "100%",
          height: "100%",
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 4, color: "black" }}>
          Movimientos Realizados
        </Typography>

        {/* Botón para filtrar movimientos de hoy */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={handleFilterToday}
        >
          {filterToday ? "Mostrar Todos" : "Ver Movimientos de Hoy"}
        </Button>

        <Paper sx={{ height: 600, width: "100%", overflow: "hidden" }}>
          <DataGrid
            rows={filteredMovimientos}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            onRowClick={handleRowClick}
            initialState={{
              sorting: {
                sortModel: [{ field: "fechaHora", sort: "desc" }], // Orden descendente por defecto
              },
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#e0e0e0",
                color: "#000",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Paper>
      </Container>

      {/* Ventana emergente para mostrar detalles del movimiento */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalles del Movimiento</DialogTitle>
        <DialogContent dividers>
          {selectedMovimiento && (
            <>
              <Typography variant="subtitle1" sx={{ color: "blue" }}>
                <strong>Tipo Movimiento:</strong> {selectedMovimiento.tipoMovimiento}
              </Typography>
              <Typography variant="subtitle1"><strong>Fecha y Hora:</strong> {selectedMovimiento.fechaHora}</Typography>
              <Typography variant="subtitle1"><strong>Responsable:</strong> {selectedMovimiento.responsable}</Typography>

              {selectedMovimiento.tipoMovimiento === "Retiro" ? (
                <>
                  <Typography variant="subtitle1" sx={{ color: "#c2185b" }}><strong>Folio:</strong> {selectedMovimiento.folio}</Typography>
                  <Typography variant="subtitle1"><strong>Paciente:</strong> {selectedMovimiento.paciente}</Typography>
                  <Typography variant="subtitle1"><strong>Diagnóstico:</strong> {selectedMovimiento.diagnostico}</Typography>
                  <Typography variant="subtitle1"><strong>Cirujano:</strong> {selectedMovimiento.cirujano}</Typography>
                  <Typography variant="subtitle1"><strong>Comentarios:</strong> {selectedMovimiento.comentarios}</Typography>
                  <Typography variant="subtitle1"><strong>Total:</strong> ${selectedMovimiento.total}</Typography>

                  <Typography variant="h6" sx={{ mt: 2 }}>Artículos:</Typography>
                  {selectedMovimiento.articulos?.map((articulo, index) => (
                    <Typography key={index} sx={{ ml: 2 }}>
                      - {articulo.nombre} ({articulo.modelo}) - {articulo.cantidad} unidades - ${articulo.precio}
                    </Typography>
                  ))}
                </>
              ) : selectedMovimiento.tipoMovimiento === "Agrego Existencia" ? (
                <>
                  <Typography variant="subtitle1"><strong>Artículos Agregados:</strong></Typography>
                  {selectedMovimiento.articulos?.map((articulo, index) => (
                    <Typography key={index} sx={{ ml: 2 }}>
                      - {articulo.nombre} ({articulo.modelo}) - {articulo.cantidadAgregada} unidades
                    </Typography>
                  ))}
                </>
              ) : selectedMovimiento.tipoMovimiento === "Agrego Nuevo" ? (
                <>
                  <Typography variant="subtitle1"><strong>Artículo Nuevo Agregado:</strong></Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.nombre} ({selectedMovimiento.modelo}) - {selectedMovimiento.cantidad} unidades
                  </Typography>
                  <Typography variant="subtitle1"><strong>Precio: </strong> ${selectedMovimiento.precio}</Typography>
                </>
              ) :  selectedMovimiento.tipoMovimiento === "Edición" ? (
                <>
                  <Typography variant="subtitle1">
                    <strong>Artículo Modificado:</strong>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.nombreAnterior} →{' '}
                    <span style={{ color: 'blue' }}>{selectedMovimiento.nombreNuevo}</span>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.modeloAnterior} →{' '}
                    <span style={{ color: 'blue' }}>{selectedMovimiento.modeloNuevo}</span>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.descripcionAnterior} →{' '}
                    <span style={{ color: 'blue' }}>{selectedMovimiento.descripcionNueva}</span>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - ${selectedMovimiento.precioAnterior} →{' '}
                    <span style={{ color: 'blue' }}>${selectedMovimiento.precioNuevo}</span>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.cantidadAnterior} →{' '}
                    <span style={{ color: 'blue' }}>{selectedMovimiento.cantidadNueva}</span>
                  </Typography>
                  <Typography sx={{ ml: 2 }}>
                    - {selectedMovimiento.categoriaAnterior} →{' '}
                    <span style={{ color: 'blue' }}>{selectedMovimiento.categoriaNueva}</span>
                  </Typography>
                </>
              ) : selectedMovimiento.tipoMovimiento === "Eliminación" ? (
                <>
                  <Typography variant="subtitle1"><strong>Artículo Eliminado:</strong></Typography>
                  <Typography sx={{ ml: 2, color: "red"}}>
                    - {selectedMovimiento.nombre} ({selectedMovimiento.modelo}) - {selectedMovimiento.cantidad} unidades
                  </Typography>
                  <Typography variant="subtitle1" sx={{ ml: 2, color: "red"}} >Precio: ${selectedMovimiento.precio}</Typography>
                </>
              ) : (
                <Typography variant="subtitle1">No hay información detallada para este tipo de movimiento.</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Movimientos;
