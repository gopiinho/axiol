"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useUploadWithProgress() {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });
  const generateUploadUrl = useMutation(api.contentStorage.generateUploadUrl);
  const syncMetadata = useMutation(api.contentStorage.syncMetadata);
  const recordContentFile = useMutation(api.contentStorage.recordContentFile);

  const upload = useCallback(
    async (file: File): Promise<string> => {
      setState({ uploading: true, progress: 0, error: null });

      try {
        const { url, key } = await generateUploadUrl();

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setState((prev) => ({
                ...prev,
                progress: Math.round((e.loaded / e.total) * 100),
              }));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed (${xhr.status})`));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.ontimeout = () => reject(new Error("Upload timed out"));

          xhr.open("PUT", url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.timeout = 300000;
          xhr.send(file);
        });

        await syncMetadata({ key });
        await recordContentFile({
          r2Key: key,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });

        setState({ uploading: false, progress: 100, error: null });
        return key;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed. Please try again.";
        setState({ uploading: false, progress: 0, error: message });
        throw err;
      }
    },
    [generateUploadUrl, syncMetadata, recordContentFile]
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, error: null });
  }, []);

  return {
    upload,
    uploading: state.uploading,
    progress: state.progress,
    error: state.error,
    reset,
  };
}
