import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { getFirestore, getDocs } from 'firebase/firestore';
import { collection, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {  TextField, Button, Typography, Box, Paper } from '@mui/material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const db = getFirestore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario autenticado:', user);
  
      const usersCollectionRef = collection(db, "users");
      const q = query(usersCollectionRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        localStorage.setItem('userRole', userData.role);
        localStorage.setItem('userName', userData.name);
        console.log('Rol almacenado:', userData.role);
  
        if (userData.role === 'admin' || userData.role === 'worker') {
          navigate('/inicio');
        } else {
          setError('Acceso no autorizado.');
        }
      } else {
        setError('No se encontró el usuario en Firestore.');
      }
  
    } catch (error) {
      setError('Usuario o contraseña incorrectos.');
      console.error('Error al iniciar sesión:', error.message);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '99%',
        height: '98%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f4f4f4',
        textAlign: 'center',
        padding: 2,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ fontWeight: 'bold', mb: 6, color:'black'}}
      >
        Bienvenido al inventario de CESREN
      </Typography>
      <Paper 
        elevation={6} 
        sx={{
          padding: 5,
          borderRadius: 2,
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Iniciar Sesión
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            type="email"
            label="Correo electrónico"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            type="password"
            label="Contraseña"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Ingresar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
