import { useState, useEffect } from "react";
import { NotificationIcon } from "../../../assets/icons/Icons.jsx";
import { NotificationPanel } from "./NotificationPanel.jsx";
import "./Notification.css";

export const Notification = () => {
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Esta es una notificación de prueba manual.",
      viewed: false,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        message: "Tienes una nueva tarea.",
        viewed: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);

      setHasNewNotification(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleIconClick = () => {
    setIsPanelOpen((prev) => !prev);
    setHasNewNotification(false);
    const updatedNotifications = notifications.map((notif) => ({
      ...notif,
      viewed: true,
    }));
    setNotifications(updatedNotifications);
  };

  return (
    <>
      <button
        className={`btn-notifications ${hasNewNotification ? "active" : ""}`}
        onClick={handleIconClick}
      >
        <NotificationIcon />
        {hasNewNotification && <div className="badge"></div>}
      </button>
      {isPanelOpen && <NotificationPanel notifications={notifications} />}
    </>
  );
};
