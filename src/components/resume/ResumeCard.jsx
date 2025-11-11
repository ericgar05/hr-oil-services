import "./ResumeCard.css";

export const ResumeCard = ({ title, items, icon }) => {
  return (
    <article className="resume-card">
      <article className="content-resume-icon">
        <h4>
          {icon}
          {title}
        </h4>
      </article>

      <div className="resume-card-content">
        {Array.isArray(items) &&
          items.map((item, index) => (
            <div
              className={`resume-item ${item.highlight ? "highlight" : ""}`}
              key={index}
            >
              <span className="label">{item.label}</span>
              <div className="value-container">
                <span className="value">{item.value}</span>
                {item.equivalentValue && (
                  <span className="equivalent-value">
                    ≈ {item.equivalentValue}
                  </span>
                )}
              </div>
              <article className="container-bar">
                {item.progress !== undefined && (
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                )}
              </article>
            </div>
          ))}
      </div>
    </article>
  );
};
