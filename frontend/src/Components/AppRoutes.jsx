import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Components/Paginas/Login";
import Site from "../Components/Paginas/Site";
import SingIn from "../Components/Paginas/SingIn";

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />           
        {/* Página inicial */}
        <Route path="/login" element={<Site />} />     
        {/* Página de login */}
        <Route path="/signin" element={<SingIn />} />   
        {/* Página de cadastro */}
      </Routes>
    </Router>
  );
}
