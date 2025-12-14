import { useState, useEffect } from "react";
import logo from "../../assets/img/logo.png";
import "./admin-splash-screen.scss";

const AdminSplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start fade out animation
          setFadeOut(true);
          // Wait for fade out animation to complete
          setTimeout(() => {
            onComplete();
          }, 500);
          return 100;
        }
        // Increase progress smoothly
        // Slower at start, faster in middle, slower at end
        let increment;
        if (prev < 30) {
          increment = Math.random() * 8 + 3; // 3-11%
        } else if (prev < 70) {
          increment = Math.random() * 12 + 8; // 8-20%
        } else {
          increment = Math.random() * 6 + 2; // 2-8%
        }
        return Math.min(prev + increment, 100);
      });
    }, 80); // Update every 80ms for smoother animation

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`admin-splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <div className="admin-splash-content">
        <div className="admin-logo-container">
          <img src={logo} alt="Logo" className="admin-splash-logo" />
        </div>
        <div className="admin-progress-container">
          <div className="admin-progress-bar-wrapper">
            <div
              className="admin-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="admin-progress-text">{Math.round(progress)}%</div>
        </div>
      </div>
    </div>
  );
};

export default AdminSplashScreen;
