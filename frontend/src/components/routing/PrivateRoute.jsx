import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ roles = [], children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles.length && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // If children (a layout) were provided, render them; otherwise render nested <Outlet />
  return children ? children : <Outlet />;
};

export default PrivateRoute;