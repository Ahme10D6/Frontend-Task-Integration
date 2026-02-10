import { Dispatch, SetStateAction } from "react";
import { Textarea } from "@/components/ui/textarea";
import { CollapsibleSection } from "./CollapsibleSection";

interface ServiceDescriptionSectionProps {
  serviceDescription: string;
  setServiceDescription: Dispatch<SetStateAction<string>>;
}

export function ServiceDescriptionSection({
  serviceDescription,
  setServiceDescription,
}: ServiceDescriptionSectionProps) {
  return (
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
  );
}

