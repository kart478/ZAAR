import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface UploadedImage {
  file: File;
  preview: string;
  fileId?: string;
}

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (image: UploadedImage | null) => void;
  className?: string;
  previewClassName?: string;
  buttonText?: string;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onImageChange,
  className = "",
  previewClassName = "h-24 w-24",
  buttonText = "Choose image from device",
  accept = ".jpg,.jpeg,.png,.webp",
  maxSize = 5 * 1024 * 1024, // 5MB default
  disabled = false
}) => {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [uploadError, setUploadError] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, JPEG, PNG, or WebP).");
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setUploadError(`Image size must be less than ${maxSizeMB}MB.`);
      return;
    }

    setUploadError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const newImage = {
        file,
        preview
      };
      setImage(newImage);
      onImageChange(newImage);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setUploadError("");
    onImageChange(null);
  };

  const handleReplaceImage = () => {
    // Trigger file input click
    document.getElementById('image-upload-input')?.click();
  };

  const displayImage = image?.preview || currentImage;

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        id="image-upload-input"
        type="file"
        accept={accept}
        onChange={handleImageUpload}
        className="hidden"
        disabled={disabled}
      />
      
      {!displayImage ? (
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Upload image from your device
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('image-upload-input')?.click()}
            disabled={disabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, JPEG, PNG, WebP • Max {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className={`relative rounded-lg overflow-hidden bg-muted ${previewClassName}`}>
            <img
              src={displayImage}
              alt="Image preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleReplaceImage}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          {image && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{image.file.name}</span>
              <span>{(image.file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}
        </div>
      )}
      
      {uploadError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export const uploadImageToStorage = async (
  file: File,
  userId = "anonymous",
  folder = "uploads",
): Promise<string> => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const filePath = `${folder}/${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from("user-media")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("user-media").getPublicUrl(filePath);
  return data.publicUrl;
};
