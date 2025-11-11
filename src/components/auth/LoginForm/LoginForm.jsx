import { useState } from "react";
import Button from "../../common/Button/Button";
import "./LoginForm.css";
import { useAuth } from "../../../contexts/AuthContext";

const LoginForm = () => {
  const { handleLogin } = useAuth();
  const [credentials, setCredentials] = useState({
    userName: "",
    password: "",
  });

  const handleChange = (e) => {
    setCredentials({
      //Aqui agarra todos los los datos correspondientes
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //Agregado para la base de datos / en handleLogin le estoy pasando ya el formulario a la base de datos

    handleLogin(credentials);
    // onSubmit(credentials)
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
          // disabled={loading}
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
          // disabled={loading}
        />
      </div>

      <Button
        type="submit"
        className="btn-primary login-submit"
        // loading={loading}
        // disabled={loading}
      >
        Iniciar Sesión
      </Button>
    </form>
  );
};

export default LoginForm;
