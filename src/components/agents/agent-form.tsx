"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useUpload } from "@/hooks/useUpload";
import type { Language, Voice, Prompt, Model } from "@/types/reference";
import type { Attachment } from "@/types/attachment";
import { ReferenceFilesSection } from "./agent-form/components/ReferenceFilesSection";
import { ACCEPTED_FILE_TYPES} from "@/lib/utils";
import {saveAgent,startTestCall,uploadFiles,removeAttachment} from "./agent-form/handlers";
import { useAgentFormValidation } from "../../hooks/useAgentFormValidation";
import { BasicSettingsSection } from "./agent-form/components/BasicSettingsSection";
import { CallScriptSection } from "./agent-form/components/CallScriptSection";
import { ServiceDescriptionSection } from "./agent-form/components/ServiceDescriptionSection";
import { ToolsSection } from "./agent-form/components/ToolsSection";
import { TestCallCard } from "./agent-form/components/TestCallCard";
import type { AgentFormProps, AgentPayload } from "@/types/agentForm";

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

  const {errors,touched,validateForm,markTouched,} = useAgentFormValidation({
    agentName,model,callType,language,voice,prompt,
  });

  // Call Script
  const [callScript, setCallScript] = useState(initialData?.callScript ?? "");

  // Service/Product Description
  const [serviceDescription, setServiceDescription] = useState(initialData?.serviceDescription ?? "");

  // Test Call
  const [testFirstName, setTestFirstName] = useState("");
  const [testLastName, setTestLastName] = useState("");
  const [testGender, setTestGender] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [calling, setCalling] = useState(false);

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

  // File upload handler
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      await uploadFiles({
        files,
        uploadFile,
        setAttachments,
        acceptedTypes: ACCEPTED_FILE_TYPES,
      });
    },
    [uploadFile]
  );
  
  const onSave = async () => {
    if (!validateForm()) return;
  
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
  
    await saveAgent({
      mode,
      agentId,
      payload,
      setAgentId,
      setSaving,
      onSaved: () => {
        initialSnapshotRef.current = getSnapshot();
      },
    });
  };
  
  const onTestCall = async () => {
    if (!agentId) {
      await onSave();
      if (!agentId) return;
    }
    await startTestCall({
      agentId,
      firstName: testFirstName,
      lastName: testLastName,
      gender: testGender,
      phone: testPhone,
      setCalling,
    });
  };
  
  const removeFile = (index: number) => {removeAttachment(index, setAttachments);};

  const heading = mode === "create" ? "Create Agent" : "Edit Agent";
  const saveLabel = mode === "create" ? "Save Agent" : "Save Changes";

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{heading}</h1>
        <Button onClick={onSave}
          disabled={saving || basicSettingsMissing > 0}>
          {saving ? "Saving..." : basicSettingsMissing > 0 ? "Please fill in all required fields" : saveLabel}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Collapsible Sections */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Section 1: Basic Settings */}
          <BasicSettingsSection
            agentName={agentName}
            setAgentName={setAgentName}
            description={description}
            setDescription={setDescription}
            callType={callType}
            setCallType={setCallType}
            language={language}
            setLanguage={setLanguage}
            voice={voice}
            setVoice={setVoice}
            prompt={prompt}
            setPrompt={setPrompt}
            model={model}
            setModel={setModel}
            latency={latency}
            setLatency={setLatency}
            speed={speed}
            setSpeed={setSpeed}
            languages={languages}
            languagesLoading={languagesLoading}
            voices={voices}
            voicesLoading={voicesLoading}
            prompts={prompts}
            promptsLoading={promptsLoading}
            models={models}
            modelsLoading={modelsLoading}
            errors={errors}
            touched={touched}
            markTouched={markTouched}
            basicSettingsMissing={basicSettingsMissing}
          />
          {/* Section 2: Call Script */}
          <CallScriptSection
            callScript={callScript}
            setCallScript={setCallScript}
          />
          {/* Section 4: Service/Product Description */}
          <ServiceDescriptionSection
            serviceDescription={serviceDescription}
            setServiceDescription={setServiceDescription}
          />
          {/* Section 5: Reference Data */}
          <ReferenceFilesSection
            attachments={attachments}
            uploading={uploading}
            onUpload={handleFiles}
            onRemove={removeFile}
          />
          {/* Section 6: Tools */}
          <ToolsSection
            allowHangUp={allowHangUp}
            setAllowHangUp={setAllowHangUp}
            allowCallback={allowCallback}
            setAllowCallback={setAllowCallback}
            liveTransfer={liveTransfer}
            setLiveTransfer={setLiveTransfer}
          />
        </div>

        {/* Right Column — Sticky Test Call Card */}
        <TestCallCard
          testFirstName={testFirstName}
          setTestFirstName={setTestFirstName}
          testLastName={testLastName}
          setTestLastName={setTestLastName}
          testGender={testGender}
          setTestGender={setTestGender}
          testPhone={testPhone}
          setTestPhone={setTestPhone}
          calling={calling}
          onTestCall={onTestCall}
        />
      </div>

      {/* Sticky bottom save bar */}
      <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-background px-6 py-4">
        <div className="flex justify-end">
          <Button onClick={onSave}
            disabled={saving || basicSettingsMissing > 0}>
            {saving ? "Saving..." : basicSettingsMissing > 0 ? "Please fill in all required fields" : saveLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
