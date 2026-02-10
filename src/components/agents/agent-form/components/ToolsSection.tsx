import { Dispatch, SetStateAction } from "react";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { CollapsibleSection } from "./CollapsibleSection";

interface ToolsSectionProps {
  allowHangUp: boolean;
  setAllowHangUp: Dispatch<SetStateAction<boolean>>;
  allowCallback: boolean;
  setAllowCallback: Dispatch<SetStateAction<boolean>>;
  liveTransfer: boolean;
  setLiveTransfer: Dispatch<SetStateAction<boolean>>;
}

export function ToolsSection({
  allowHangUp,
  setAllowHangUp,
  allowCallback,
  setAllowCallback,
  liveTransfer,
  setLiveTransfer,
}: ToolsSectionProps) {
  return (
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
            <Switch
              id="switch-hangup"
              checked={allowHangUp}
              onCheckedChange={setAllowHangUp}
            />
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
            <Switch
              id="switch-callback"
              checked={allowCallback}
              onCheckedChange={setAllowCallback}
            />
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
            <Switch
              id="switch-transfer"
              checked={liveTransfer}
              onCheckedChange={setLiveTransfer}
            />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </CollapsibleSection>
  );
}

