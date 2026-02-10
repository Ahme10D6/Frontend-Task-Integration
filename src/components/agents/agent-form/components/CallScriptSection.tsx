import { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSection } from "./CollapsibleSection";

interface CallScriptSectionProps {
  callScript: string;
  setCallScript: Dispatch<SetStateAction<string>>;
}

export function CallScriptSection({ callScript, setCallScript }: CallScriptSectionProps) {
  return (
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
  );
}

