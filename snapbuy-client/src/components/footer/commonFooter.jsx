import { Link } from "react-router-dom";

const CommonFooter = () => {
  return (
    <footer>
      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2025 © SnapBUy</p>
        <p>
          Designed &amp; Developed by{" "}
          <Link to="#" className="text-primary">
            Dreams
          </Link>
        </p>
      </div>
    </footer>
  );
};

export default CommonFooter;