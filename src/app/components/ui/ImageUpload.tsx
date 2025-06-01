// components/ui/ImageUpload.tsx
"use client";

import React, { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImageUrl?: string;
  onImageRemove?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  currentImageUrl,
  onImageRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Client-side validation
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece JPG, PNG ve GIF dosyaları kabul edilir!");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Dosya boyutu çok büyük! Maksimum 5MB olmalı.");
      return;
    }

    setIsUploading(true);

    const loadingToast = toast.loading("Fotoğraf yükleniyor...", {
      position: "top-center",
    });

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      toast.dismiss(loadingToast);

      if (response.ok) {
        const data = await response.json();
        onImageUpload(data.imageUrl);

        toast.success("Fotoğraf başarıyla yüklendi! ✅", {
          duration: 3000,
          position: "top-center",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Yükleme başarısız");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);

      toast.error(
        error instanceof Error
          ? error.message
          : "Fotoğraf yüklenirken hata oluştu!",
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
      toast.success("Fotoğraf kaldırıldı", {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Event preview"
            className="w-full h-64 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!currentImageUrl && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => {
            if (!isUploading) {
              document.getElementById("image-input")?.click();
            }
          }}
        >
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />

          <div className="space-y-4">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600">Fotoğraf yükleniyor...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-center">
                  {dragActive ? (
                    <Upload className="h-12 w-12 text-primary" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  )}
                </div>

                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {dragActive
                      ? "Dosyayı buraya bırakın"
                      : "Fotoğraf yüklemek için tıklayın"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    veya dosyayı sürükleyip bırakın
                  </p>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• En az 1170x504 piksel önerilidir</p>
                  <p>• JPG, PNG, GIF formatları desteklenir</p>
                  <p>• Maksimum dosya boyutu: 5MB</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Change Image Button */}
      {currentImageUrl && !isUploading && (
        <button
          type="button"
          onClick={() => document.getElementById("image-input")?.click()}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2"
        >
          <Upload size={16} />
          Fotoğrafı Değiştir
        </button>
      )}

      <input
        id="image-input"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
};

export default ImageUpload;
