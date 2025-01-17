import { createContext } from "react";
import { useNavigate } from "react-router-dom";

export const MyContext = createContext();

export function ErrorProvider({ children }) {
  const navigate = useNavigate();

  const handleErrors = (status) => {
    if (status === 401) {
      alert("Your session has expired! Please log in again.");
      navigate("/login");
    }
  };

  return (
    <MyContext.Provider
      value={{
        handleErrors,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}
