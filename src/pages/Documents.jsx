import React, { useState, useEffect } from "react";
import { Column } from "primereact/column";
import DTable from "../components/DTable";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Tooltip } from "primereact/tooltip";
import Modal from "../components/Modal";
import DocumentForm from "../components/AdditionForms/DocumentForm";
import axios from "axios";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import Swal from "sweetalert2";

export default function Documents() {
  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(1);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const toast = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, [render]);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get("/documents");
      setDocuments(response.data);
    } catch (error) {
      showError("Belgeler yüklenirken bir hata oluştu");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Emin misiniz?",
        text: "Bu belgeyi silmek istediğinize emin misiniz?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Evet, sil",
        cancelButtonText: "İptal",
      });

      if (result.isConfirmed) {
        await axios.post(`/documents/delete/${id}`);
        showSuccess("Belge başarıyla silindi");
        setRender((prev) => prev + 1);
      }
    } catch (error) {
      showError("Belge silinirken bir hata oluştu");
    }
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: "success",
      summary: "Başarılı",
      detail: message,
      life: 3000,
      icon: false,
    });
  };

  const showError = (message) => {
    toast.current.show({
      severity: "error",
      summary: "Hata",
      detail: message,
      life: 3000,
      icon: false,
    });
  };

  const formatDate = (rowData) => {
    const date = new Date(rowData.document_date);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusBodyTemplate = (rowData) => {
    const getSeverity = (status) => {
      switch (status) {
        case "Onaylandı":
          return "success";
        case "İşlemde":
          return "info";
        case "Beklemede":
          return "warning";
        case "Tamamlandı":
          return "success";
        case "İptal Edildi":
          return "danger";
        default:
          return null;
      }
    };

    return (
      <Tag value={rowData.status} severity={getSeverity(rowData.status)} />
    );
  };

  const descriptionBodyTemplate = (rowData) => {
    const maxLength = 30;
    const fullText = rowData.description;
    const shortText =
      fullText.length > maxLength
        ? `${fullText.substring(0, maxLength)}...`
        : fullText;

    return (
      <div className="description-cell">
        <span className="description-text" data-pr-tooltip={fullText}>
          {shortText}
        </span>
        <Tooltip target=".description-text" />
      </div>
    );
  };

  const personnelBodyTemplate = (rowData) => {
    const fullInfo = `${rowData.personnel_name} (${rowData.personnel_rank})`;
    return (
      <div className="personnel-cell">
        <span className="personnel-text" data-pr-tooltip={fullInfo}>
          {rowData.personnel_name}
        </span>
        <Tooltip target=".personnel-text" />
      </div>
    );
  };

  const activityBodyTemplate = (rowData) => {
    return (
      <div className="table_buttons">
        <div className="info_table_button">
          <Button
            label="Düzenle"
            onClick={() => {
              setSelectedDocument(rowData);
              setVisible(true);
            }}
            severity="primary"
          />
        </div>

        <Button
          label="Sil"
          onClick={() => handleDelete(rowData.id)}
          severity="danger"
        />
      </div>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <DTable
        data={documents}
        key={render}
        stripedRows
        onAdd={() => {
          setSelectedDocument(null);
          setVisible(true);
        }}
        addButtonLabel="Yeni Belge Ekle"
      >
        <Column field="document_no" header="Belge No" sortable></Column>
        <Column field="document_type" header="Belge Türü" sortable></Column>
        <Column
          body={personnelBodyTemplate}
          header="Personel"
          sortable
          sortField="personnel_name"
        ></Column>
        <Column field="personnel_id" header="Sicil No" sortable></Column>
        <Column
          body={formatDate}
          header="Belge Tarihi"
          sortable
          sortField="document_date"
        ></Column>
        <Column
          body={statusBodyTemplate}
          header="Durum"
          sortable
          sortField="status"
        ></Column>
        <Column field="processed_by" header="İşlem Yapan" sortable></Column>
        <Column body={descriptionBodyTemplate} header="Açıklama"></Column>
        <Column
          body={activityBodyTemplate}
          header="İşlemler"
          style={{ width: "120px" }}
        ></Column>
      </DTable>

      <Modal
        title={selectedDocument ? "Belge Düzenle" : "Yeni Belge Ekle"}
        state={visible}
        setState={setVisible}
        lang={false}
      >
        <DocumentForm
          setRender={setRender}
          setState={setVisible}
          defaultValues={selectedDocument}
          showSuccess={showSuccess}
          showError={showError}
        />
      </Modal>
    </div>
  );
}
