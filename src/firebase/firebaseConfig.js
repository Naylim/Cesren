// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAPmgaqJL2H2QyAx-SSh0J_lIQYjs_02jE",
    authDomain: "inventario-cesren.firebaseapp.com",
    projectId: "inventario-cesren",
    storageBucket: "inventario-cesren.firebasestorage.app",
    messagingSenderId: "899858022375",
    appId: "1:899858022375:web:faced1e0426b45b6b84742"
  };
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

export { db };
export const auth = getAuth(app);


//para importar
//import { db } from "../firebase/firebaseConfig";
