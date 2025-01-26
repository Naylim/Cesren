import { Typography, Box } from "@mui/material";

const Inicio = () => {
  return (
    <Box sx={{ p: 5, textAlign: "center", mt: 10 }}>
      <Typography variant="h3" gutterBottom>
        ¡Bienvenido a CESREN!
      </Typography>
      <Typography variant="h6">
        Gestiona tu inventario de forma rápida y eficiente. :D
      </Typography>
    </Box>
  );
};

export default Inicio;
