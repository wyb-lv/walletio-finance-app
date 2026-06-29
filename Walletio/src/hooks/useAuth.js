import { useSelector, useDispatch } from "react-redux";
import { loginUser, logoutUser } from "../store/slices/authSlice";

/**
 * Custom hook for auth state & actions
 * Usage: const { user, token, status, login, logout } = useAuth();
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, status } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginUser(credentials));
  const logout = () => dispatch(logoutUser());

  return { user, token, status, login, logout };
};
