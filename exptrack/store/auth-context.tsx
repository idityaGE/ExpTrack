import { createContext, useContext, useEffect, useState } from "react";
import { deleteItemAsync, setItemAsync, getItem } from "expo-secure-store"

export interface User {
  userId: string,
  name: string,
  email: string,
}

interface AuthContextType {
  user: User | null,
  token: string | null,
  login: (user: User, token: string) => Promise<void>,
  logout: () => Promise<void>,
  isLoading: boolean,
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    await setItemAsync('authToken', authToken);
    await setItemAsync('userData', JSON.stringify(userData));
  }

  const logout = async () => {
    setUser(null);
    setToken(null);
    await deleteItemAsync('authToken');
    await deleteItemAsync('userData');
  }

  useEffect(() => {

    const loadAuthState = () => {
      try {
        const storedToken = getItem('authToken');
        const storedUserData = getItem('userData');

        if (storedToken && storedUserData) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error("Failed to load auth state:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthState();
  }, [])

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}