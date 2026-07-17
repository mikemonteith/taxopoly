import { createContext, useContext } from "react";

type DebugContextType = {
  debug: boolean;
};

export const DebugContext = createContext<DebugContextType | null>(null);

export const useDebugContext = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebugContext must be used within a DebugProvider");
  }
  return context;
};

export const useDebug = () => {
  const context = useDebugContext();
  return context.debug;
};

export const DebugProvider = ({ children }: { children: React.ReactNode }) => {
  const value: DebugContextType = {
    debug: import.meta.env.DEV,
  };
  return (
    <DebugContext.Provider value={value}>{children}</DebugContext.Provider>
  );
};
