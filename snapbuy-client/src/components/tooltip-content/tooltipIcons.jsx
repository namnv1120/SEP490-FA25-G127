import { Link } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { pdf, excel } from "../../utils/imagepath";

const TooltipIcons = () => {
  return (
    <>
      <Tooltip target=".pdf-tooltip" />
      <Tooltip target=".excel-tooltip" />

      <li>
        <Link to="#" className="pdf-tooltip" data-pr-tooltip="Pdf" data-pr-position="top">
          <img src={pdf} alt="pdf icon" />
        </Link>
      </li>
      <li>
        <Link to="#" className="excel-tooltip" data-pr-tooltip="Excel" data-pr-position="top">
          <img src={excel} alt="excel icon" />
        </Link>
      </li>
    </>
  );
};

export default TooltipIcons;