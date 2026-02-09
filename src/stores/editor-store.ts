import { create } from "zustand";

interface EditorState {
  activeFieldId: string | null;
  isDirty: boolean;
  zoomLevel: number;
  previewMode: "edit" | "preview";
  setActiveField: (id: string | null) => void;
  setDirty: (dirty: boolean) => void;
  setZoomLevel: (level: number) => void;
  setPreviewMode: (mode: "edit" | "preview") => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeFieldId: null,
  isDirty: false,
  zoomLevel: 1,
  previewMode: "edit",
  setActiveField: (activeFieldId) => set({ activeFieldId }),
  setDirty: (isDirty) => set({ isDirty }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  reset: () =>
    set({ activeFieldId: null, isDirty: false, zoomLevel: 1, previewMode: "edit" }),
}));
