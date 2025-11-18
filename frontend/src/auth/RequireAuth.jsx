// src/auth/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed } from "./authStorage";

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthed()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}
