import React from "react";
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
  selectionMode,
  selection,
  onSelectionChange,
}) => {
  const skeletonRows = Array(rows).fill({});
  const totalPages = Math.ceil(totalRecords / rows);

  const startIndex = (currentPage - 1) * rows;
  const endIndex = startIndex + rows;
  const paginatedData = loading ? skeletonRows : data.slice(startIndex, endIndex);

  const onPageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const customEmptyMessage = () => (
    <div className="no-record-found">
      <h4>No records found.</h4>
      <p>No records to show here...</p>
    </div>
  );

  const getDataTableProps = () => {
    const baseProps = {
      value: paginatedData,
      className: "table custom-table datatable",
      totalRecords,
      paginator: false,
      emptyMessage: customEmptyMessage,
      footer,
      dataKey: "id",
    };

    if (selectionMode) {
      return {
        ...baseProps,
        selection,
        onSelectionChange: (e) => onSelectionChange(e.value),
      };
    }

    return baseProps;
  };

  return (
    <>
      <DataTable {...getDataTableProps()}>
        {column?.map((col, index) => (
          <Column
            key={col.key || col.field || index}
            field={col.field}
            header={col.header}
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
            sortField={col.sortField || col.field}
            className={col.className || ""}
            style={col.style}
            selectionMode={col.selectionMode || undefined}
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