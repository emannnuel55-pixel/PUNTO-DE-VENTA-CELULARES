"use client";

import { useState, useRef } from "react";
import { Camera, Trash2, Loader2 } from "lucide-react";

export function CameraCapture({ 
  multiple = true, 
  name = "photosJson", 
  label = "Subir fotografías / Captura de cámara",
  defaultValue
}: { 
  multiple?: boolean; 
  name?: string; 
  label?: string; 
  defaultValue?: string | string[];
}) {
  const initialImages = defaultValue 
    ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue].filter(Boolean)) 
    : [];
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setUploading(true);
    const newUrls: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        } else {
          console.error("Upload failed for file:", file.name);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    if (multiple) {
      setImages((prev) => [...prev, ...newUrls]);
    } else {
      if (newUrls.length > 0) {
        setImages([newUrls[0]]);
      }
    }
    setUploading(false);
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="camera-capture-container" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
      <label>{label}</label>

      {/* Input oculto para enviar la información al backend */}
      <input 
        type="hidden" 
        name={name} 
        value={multiple ? JSON.stringify(images) : (images[0] || "")} 
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        {/* Galería de imágenes cargadas */}
        {images.map((url, idx) => (
          <div key={idx} style={{ 
            position: "relative", 
            width: "80px", 
            height: "80px", 
            borderRadius: "10px", 
            overflow: "hidden", 
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#0f172a"
          }}>
            <img src={url} alt={`preview-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                background: "rgba(220, 38, 38, 0.8)",
                color: "#fff",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0
              }}
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        {/* Botón de carga */}
        {(multiple || images.length === 0) && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", height: "auto" }}
            >
              {uploading ? <Loader2 size={16} className="premium-spinner" /> : <Camera size={16} />}
              {uploading ? "Subiendo..." : multiple ? "Tomar / Subir Foto" : "Subir Foto"}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              multiple={multiple}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
