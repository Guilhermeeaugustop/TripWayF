// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

import Login from './Components/Paginas/Login.jsx';
import SingIn from './Components/Paginas/SingIn.jsx';
import Site from './Components/Paginas/Site.jsx';
import MinhasViagens from './Components/Paginas/MinhasViagens.jsx';

import RequireAuth from './auth/RequireAuth.jsx';
import RedirectIfAuthed from './auth/RedirectIfAuthed.jsx';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const router = createBrowserRouter([
  // Rota pública (Login)
  { path: "/", element: (
      <RedirectIfAuthed>
        <Login />
      </RedirectIfAuthed>
    )
  },
  // Rota pública (Cadastro)
  { path: "/SingIn", element: (
      <RedirectIfAuthed>
        <SingIn />
      </RedirectIfAuthed>
    )
  },

  // CORREÇÃO AQUI: Rota protegida do Dashboard
  { path: "/viagens", element: (
      <RequireAuth>
        <MinhasViagens />
      </RequireAuth>
    )
  },

  // CORREÇÃO AQUI: Rota protegida do Editor
  { path: "/viagem/:viagemId", element: (
      <RequireAuth>
        <Site />
      </RequireAuth>
    )
  },

  // Fallback
  { path: "*", element: <Navigate to="/viagens" replace /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);