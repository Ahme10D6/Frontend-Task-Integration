import Swal from "sweetalert2";
import { api } from "@/lib/api";
import type { Attachment } from "@/types/attachment";

interface SaveAgentParams {
      mode: "create" | "edit";
      agentId: string | null;
      payload: any;
      setAgentId: (id: string) => void;
      setSaving: (v: boolean) => void;
      onSaved: () => void;
}

interface UploadFilesParams {
      files: FileList | null;
      uploadFile: (file: File) => Promise<Attachment>;
      setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
      acceptedTypes: string[];
}

interface TestCallParams {
      agentId: string;
      firstName: string;
      lastName: string;
      gender: string;
      phone: string;
      setCalling: (v: boolean) => void;
}

export async function saveAgent({
      mode,
      agentId,
      payload,
      setAgentId,
      setSaving,
      onSaved,
}: SaveAgentParams) {
      setSaving(true);
      try {
            if (mode === "create") {
                  const { data } = await api.post("/agents", payload);
                  setAgentId(data.id);
                  Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Agent created successfully!",
                        showConfirmButton: false,
                        timer: 3000,
                  });
            } else if (mode === "edit" && agentId) {
                  await api.put(`/agents/${agentId}`, payload);
                  Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Agent updated successfully!",
                        showConfirmButton: false,
                        timer: 3000,
                  });
            }
            onSaved();
      } catch (err) {
            console.error(err);
      } finally {
            setSaving(false);
      }
}

export async function startTestCall({
      agentId,
      firstName,
      lastName,
      gender,
      phone,
      setCalling,
}: TestCallParams) {
      setCalling(true);
      try {
            const { data } = await api.post(`/agents/${agentId}/test-call`, {
                  firstName,
                  lastName,
                  gender,
                  phoneNumber: phone,
            });

            Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: data.success ? "success" : "error",
                  title: data.success
                        ? `Test call initiated (ID: ${data.callId})`
                        : "Test call failed",
                  showConfirmButton: false,
                  timer: 3000,
            });
      } catch (e) {
            console.error(e);
      } finally {
            setCalling(false);
      }
}

export async function uploadFiles({
      files,
      uploadFile,
      setAttachments,
      acceptedTypes,
}: UploadFilesParams) {
      if (!files) return;

      for (const file of Array.from(files)) {
            const ext = "." + file.name.split(".").pop()?.toLowerCase();
            if (!acceptedTypes.includes(ext)) continue;

            try {
                  const uploaded = await uploadFile(file);
                  setAttachments(prev => [...prev, uploaded]);
            } catch { }
      }
}

export function removeAttachment(
      index: number,
      setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>
) {
      setAttachments(prev => prev.filter((_, i) => i !== index));
}