import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
        <p className="mb-0">2025 © SnapBuy. All Right Reserved</p>
        <p>
          Designed &amp; Developed by{" "}
          <Link to="#" className="text-primary">
            G127
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Footer;