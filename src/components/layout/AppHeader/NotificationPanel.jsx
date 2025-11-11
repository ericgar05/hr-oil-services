import "./NotificationPanel.css";

export const NotificationPanel = ({ notifications }) => {
  return (
    <div className="notification-panel">
      <div className="notification-panel-header">Notificaciones</div>
      <ul className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <li
              key={notif.id}
              className={`notification-item ${!notif.viewed ? "new" : ""}`}
            >
              {notif.message}
            </li>
          ))
        ) : (
          <li className="notification-item">No hay notificaciones nuevas.</li>
        )}
      </ul>
    </div>
  );
};
