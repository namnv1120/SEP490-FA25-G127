import { Link } from "react-router-dom";

const CommonFooter = () => {
  return (
      <footer className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2025 © SnapBuy.</p>
        <p>
          Thiết kế &amp; Phát triển bởi{" "}
          <Link to="#" className="text-primary">
            G127
          </Link>
        </p>
      </footer>
  );
};

export default CommonFooter;
