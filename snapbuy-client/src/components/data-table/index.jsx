import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CustomPaginator from "./custom-paginator";
import { Skeleton } from "primereact/skeleton";

const PrimeDataTable = ({
  column,
  data = [],
  totalRecords,
  currentPage = 1,
  setCurrentPage,
  rows = 10,
  setRows,
  sortable = true,
  footer = null,
  loading = false,
  isPaginationEnabled = true,
  serverSidePagination = false,
  selectionMode,
  selection,
  onSelectionChange,
  dataKey = "id",
}) => {
  const skeletonRows = Array(rows).fill(null).map((_, index) => ({
    [dataKey]: `skeleton-${index}`
  }));
  const totalPages = Math.ceil(totalRecords / rows);


  const paginatedData = loading
    ? skeletonRows
    : serverSidePagination
      ? data
      : (() => {
        const startIndex = (currentPage - 1) * rows;
        const endIndex = startIndex + rows;
        return data.slice(startIndex, endIndex);
      })();

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const customEmptyMessage = () => (
    <div className="no-record-found">
      <h4>Không tìm thấy bản ghi.</h4>
      <p>Không có dữ liệu để hiển thị...</p>
    </div>
  );


  const getDataTableProps = () => {
    const baseProps = {
      value: paginatedData,
      className: "table custom-table datatable",
      totalRecords: totalRecords,
      paginator: false,
      emptyMessage: customEmptyMessage,
      footer: footer,
      dataKey: dataKey,
    };

    if (selectionMode && ["multiple", "checkbox"].includes(selectionMode)) {
      return {
        ...baseProps,
        selectionMode: selectionMode,
        selection: selection,
        onSelectionChange: onSelectionChange,
      };
    } else if (selectionMode && ["single", "radiobutton"].includes(selectionMode)) {
      return {
        ...baseProps,
        selectionMode: selectionMode,
        selection: selection,
        onSelectionChange: onSelectionChange,
      };
    } else {
      return baseProps;
    }
  };

  return (
    <>
      <DataTable {...getDataTableProps()}>
        {column?.map((col, index) => (
          <Column
            header={col.header}
            key={col.key || col.field || `col-${index}`}
            field={col.field}
            body={(rowData, options) => {
              return loading ? (
                <Skeleton width="100%" height="2rem" className="skeleton-glow" />
              ) : col.body ? (
                col.body(rowData, options)
              ) : (
                rowData[col.field]
              );
            }}
            sortable={sortable === false ? false : col.sortable !== false}
            sortField={col.sortField ? col.sortField : col.field}
            className={col.className ? col.className : ""}
            style={col.style || {}}
          />
        ))}
      </DataTable>
      {isPaginationEnabled && (
        <CustomPaginator
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          rows={rows}
          setRows={setRows}
        />
      )}
    </>
  );
};

export default PrimeDataTable;