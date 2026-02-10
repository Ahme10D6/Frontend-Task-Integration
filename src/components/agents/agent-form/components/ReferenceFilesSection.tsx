"use client";
import { useRef, useState } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_FILE_TYPES, formatFileSize } from "@/lib/utils";
import type { Attachment } from "@/types/attachment";
import { CollapsibleSection } from "./CollapsibleSection";

interface Props {
  attachments: Attachment[];
  uploading: boolean;
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
}

export function ReferenceFilesSection({
  attachments,
  uploading,
  onUpload,
  onRemove,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <CollapsibleSection
    title="Reference Data"
    description="Enhance your agent's knowledge base with uploaded files."
  >
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onUpload(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={ACCEPTED_FILE_TYPES.join(",")}
          onChange={(e) => onUpload(e.target.files)}
        />

        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />

        <p className="mt-2 text-sm font-medium">
          Drag & drop files here, or{" "}
          <button
            type="button"
            className="text-primary underline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            browse
          </button>
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Accepted: {ACCEPTED_FILE_TYPES.join(", ")}
        </p>
      </div>

      {/* File list */}
      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-sm truncate">{file.fileName}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(file.fileSize)}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
          <FileText className="h-10 w-10 mb-2" />
          <p className="text-sm">No Files Available</p>
        </div>
      )}
    </div>
    </CollapsibleSection>
  );
}
