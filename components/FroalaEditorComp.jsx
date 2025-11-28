"use client";

import dynamic from "next/dynamic";
import "froala-editor/js/plugins.pkgd.min.js";

const FroalaEditor = dynamic(
  () => import("react-froala-wysiwyg"),
  { ssr: false }
);

export default function FroalaEditorComp() {
  return (
    <div className="p-4">
      <FroalaEditor
        config={{
          key: "yDC5hE4C3A9zC7C4xA3G3I3H3A4B4E2D3D1E3B2cmC6hhC1iD1D1G4uC10B7riAf1Tf1YZNYAe1CUKUEQOHFVANUqZa1YPe1A4H4E3A10C3A6D5C2E4D4==",
          placeholderText: "Start typing...",
          heightMin: 300,
          charCounterCount: true,
        }}
      />
    </div>
  );
}
