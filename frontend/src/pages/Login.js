import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Login.css";
import logo from "../assets/Logo-semfundo.png";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (username === "admin" && password === "admin") {
            localStorage.setItem("auth", "true");
            navigate("/dashboard");
        } else {
            setError("Usuário ou senha inválidos");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="login-header">
                    <img src={logo} alt="AgriSense Logo" className="login-logo" />
                    <h2>AgriSense</h2>
                </div>

                <input
                    type="text"
                    placeholder="Usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Entrar</button>

                {error && <p className="error">{error}</p>}
            </form>
        </div>

    );
}

export default Login;
