import { Dialog } from "primereact/dialog";
import React from "react";

export default function Modal({ title, state, setState, lang, big, children }) {
  return (
    <Dialog
      header={title}
      draggable={false}
      visible={state}
      style={
        big
          ? { maxWidth: "95rem", width: "100%", margin: "1rem" }
          : { maxWidth: "45rem", width: "100%", margin: "1rem" }
      }
      onHide={() => {
        if (!state) return;
        setState(false);
      }}
    >
      {children}
    </Dialog>
  );
}
