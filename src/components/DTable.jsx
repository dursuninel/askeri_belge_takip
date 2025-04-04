import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaPlus } from "react-icons/fa6";
import React, { useState } from "react";

export default function DTable({
  data,
  children,
  onAdd,
  addButtonLabel = "Yeni Ekle",
}) {
  const [globalFilter, setGlobalFilter] = useState("");

  const renderHeader = () => {
    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="table-header">
          <span className="p-input-icon-left">
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Ara..."
            />
          </span>
        </div>
        <Button
          label={addButtonLabel}
          icon={<FaPlus />}
          onClick={onAdd}
          severity="success"
        />
      </div>
    );
  };

  return (
    <>
      <DataTable
        value={data}
        paginator
        rows={25}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="Kayıt Bulunamadı"
        header={renderHeader()}
        globalFilter={globalFilter}
      >
        {children}
      </DataTable>
    </>
  );
}
