import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/AuthService";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Temporarily bypass authentication check
  // const isAuthenticated = authService.isAuthenticated();
  // const userRole = authService.getUserRole();

  // if (!isAuthenticated) {
  //   // Redirect to login if not authenticated
  //   return <Navigate to="/login" replace />;
  // }

  // if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
  //   // Redirect to unauthorized page if role not allowed
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return children;
};

export default ProtectedRoute;
