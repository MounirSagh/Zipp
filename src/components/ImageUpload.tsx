import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
  disabled = false,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = "https://zipp-backend.vercel.app/api/upload";

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`${API_BASE}/image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onImageUpload(data.data.imageUrl);
      } else {
        setError(data.error || "Failed to upload image");
      }
    } catch (err) {
      setError("Network error while uploading image");
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      handleFileUpload(imageFile);
    } else {
      setError("Please drop an image file");
    }
  };

  const handleRemoveImage = () => {
    setError("");
    onImageRemove();
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image
      </label>

      {currentImageUrl ? (
        // Image preview with remove option
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Menu item"
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
          <Button
            type="button"
            onClick={handleRemoveImage}
            disabled={disabled || isUploading}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
            size="sm"
          >
            <X size={16} />
          </Button>
        </div>
      ) : (
        // Upload area
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleSelectClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {isDragOver ? (
                <Upload className="w-8 h-8 text-blue-500 mb-2" />
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600 mb-1">
                {isDragOver
                  ? "Drop image here"
                  : "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {currentImageUrl && !isUploading && (
        <Button
          type="button"
          onClick={handleSelectClick}
          disabled={disabled}
          variant="outline"
          className="w-full mt-2"
        >
          <Upload size={16} className="mr-2" />
          Change Image
        </Button>
      )}
    </div>
  );
};

export default ImageUpload;
