import { useState } from "react";
import { api } from "@/lib/api";
import type { Attachment } from "@/types/attachment";

interface UploadState {
  uploading: boolean;
  error: string | null;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    error: null,
  });

  const uploadFile = async (file: File): Promise<Attachment> => {
    try {
      setState({ uploading: true, error: null });

      // Step 1: signed URL
      const { data: uploadData } = await api.post(
        "/attachments/upload-url"
      );

      // Step 2: upload binary
      await fetch(uploadData.signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      // Step 3: register attachment
      const { data: attachment } = await api.post("/attachments", {
        key: uploadData.key,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      return attachment;
    } catch (error) {
      setState({
        uploading: false,
        error: "File upload failed",
      });
      throw error;
    } finally {
      setState(prev => ({ ...prev, uploading: false }));
    }
  };

  return {
    uploadFile,
    uploading: state.uploading,
    error: state.error,
  };
}
