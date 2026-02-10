import { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { Language, Voice, Prompt, Model } from "@/types/reference";
import { CollapsibleSection } from "./CollapsibleSection";

interface BasicSettingsErrors {
  agentName?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
  model?: string;
}

interface BasicSettingsTouched {
  agentName?: boolean;
  callType?: boolean;
  language?: boolean;
  voice?: boolean;
  prompt?: boolean;
  model?: boolean;
}

interface BasicSettingsSectionProps {
  agentName: string;
  setAgentName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  callType: string;
  setCallType: Dispatch<SetStateAction<string>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  voice: string;
  setVoice: Dispatch<SetStateAction<string>>;
  prompt: string;
  setPrompt: Dispatch<SetStateAction<string>>;
  model: string;
  setModel: Dispatch<SetStateAction<string>>;
  latency: number[];
  setLatency: Dispatch<SetStateAction<number[]>>;
  speed: number[];
  setSpeed: Dispatch<SetStateAction<number[]>>;
  languages: Language[];
  languagesLoading: boolean;
  voices: Voice[];
  voicesLoading: boolean;
  prompts: Prompt[];
  promptsLoading: boolean;
  models: Model[];
  modelsLoading: boolean;
  errors: BasicSettingsErrors;
  touched: BasicSettingsTouched;
  markTouched: (field: keyof BasicSettingsErrors) => void;
  basicSettingsMissing: number;
}

export function BasicSettingsSection({
  agentName,
  setAgentName,
  description,
  setDescription,
  callType,
  setCallType,
  language,
  setLanguage,
  voice,
  setVoice,
  prompt,
  setPrompt,
  model,
  setModel,
  latency,
  setLatency,
  speed,
  setSpeed,
  languages,
  languagesLoading,
  voices,
  voicesLoading,
  prompts,
  promptsLoading,
  models,
  modelsLoading,
  errors,
  touched,
  markTouched,
  basicSettingsMissing,
}: BasicSettingsSectionProps) {
  return (
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
            onBlur={() => markTouched("agentName")}
          />
          {errors.agentName && touched.agentName && (
            <p className="text-xs text-destructive mt-1">{errors.agentName}</p>
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
          <Select
            value={callType}
            onValueChange={(value) => {
              setCallType(value);
              markTouched("callType");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select call type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">Inbound (Receive Calls)</SelectItem>
              <SelectItem value="outbound">Outbound (Make Calls)</SelectItem>
            </SelectContent>
          </Select>
          {errors.callType && touched.callType && (
            <p className="text-xs text-destructive mt-1">{errors.callType}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Language <span className="text-destructive">*</span>
          </Label>
          {languagesLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                markTouched("language");
              }}
            >
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
          )}
          {errors.language && touched.language && (
            <p className="text-xs text-destructive mt-1">{errors.language}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Voice <span className="text-destructive">*</span>
          </Label>
          {voicesLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={voice}
              onValueChange={(value) => {
                setVoice(value);
                markTouched("voice");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex items-center gap-2">
                      <span>{voice.name}</span>
                      <Badge variant="secondary">{voice.tag}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.voice && touched.voice && (
            <p className="text-xs text-destructive mt-1">{errors.voice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Prompt <span className="text-destructive">*</span>
          </Label>
          {promptsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={prompt}
              onValueChange={(value) => {
                setPrompt(value);
                markTouched("prompt");
              }}
            >
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
          )}
          {errors.prompt && touched.prompt && (
            <p className="text-xs text-destructive mt-1">{errors.prompt}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>
            Model <span className="text-destructive">*</span>
          </Label>
          {modelsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={model}
              onValueChange={(value) => {
                setModel(value);
                markTouched("model");
              }}
            >
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
          )}
          {errors.model && touched.model && (
            <p className="text-xs text-destructive mt-1">{errors.model}</p>
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
  );
}

