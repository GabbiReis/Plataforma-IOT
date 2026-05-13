import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Analises from "./pages/Analises";
import Colheita from "./pages/Colheita";
import Agendamentos from "./pages/Agendamentos";
import Pagamentos from "./pages/Pagamentos";
import Configuracoes from "./pages/Configuracoes";

import ChatbotWidget from "./components/ChatbotWidget";

import "./styles/theme.css";
import "./styles/layout.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} /> 
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/esqueci-senha" element={<ForgotPassword />} />
        <Route path="/registo" element={<Register />} />
        <Route path="/analises" element={<Analises />} />
        <Route path="/colheita" element={<Colheita />} />
        <Route path="/agendamentos" element={<Agendamentos />} />
        <Route path="/pagamentos" element={<Pagamentos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ChatbotWidget />

    </BrowserRouter>
  );
}