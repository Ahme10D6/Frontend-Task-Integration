"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import {
  ChevronDown,
  Upload,
  X,
  FileText,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useUpload } from "@/hooks/useUpload";
import type { Language, Voice, Prompt, Model } from "@/types/reference";
import type { Attachment } from "@/types/attachment";
import { api } from "@/lib/api";

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

function formatFileSize(bytes: number): string {

  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function CollapsibleSection({
  title,
  description,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  description: string;
  badge?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer select-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription className="mt-1">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {badge !== undefined && badge > 0 && (
                  <Badge variant="destructive">
                    {badge} required
                  </Badge>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""
                    }`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Separator />
          <CardContent className="pt-6">{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export interface AgentFormInitialData {
  agentName?: string;
  description?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
  latency?: number;
  speed?: number;
  callScript?: string;
  serviceDescription?: string;
}

interface AgentFormProps {
  mode: "create" | "edit";
  initialData?: AgentFormInitialData;
}

interface AgentPayload {
  name: string;
  description: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
  model: string;
  latency: number;
  speed: number;
  callScript: string;
  serviceDescription: string;
  attachments: string[];
  tools: {
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
  };
}


export function AgentForm({ mode, initialData }: AgentFormProps) {
  // Reference Data Hooks for dropdowns
  const {
    data: languages,
    loading: languagesLoading,
  } = useReferenceData<Language>("languages");
  const {
    data: voices,
    loading: voicesLoading,
  } = useReferenceData<Voice>("voices");
  const {
    data: prompts,
    loading: promptsLoading,
  } = useReferenceData<Prompt>("prompts");
  const {
    data: models,
    loading: modelsLoading,
  } = useReferenceData<Model>("models");

  // Upload Hook
  const { uploadFile, uploading } = useUpload();
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Form state — initialized from initialData when provided
  const [agentName, setAgentName] = useState(initialData?.agentName ?? "");
  const [callType, setCallType] = useState(initialData?.callType ?? "");
  const [language, setLanguage] = useState(initialData?.language ?? "");
  const [voice, setVoice] = useState(initialData?.voice ?? "");
  const [prompt, setPrompt] = useState(initialData?.prompt ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [latency, setLatency] = useState([initialData?.latency ?? 0.5]);
  const [speed, setSpeed] = useState([initialData?.speed ?? 110]);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [allowHangUp, setAllowHangUp] = useState(false);
  const [allowCallback, setAllowCallback] = useState(false);
  const [liveTransfer, setLiveTransfer] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);



  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(initialData?.serviceDescription ?? "");

  // Reference Data
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Call
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [calling, setCalling] = useState(false);
  type FormErrors = Partial<Record<keyof typeof REQUIRED_FIELDS, string>>;
  type TouchedFields = Partial<Record<keyof typeof REQUIRED_FIELDS, boolean>>;
  const [touched, setTouched] = useState<TouchedFields>({});
  const [errors, setErrors] = useState<FormErrors>({});

  // Unsaved changes: capture initial snapshot once, then compare current state
  type FormSnapshot = {
    agentName: string;
    description: string;
    callType: string;
    language: string;
    voice: string;
    prompt: string;
    model: string;
    latency: number;
    speed: number;
    callScript: string;
    serviceDescription: string;
    allowHangUp: boolean;
    allowCallback: boolean;
    liveTransfer: boolean;
    attachmentIds: string;
  };
  const getSnapshot = useCallback(
    (): FormSnapshot => ({
      agentName: agentName.trim(),
      description: description.trim(),
      callType,
      language,
      voice,
      prompt,
      model,
      latency: latency[0],
      speed: speed[0],
      callScript: callScript.trim(),
      serviceDescription: serviceDescription.trim(),
      allowHangUp,
      allowCallback,
      liveTransfer,
      attachmentIds: attachments.map((f) => f.id).sort().join(","),
    }),
    [
      agentName,
      description,
      callType,
      language,
      voice,
      prompt,
      model,
      latency,
      speed,
      callScript,
      serviceDescription,
      allowHangUp,
      allowCallback,
      liveTransfer,
      attachments,
    ]
  );
  const initialSnapshotRef = useRef<FormSnapshot | null>(null);
  useEffect(() => {
    if (initialSnapshotRef.current === null) {
      initialSnapshotRef.current = getSnapshot();
    }
  }, [getSnapshot]);

  const isDirty = (() => {
    const initial = initialSnapshotRef.current;
    if (!initial) return false;
    const current = getSnapshot();
    return (
      initial.agentName !== current.agentName ||
      initial.description !== current.description ||
      initial.callType !== current.callType ||
      initial.language !== current.language ||
      initial.voice !== current.voice ||
      initial.prompt !== current.prompt ||
      initial.model !== current.model ||
      initial.latency !== current.latency ||
      initial.speed !== current.speed ||
      initial.callScript !== current.callScript ||
      initial.serviceDescription !== current.serviceDescription ||
      initial.allowHangUp !== current.allowHangUp ||
      initial.allowCallback !== current.allowCallback ||
      initial.liveTransfer !== current.liveTransfer ||
      initial.attachmentIds !== current.attachmentIds
    );
  })();

  // Warn when navigating away in-app with unsaved changes (Swal). We do not use beforeunload
  // so the native "Leave site?" dialog never appears; Swal cannot run during reload/close.
  // In-app navigation (links, router) shows Swal. Reload/close tab will not warn.
  useEffect(() => {
    if (!isDirty) return;
    const nav = typeof window !== "undefined" ? (window as { navigation?: { addEventListener: (t: string, h: (e: { destination: { url: string }; preventDefault: () => void }) => void) => void; removeEventListener: (t: string, h: (e: unknown) => void) => void } }).navigation : undefined;
    if (!nav?.addEventListener) return;
    const handleNavigate = (e: { destination: { url: string }; preventDefault: () => void }) => {
      if (e.destination.url === window.location.href) return;
      e.preventDefault();
      void Swal.fire({
        title: "Leave without saving?",
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, leave",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = e.destination.url;
        }
      });
    };
    nav.addEventListener("navigate", handleNavigate);
    return () => nav.removeEventListener("navigate", handleNavigate as (e: unknown) => void);
  }, [isDirty]);

  // Badge counts for required fields
  const basicSettingsMissing = [agentName, callType, language, voice, prompt, model].filter(
    (v) => !v
  ).length;

  // File upload handlers
  const ACCEPTED_TYPES = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".csv",
    ".xlsx",
    ".xls",
  ];

  // Form validation
  const REQUIRED_FIELDS = {
    agentName: "Agent name is required",
    callType: "Call type is required",
    language: "Language is required",
    voice: "Voice is required",
    prompt: "Prompt is required",
    model: "Model is required",
  };


  // File upload handler
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      for (const file of Array.from(files)) {
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!ACCEPTED_TYPES.includes(ext)) continue;

        try {
          const uploaded = await uploadFile(file);
          setAttachments(prev => [...prev, uploaded]);
        } catch {
          // error handled in hook
        }
      }
    },
    [uploadFile]
  );

  const handleSave = async () => {
    const payload: AgentPayload = {
      name: agentName,
      description,
      callType,
      language,
      voice,
      prompt,
      model,
      latency: latency[0],
      speed: speed[0],
      callScript,
      serviceDescription,
      attachments: attachments.map(f => f.id),
      tools: {
        allowHangUp,
        allowCallback,
        liveTransfer,
      },
    };

    setSaving(true);
    try {
      if (mode === "create") {
        const { data } = await api.post("/agents", payload);
        setAgentId(data.id);
        void Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Agent created successfully!",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        initialSnapshotRef.current = getSnapshot();
      } else if (mode === "edit" && agentId) {
        await api.put(`/agents/${agentId}`, payload);
        void Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Agent updated successfully!",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        initialSnapshotRef.current = getSnapshot();
      }
    } catch (error) {
      // User-friendly error shown by api interceptor
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const getValidationErrors = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    if (!agentName.trim()) newErrors.agentName = REQUIRED_FIELDS.agentName;
    if (!callType) newErrors.callType = REQUIRED_FIELDS.callType;
    if (!language) newErrors.language = REQUIRED_FIELDS.language;
    if (!voice) newErrors.voice = REQUIRED_FIELDS.voice;
    if (!prompt) newErrors.prompt = REQUIRED_FIELDS.prompt;
    if (!model) newErrors.model = REQUIRED_FIELDS.model;
    return newErrors;
  }, [agentName, callType, language, voice, prompt, model]);

  // Keep errors in sync with current values so the Save button state and messages update when user fixes fields
  useEffect(() => {
    setErrors(getValidationErrors());
  }, [getValidationErrors]);

  const validateForm = (): boolean => {
    const newErrors = getValidationErrors();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      // Mark all required fields as touched so error messages show for every invalid field
      setTouched({
        agentName: true,
        callType: true,
        language: true,
        voice: true,
        prompt: true,
        model: true,
      });
      return false;
    }
    return true;
  };

  const handleTestCall = async () => {
    if (!agentId) {
      // If agent is not saved yet, save it first
      await handleSave();
      if (!agentId) {
        void Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Agent must be saved before test call.",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
        return;
      }
    }

    if (!testFirstName || !testLastName || !testPhone || !testGender) {
      void Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill all test call fields.",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      });
      return;
    }

    setCalling(true);
    try {
      const { data } = await api.post(`/agents/${agentId}/test-call`, {
        firstName: testFirstName,
        lastName: testLastName,
        gender: testGender,
        phoneNumber: testPhone,
      });

      if (data.success) {
        void Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Test call initiated (ID: ${data.callId})`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        void Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Test call failed to start.",
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      // User-friendly error shown by api interceptor
      console.error(error);
    } finally {
      setCalling(false);
    }
  };

  const removeFile = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, [setAttachments]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };



  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button onClick={() => { if (!validateForm()) return; handleSave(); }}
          disabled={saving}>
          {saving ? "Saving..." : saveLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <CollapsibleSection
            title="Basic Settings"
            description="Add some information about your agent to get started."
            badge={basicSettingsMissing}
            defaultOpen
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">
                  Agent Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="agent-name"
                  placeholder="e.g. Sales Assistant"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  onBlur={() =>
                    setTouched(prev => ({ ...prev, agentName: true }))
                  }
                />
                {errors.agentName && touched.agentName && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.agentName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describe what this agent does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

              </div>

              <div className="space-y-2">
                <Label>
                  Call Type <span className="text-destructive">*</span>
                </Label>
                <Select value={callType} onValueChange={(value) => {
                  setCallType(value);
                  setTouched(prev => ({ ...prev, callType: true }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound (Receive Calls)</SelectItem>
                    <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.callType && touched.callType && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.callType}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Language <span className="text-destructive">*</span>
                </Label>
                <Select value={language} onValueChange={(value) => {
                  setLanguage(value);
                  setTouched(prev => ({ ...prev, language: true }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.id} value={language.id}>
                        {language.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && touched.language && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.language}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Voice <span className="text-destructive">*</span>
                </Label>
                <Select value={voice} onValueChange={(value) => {
                  setVoice(value);
                  setTouched(prev => ({ ...prev, voice: true }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex items-center gap-2">
                          <span>{voice.name}</span>
                          <Badge variant="secondary">{voice.tag}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.voice && touched.voice && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.voice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Prompt <span className="text-destructive">*</span>
                </Label>
                <Select value={prompt} onValueChange={(value) => {
                  setPrompt(value);
                  setTouched(prev => ({ ...prev, prompt: true }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select prompt" />
                  </SelectTrigger>
                  <SelectContent>
                    {prompts.map((prompt) => (
                      <SelectItem key={prompt.id} value={prompt.id}>
                        {prompt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.prompt && touched.prompt && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.prompt}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Model <span className="text-destructive">*</span>
                </Label>
                <Select value={model} onValueChange={(value) => {
                  setModel(value);
                  setTouched(prev => ({ ...prev, model: true }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.model && touched.model && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.model}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latency ({latency[0].toFixed(1)}s)</Label>
                  <Slider
                    value={latency}
                    onValueChange={setLatency}
                    min={0.3}
                    max={1}
                    step={0.1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.3s</span>
                    <span>1.0s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Speed ({speed[0]}%)</Label>
                  <Slider
                    value={speed}
                    onValueChange={setSpeed}
                    min={90}
                    max={130}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>90%</span>
                    <span>130%</span>
                  </div>
                </div>
              </div>

            </div>
          </CollapsibleSection>

          {/* Section 2: Call Script */}
          <CollapsibleSection
            title="Call Script"
            description="What would you like the AI agent to say during the call?"
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Write your call script here..."
                value={callScript}
                onChange={(e) => setCallScript(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {callScript.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 4: Service/Product Description */}
          <CollapsibleSection
            title="Service/Product Description"
            description="Add a knowledge base about your service or product."
          >
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your service or product..."
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={6}
                maxLength={20000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {serviceDescription.length}/20000
              </p>
            </div>
          </CollapsibleSection>

          {/* Section 5: Reference Data */}
          <CollapsibleSection
            title="Reference Data"
            description="Enhance your agent's knowledge base with uploaded files."
          >
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">
                  Drag & drop files here, or{" "}
                  <button
                    type="button"
                    className="text-primary underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    browse
                  </button>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted: .pdf, .doc, .docx, .txt, .csv, .xlsx, .xls
                </p>
              </div>

              {/* File list */}
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm truncate">{f.fileName}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatFileSize(f.fileSize)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeFile(i)}
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

          {/* Section 6: Tools */}
          <CollapsibleSection
            title="Tools"
            description="Tools that allow the AI agent to perform call-handling actions and manage session control."
          >
            <FieldGroup className="w-full">
              <FieldLabel htmlFor="switch-hangup">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow hang up</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to hang up the call
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-hangup" checked={allowHangUp} onCheckedChange={setAllowHangUp} />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-callback">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Allow callback</FieldTitle>
                    <FieldDescription>
                      Select if you would like to allow the agent to make callbacks
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-callback" checked={allowCallback} onCheckedChange={setAllowCallback} />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="switch-transfer">
                <Field orientation="horizontal" className="items-center">
                  <FieldContent>
                    <FieldTitle>Live transfer</FieldTitle>
                    <FieldDescription>
                      Select if you want to transfer the call to a human agent
                    </FieldDescription>
                  </FieldContent>
                  <Switch id="switch-transfer" checked={liveTransfer} onCheckedChange={setLiveTransfer} />
                </Field>
              </FieldLabel>
            </FieldGroup>
          </CollapsibleSection>

        </div>

        {/* Right Column — Sticky Test Call Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Test Call
                </CardTitle>
                <CardDescription>
                  Make a test call to preview your agent. Each test call will
                  deduct credits from your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="test-first-name">First Name</Label>
                      <Input
                        id="test-first-name"
                        placeholder="John"
                        value={testFirstName}
                        onChange={(e) => setTestFirstName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="test-last-name">Last Name</Label>
                      <Input
                        id="test-last-name"
                        placeholder="Doe"
                        value={testLastName}
                        onChange={(e) => setTestLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={testGender} onValueChange={setTestGender}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test-phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <PhoneInput
                      defaultCountry="EG"
                      value={testPhone}
                      onChange={(value) => setTestPhone(value)}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <Button className="w-full" onClick={handleTestCall} disabled={calling}>
                    <Phone className="mr-2 h-4 w-4" />
                    {calling ? "Calling..." : "Start Test Call"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button onClick={() => { if (!validateForm()) return; handleSave(); }}
            disabled={saving}>
            {saving ? "Saving..." : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
