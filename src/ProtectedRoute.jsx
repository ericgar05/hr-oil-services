import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

export const ProtectedRoute = () => {
    const {isAuthenticated} = useAuth()
    console.log(isAuthenticated)


if(!isAuthenticated){
    return <Navigate to = "/login" replace/>
}

  return (
    <>
  
      <Outlet />
    </>
  );
};