import { useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../../auth/authStorage"; // ajuste o caminho

export default function LogoutButton({ className = "btn btn-outline-danger btn-sm" }) {
  const navigate = useNavigate();
  const user = getUser(); // opcional

  const handleLogout = () => {
    clearAuth();                 // limpa o “login” salvo no front
    navigate("/", { replace: true });  // volta para a tela de login
  };

  return (
    <button className={className} onClick={handleLogout}>
      Sair {user ? `(${user.name || user.email})` : ""}
    </button>
  );
}
