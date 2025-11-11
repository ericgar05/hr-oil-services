import { createContext, useContext, useState, useEffect } from "react";

const UiContext = createContext();

export const useUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi debe ser usado dentro de un UiProvider");
  }
  return context;
};

export const UiProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const value = {
    sidebarOpen,
    mobileSidebarOpen,
    isMobile,
    toggleSidebar,
    toggleMobileSidebar,
    setSidebarOpen,
    setMobileSidebarOpen,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
};
