import { excel } from "../../utils/imagepath";
import { Link } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { useSelector, useDispatch } from "react-redux";
import { setToggleHeader } from "../../core/redux/sidebarSlice";

const TableTopHead = ({
  onExportExcel,
  onRefresh,
  showExcel = true,
  showRefresh = true
}) => {
  const dispatch = useDispatch();
  const { toggleHeader } = useSelector((state) => state.sidebar);

  const handleToggleHeader = () => {
    dispatch(setToggleHeader(!toggleHeader));
  };

  return (
    <>
      <Tooltip target=".pr-tooltip" />
      <ul className="table-top-head">
        {showExcel && (
          <li>
            <Link
              to="#"
              className="pr-tooltip"
              data-pr-tooltip="Xuất Excel"
              data-pr-position="top"
              onClick={(e) => {
                e.preventDefault();
                if (onExportExcel) {
                  onExportExcel(e);
                }
              }}
            >
              <img src={excel} alt="excel" />
            </Link>
          </li>
        )}
        {showRefresh && (
          <li>
            <Link
              to="#"
              className="pr-tooltip"
              data-pr-tooltip="Tải lại trang"
              data-pr-position="top"
              onClick={onRefresh}
            >
              <i className="ti ti-refresh" />
            </Link>
          </li>
        )}
        <li>
          <Link
            to="#"
            className="pr-tooltip"
            data-pr-tooltip="Collapse"
            data-pr-position="top"
            id="collapse-header"
            onClick={handleToggleHeader}
          >
            <i
              className={`ti ${toggleHeader ? "ti-chevron-down" : "ti-chevron-up"
                }`}
            />
          </Link>
        </li>
      </ul>
    </>
  );
};

export default TableTopHead;
