import React, { createContext, useContext, useState, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification debe ser usado dentro de un NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const addNotification = useCallback((message, type = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      viewed: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
    setHasNewNotification(true);
  }, []);

  const markAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, viewed: true }))
    );
    setHasNewNotification(false);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setHasNewNotification(false);
  }, []);

  const value = {
    notifications,
    hasNewNotification,
    addNotification,
    markAsRead,
    clearNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
