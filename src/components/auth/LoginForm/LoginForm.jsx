import { useState } from "react";
import Button from "../../common/Button/Button";
import { useAuth } from "../../../contexts/AuthContext";
import "./LoginForm.css";

const LoginForm = () => {
  const { handleLogin } = useAuth();
  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    handleLogin(credentials);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="userName" className="form-label">
          Usuario
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          value={credentials.userName}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <Button type="submit" className="btn-primary login-submit">
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
