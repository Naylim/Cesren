import { useState, useEffect, useRef} from "react";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, doc, updateDoc, addDoc } from "firebase/firestore";
import { TextareaAutosize } from "@mui/material";

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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from "@mui/material";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import DeleteIcon from "@mui/icons-material/Delete";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import "jspdf-autotable";


const RetiroArticulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [listaRetiro, setListaRetiro] = useState([]);
  const [folio, setFolio] = useState("");
  const [hospital, setHospital] = useState("");
  const [paciente, setPaciente] = useState("");
  const [afiliacion, setAfiliacion] = useState("");
  const [edad, setEdad] = useState("");
  const [cirujano, setCirujano] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const fecha = new Date().toLocaleDateString();
  const [comentarios, setComentarios] = useState("");

  const [firmaMedico, setFirmaMedico] = useState(null);
  const [firmaTecnico, setFirmaTecnico] = useState(null);
  const [firmaPaso, setFirmaPaso] = useState(1);
  const [openFirmaDialog, setOpenFirmaDialog] = useState(false);


// Inicializar las referencias de firma
const firmaMedicoRef = useRef(null);
const firmaTecnicoRef = useRef(null);

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

  // Añadir artículo al carrito
  const agregarALaLista = () => {
    if (!seleccionado || !cantidad || cantidad <= 0) {
      alert("Selecciona un artículo y una cantidad válida.");
      return;
    }
    if (Number(cantidad) > seleccionado.cantidad) {
      alert(`Las existencias no son suficientes, hay ${seleccionado.cantidad} unidades.`);
      return;
    }

    const yaExiste = listaRetiro.find(item => item.id === seleccionado.id);

    if (yaExiste) {
      alert("Este artículo ya está en la lista.");
      return;
    }

    setListaRetiro([
      ...listaRetiro,
      { ...seleccionado, cantidadRetiro: parseInt(cantidad) }
    ]);

    setSeleccionado(null);
    setCantidad("");
  };

  // Eliminar artículo del carrito
  const eliminarDeLaLista = (id) => {
    setListaRetiro(listaRetiro.filter(item => item.id !== id));
  };

  const abrirFirmaDialogo = () => {
    if (listaRetiro.length === 0) {
      alert("No hay artículos seleccionados.");
      return;
    }
    setOpenFirmaDialog(true);
  };

  const guardarFirma = async () => {
    // Declarar las variables al inicio de la función
    let firmaMedicoTemp = firmaMedico;
    let firmaTecnicoTemp = firmaTecnico;
  
    if (firmaPaso === 1) {
      if (firmaMedicoRef.current.isEmpty()) {
        alert("⚠️ La firma del médico es obligatoria.");
        return;
      }
  
      // Captura directa en la variable
      firmaMedicoTemp = firmaMedicoRef.current.getTrimmedCanvas().toDataURL("image/png");
      setFirmaMedico(firmaMedicoTemp);
      firmaMedicoRef.current.clear();
      setFirmaPaso(2);
  
    } else if (firmaPaso === 2) {
      if (firmaTecnicoRef.current.isEmpty()) {
        alert("⚠️ La firma del técnico es obligatoria.");
        return;
      }
  
      // Captura directa en la variable
      firmaTecnicoTemp = firmaTecnicoRef.current.getTrimmedCanvas().toDataURL("image/png");
      setFirmaTecnico(firmaTecnicoTemp);
      firmaTecnicoRef.current.clear();
  
      setOpenFirmaDialog(false);
      setFirmaPaso(1);
  
      // Ahora las firmas están definidas correctamente
      await retirarArticulos(firmaMedicoTemp, firmaTecnicoTemp);
    }
  };
  

  // Actualizar inventario después de las firmas
  const retirarArticulos = async (firmaMedicoTemp, firmaTecnicoTemp) => {
    try {
      for (const item of listaRetiro) {
        const itemRef = doc(db, "inventory", item.id);
        await updateDoc(itemRef, {
          cantidad: parseInt(item.cantidad) - parseInt(item.cantidadRetiro),
        });
      }
  
      await guardarRetiroEnFirebase(firmaMedicoTemp, firmaTecnicoTemp);
  
      generarPDFRetiro(firmaMedicoTemp, firmaTecnicoTemp);
  
      alert("¡Artículos retirados correctamente!");
      setListaRetiro([]);
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar el inventario:", error);
      alert("Error al retirar artículos.");
    }
  };
  

  // Función para guardar el retiro en Firebase
  const guardarRetiroEnFirebase = async (firmaMedicoTemp, firmaTecnicoTemp) => {
    try {
      await addDoc(collection(db, "movimientos"), {
        folio,
        fechaHora: new Date().toLocaleString("es-MX"),
        hospital,
        paciente,
        afiliacion,
        edad,
        cirujano,
        diagnostico,
        procedimiento,
        articulos: listaRetiro.map(item => ({
          nombre: item.nombre,
          modelo: item.modelo,
          cantidad: item.cantidadRetiro,
          precio: item.precio,
        })),
        total: listaRetiro.reduce((total, item) => total + item.precio * item.cantidadRetiro, 0),
        firmaMedico: firmaMedicoTemp,
        firmaTecnico: firmaTecnicoTemp,
        comentarios,
        responsable: localStorage.getItem('userName'),
        tipoMovimiento: "Retiro"
      });
  
      alert("✅ ¡Retiro guardado correctamente!");
      limpiarFormulario();
    } catch (error) {
      console.error("❌ Error al guardar el retiro:", error);
      alert("⚠️ Ocurrió un error al guardar el retiro.");
    }
  };
  
  // Limpiar el formulario después de guardar
  const limpiarFormulario = () => {
    setFolio("");
    setHospital("");
    setPaciente("");
    setAfiliacion("");
    setEdad("");
    setCirujano("");
    setDiagnostico("");
    setProcedimiento("");
    setFirmaMedico(null);
    setFirmaTecnico(null);
  };


// Función para generar el PDF
const generarPDFRetiro = (firmaMedicoTemp, firmaTecnicoTemp) => {
  const doc = new jsPDF();

  // 🎯 Encabezado con logo y texto CESREN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(0, 102, 204); // Color azul
  doc.text("CESREN", 20, 20);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Negro
  doc.text("REPORTE DE CIRUGÍA", 70, 30);

  // Línea debajo del encabezado
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // 📝 Datos del Paciente
  doc.setFontSize(12);
  const startY = 45;
  doc.text(`FOLIO: ${folio}`, 20, startY);
  doc.text(`FECHA: ${new Date().toLocaleString("es-MX")}`, 130, startY);
  doc.text(`HOSPITAL: ${hospital}`, 20, startY + 10);
  doc.text(`PACIENTE: ${paciente}`, 20, startY + 20);
  doc.text(`AFILIACIÓN: ${afiliacion}`, 20, startY + 30);
  doc.text(`EDAD: ${edad}`, 130, startY + 30);

  doc.setLineWidth(0.3);
  doc.line(20, startY + 35, 190, startY + 35);
  doc.text(`CIRUJANO: ${cirujano}`, 20, startY + 45);
  doc.text(`DIAGNÓSTICO: ${diagnostico}`, 20, startY + 55);
  doc.text(`PROCEDIMIENTO: ${procedimiento}`, 20, startY + 65);


  // 📦 Tabla de Artículos
  const columnas = ["Descripción", "Modelo", "Cantidad", "Precio", "Subtotal"];
  const filas = listaRetiro.map(item => [
    item.nombre,
    item.modelo,
    item.cantidadRetiro,
    `$${item.precio.toFixed(2)}`,
    `$${(item.precio * item.cantidadRetiro).toFixed(2)}`
  ]);

  doc.autoTable({
    startY: startY + 75,
    head: [columnas],
    body: filas,
    styles: { fontSize: 10, halign: 'center', cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] }, // Azul y texto blanco
    alternateRowStyles: { fillColor: [240, 240, 240] }, // Alternancia de filas
  });

  // 💰 Total
  const total = listaRetiro.reduce((total, item) => total + item.precio * item.cantidadRetiro, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL: $${total.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 10);

  // 💬 Comentarios
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("COMENTARIOS:", 20, doc.lastAutoTable.finalY + 20);
  doc.setFont("helvetica", "normal");
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    body: [[comentarios || "Ninguno"]],
    styles: { fontSize: 10, cellPadding: 3 }
  });

  // ✍️ Firmas
  const firmaY = doc.lastAutoTable.finalY + 15;

  if (firmaMedicoTemp) {
    doc.addImage(firmaMedicoTemp, "PNG", 20, firmaY, 60, 30);
    doc.text("Firma Médico", 30, firmaY + 35);
  }

  if (firmaTecnicoTemp) {
    doc.addImage(firmaTecnicoTemp, "PNG", 120, firmaY, 60, 30);
    doc.text("Firma Técnico CESREN", 130, firmaY + 35);
  }

  // 📄 Pie de página con contacto
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Contacto: contacto@cesren.com | Tel: +52 555 123 4567", 20, 275);
  //doc.text("Dirección: Av. Principal 123, CDMX, México", 20, 285);

  // 📥 Guardar PDF
  const pdfBlob = doc.output("blob");
  const pdfURL = URL.createObjectURL(pdfBlob);
  window.open(pdfURL, "_blank");

  doc.save(`REPORTE_CIRUGIA_${folio}.pdf`);
};



  return (
    <Box sx={{ flexGrow: 1, width: '100vw', minHeight: '100vh', backgroundColor: "#f0f2f5", p: 3 }}>
      <Container
        maxWidth="lg"
        sx={{
          py: 8,
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: 3,
          minHeight: "95vh",
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 4, color: "black"}}>
          Retiro de Artículos
        </Typography>

        {/* Formulario de Información */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="Folio" value={folio} onChange={(e) => setFolio(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Fecha" value={fecha} fullWidth disabled />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Hospital" value={hospital} onChange={(e) => setHospital(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Nombre del Paciente" value={paciente} onChange={(e) => setPaciente(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="No. de Afiliación" value={afiliacion} onChange={(e) => setAfiliacion(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Edad" type="number" inputProps={{ min: 0 }} value={edad} 
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (parseInt(value) >= 0 && !isNaN(value))) {
                setEdad(value);
              }
            }} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Nombre del Cirujano" value={cirujano} onChange={(e) => setCirujano(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Diagnóstico" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Procedimiento Quirúrgico" value={procedimiento} onChange={(e) => setProcedimiento(e.target.value)} fullWidth />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color:"black"}}>
              Selecciona los artículos para retirar:
            </Typography>
          </Grid>

          {/* Selector de Artículos */}
          <Grid item xs={12} sm={7}>
            <Autocomplete
              options={articulos.filter(a => !listaRetiro.find(l => l.id === a.id))}
              getOptionLabel={(option) => `${option.nombre} - ${option.modelo}`}
              value={seleccionado}
              onChange={(e, newValue) => setSeleccionado(newValue)}
              renderInput={(params) => <TextField {...params} label="Buscar Artículo" fullWidth />}
            />
          </Grid>

          <Grid item xs={12} sm={2}>
              <TextField
                label="Cantidad Actual"
                value={seleccionado ? seleccionado.cantidad : ""}
                fullWidth
                disabled
              />
          </Grid>

          <Grid item xs={12} sm={3}>
          <TextField
            label="Cantidad a Retirar"
            type="number"
            inputProps={{ min: 0 }}
            fullWidth 
            value={cantidad || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (parseInt(value) >= 0 && !isNaN(value))) {
                setCantidad(value);
              }
            }}
          />
          </Grid>

          {/* Botón para Agregar al Carrito */}
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

          {/* Tabla del Carrito */}
          <Grid item xs={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Artículo</strong></TableCell>
                    <TableCell><strong>Modelo</strong></TableCell>
                    <TableCell><strong>Precio Unitario</strong></TableCell>
                    <TableCell><strong>Cantidad</strong></TableCell>
                    <TableCell><strong>Subtotal</strong></TableCell>
                    <TableCell><strong>Eliminar</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listaRetiro.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.modelo}</TableCell>
                      <TableCell>${parseFloat(item.precio).toFixed(2)}</TableCell>
                      <TableCell>{item.cantidadRetiro}</TableCell>
                      <TableCell>${(item.precio * item.cantidadRetiro).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => eliminarDeLaLista(item.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fila para el Total */}
                  <TableRow>
                    <TableCell colSpan={4} align="right">
                      <strong>Total:</strong>
                    </TableCell>
                    <TableCell colSpan={2}>
                      <strong>
                        $
                        {listaRetiro
                          .reduce((total, item) => total + item.precio * item.cantidadRetiro, 0)
                          .toFixed(2)}
                      </strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Campo de Comentarios Opcional */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, color:"black"}}>
            Comentarios (Opcional):
            </Typography>
            <TextareaAutosize
              minRows={3}
              placeholder="Agregar comentarios adicionales..."
              style={{
                width: '98%',
                padding: '10px',
                borderRadius: '8px',
                borderColor: '#aaa',
                backgroundColor: "white",
                fontSize: '1rem',
                color: "black"
              }}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
          </Grid>

          {/* Botón de Retirar */}
          <Grid item xs={12} sx={{ mt: 2 }}>
          <ListItemButton
              onClick={abrirFirmaDialogo}
              sx={{
                backgroundColor: "#e91e63",
                borderRadius: 2,
                mx: 1,
                height: "60px",
                "&:hover": {
                  backgroundColor: "#c2185b",
                  color: "#fff",
                },
              }}
            >
              <ListItemText
                primary="Retirar articulos"
                primaryTypographyProps={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
            </ListItemButton>
          </Grid>

          {/* Dialogo de Firma */}
          <Dialog open={openFirmaDialog} onClose={() => setOpenFirmaDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>{firmaPaso === 1 ? "✍️ Firma del Médico" : "✍️ Firma del Técnico de CESREN"}</DialogTitle>
            <DialogContent>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
              ref={firmaPaso === 1 ? firmaMedicoRef : firmaTecnicoRef}
            />
            </DialogContent>
            <DialogActions>
              <Button onClick={guardarFirma} color="primary" variant="contained">
                {firmaPaso === 1 ? "Siguiente" : "Confirmar Retiro"}
              </Button>
            </DialogActions>
          </Dialog>


        </Grid>
      </Container>
    </Box>
  );
};

export default RetiroArticulos;
