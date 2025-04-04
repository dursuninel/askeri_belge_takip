import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { useFormik } from "formik";
import * as Yup from "yup";
import { classNames } from "primereact/utils";

export default function AddDocumentForm({ setRender, setState }) {
  const [sending, setSending] = useState(false);

  const documentTypes = [
    "İzin Belgesi",
    "Görev Emri",
    "Terhis Belgesi",
    "Sağlık Raporu",
    "Diğer",
  ];

  const ranks = [
    "Er",
    "Çavuş",
    "Uzman Çavuş",
    "Astsubay",
    "Teğmen",
    "Üsteğmen",
    "Yüzbaşı",
    "Binbaşı",
    "Yarbay",
    "Albay",
  ];

  const statusOptions = [
    "Beklemede",
    "İşlemde",
    "Onaylandı",
    "Tamamlandı",
    "İptal Edildi",
  ];

  const validationSchema = Yup.object().shape({
    document_no: Yup.string().required("Belge numarası zorunludur"),
    document_type: Yup.string().required("Belge türü seçiniz"),
    personnel_name: Yup.string().required("Personel adı soyadı zorunludur"),
    personnel_rank: Yup.string().required("Personel rütbesi seçiniz"),
    personnel_id: Yup.string().required("Sicil numarası zorunludur"),
    document_date: Yup.date().required("Belge tarihi zorunludur"),
    status: Yup.string().required("Durum seçiniz"),
    processed_by: Yup.string().required("İşlem yapan bilgisi zorunludur"),
    description: Yup.string(),
  });

  const formik = useFormik({
    initialValues: {
      document_no: "",
      document_type: "",
      personnel_name: "",
      personnel_rank: "",
      personnel_id: "",
      document_date: null,
      status: "",
      processed_by: "",
      description: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        setSending(true);
        // API çağrısı burada yapılacak
        console.log("Yeni belge:", values);
        setState(false);
        formik.resetForm();
      } catch (error) {
        console.error("Hata:", error);
      } finally {
        setSending(false);
      }
    },
  });

  const isFormFieldInvalid = (name) =>
    !!(formik.touched[name] && formik.errors[name]);

  const getFormErrorMessage = (name) => {
    return isFormFieldInvalid(name) ? (
      <small className="p-error">{formik.errors[name]}</small>
    ) : null;
  };

  return (
    <form onSubmit={formik.handleSubmit} className="p-fluid d-flex flex-column gap-2">
      <div className="p-field">
        <label htmlFor="document_no">Belge No</label>
        <InputText
          id="document_no"
          name="document_no"
          value={formik.values.document_no}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={classNames({
            "p-invalid": isFormFieldInvalid("document_no"),
          })}
        />
        {getFormErrorMessage("document_no")}
      </div>

      <div className="p-field">
        <label htmlFor="document_type">Belge Türü</label>
        <Dropdown
          id="document_type"
          name="document_type"
          value={formik.values.document_type}
          options={documentTypes}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Belge türü seçin"
          className={classNames({
            "p-invalid": isFormFieldInvalid("document_type"),
          })}
        />
        {getFormErrorMessage("document_type")}
      </div>

      <div className="p-field">
        <label htmlFor="personnel_name">Personel Adı Soyadı</label>
        <InputText
          id="personnel_name"
          name="personnel_name"
          value={formik.values.personnel_name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={classNames({
            "p-invalid": isFormFieldInvalid("personnel_name"),
          })}
        />
        {getFormErrorMessage("personnel_name")}
      </div>

      <div className="p-field">
        <label htmlFor="personnel_rank">Personel Rütbesi</label>
        <Dropdown
          id="personnel_rank"
          name="personnel_rank"
          value={formik.values.personnel_rank}
          options={ranks}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Rütbe seçin"
          className={classNames({
            "p-invalid": isFormFieldInvalid("personnel_rank"),
          })}
        />
        {getFormErrorMessage("personnel_rank")}
      </div>

      <div className="p-field">
        <label htmlFor="personnel_id">Sicil No</label>
        <InputText
          id="personnel_id"
          name="personnel_id"
          value={formik.values.personnel_id}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={classNames({
            "p-invalid": isFormFieldInvalid("personnel_id"),
          })}
        />
        {getFormErrorMessage("personnel_id")}
      </div>

      <div className="p-field">
        <label htmlFor="document_date">Belge Tarihi</label>
        <Calendar
          id="document_date"
          name="document_date"
          value={formik.values.document_date}
          onChange={(e) => formik.setFieldValue("document_date", e.value)}
          onBlur={formik.handleBlur}
          showTime
          showIcon
          showButtonBar
          locale="tr"
          className={classNames({
            "p-invalid": isFormFieldInvalid("document_date"),
          })}
        />
        {getFormErrorMessage("document_date")}
      </div>

      <div className="p-field">
        <label htmlFor="status">Durum</label>
        <Dropdown
          id="status"
          name="status"
          value={formik.values.status}
          options={statusOptions}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Durum seçin"
          className={classNames({
            "p-invalid": isFormFieldInvalid("status"),
          })}
        />
        {getFormErrorMessage("status")}
      </div>

      <div className="p-field">
        <label htmlFor="processed_by">İşlem Yapan</label>
        <InputText
          id="processed_by"
          name="processed_by"
          value={formik.values.processed_by}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={classNames({
            "p-invalid": isFormFieldInvalid("processed_by"),
          })}
        />
        {getFormErrorMessage("processed_by")}
      </div>

      <div className="p-field">
        <label htmlFor="description">Açıklama</label>
        <InputTextarea
          id="description"
          name="description"
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          rows={3}
        />
      </div>

      <div className="w-100">
        <Button
          label={sending ? "Kaydediliyor..." : "Kaydet"}
          type="submit"
          severity="primary"
          loading={sending}
        />
      </div>
    </form>
  );
}
