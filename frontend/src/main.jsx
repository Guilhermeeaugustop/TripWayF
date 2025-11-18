// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import Login from './Components/Paginas/Login.jsx';
import SingIn from './Components/Paginas/SingIn.jsx';
import Site from './Components/Paginas/Site.jsx';
import MinhasViagens from './Components/Paginas/MinhasViagens.jsx'; // NOVO: Importar

import RequireAuth from './auth/RequireAuth.jsx';
import RedirectIfAuthed from './auth/RedirectIfAuthed.jsx';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const router = createBrowserRouter([
  // MODIFICADO: Redireciona para /viagens se logado
  { path: "/", element: (
      <RedirectIfAuthed>
        <Login />
      </RedirectIfAuthed>
    )
  },
  { path: "/SingIn", element: (
      <RedirectIfAuthed>
        <SingIn />
      </RedirectIfAuthed>
    )
  },

  // NOVO: Rota principal do Dashboard (protegida)
  { path: "/viagens", element: (
      
        <MinhasViagens />
      
    )
  },

  // MODIFICADO: Rota do editor agora é dinâmica
  { path: "/viagem/:viagemId", element: (
      
        <Site />
      
    )
  },

  // MODIFICADO: Fallback agora redireciona para a rota base correta
  { path: "*", element: <Navigate to="/viagens" replace /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);