"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PropertyImageEditorProps = {
  propertyId: string;
  currentImageUrl: string | null;
  propertyName: string;
};

export default function PropertyImageEditor({
  propertyId,
  currentImageUrl,
  propertyName,
}: PropertyImageEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    if (!file) return;
    setUploading(true);

    try {
      // 1. Upload to /api/upload
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // 2. Update property via PATCH /api/properties/[id]
      const patchRes = await fetch(`/api/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (patchRes.ok) {
        setIsEditing(false);
        setFile(null);
        setPreview(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update property image:", error);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || currentImageUrl;

  return (
    <div className="relative group h-48 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:border-slate-700/80 mb-6 flex items-center justify-center">
      {displayUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayUrl} alt={propertyName} className="h-full w-full object-cover" />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-400">
          <svg className="w-10 h-10 mb-1 text-slate-300 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">No Image Uploaded</span>
        </div>
      )}

      {/* Edit Overlay Button */}
      {!isEditing ? (
        <button
          onClick={() => setIsEditing(true)}
          className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700/80 hover:bg-slate-900 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-lg backdrop-blur-xs shadow-sm transition-all flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          {currentImageUrl ? "Edit Image" : "+ Upload Image"}
        </button>
      ) : (
        <div className="absolute inset-0 bg-slate-900 dark:bg-slate-700/90 backdrop-blur-xs p-4 flex flex-col justify-between text-white">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 dark:text-slate-300 block mb-2">Upload New Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-300 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-white dark:bg-slate-900 file:text-slate-800 dark:text-slate-100 hover:file:bg-slate-100 dark:bg-slate-800 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFile(null);
                setPreview(null);
              }}
              className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white text-xs font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!file || uploading}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              {uploading ? "Saving..." : "Save Image"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
