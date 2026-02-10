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

export interface AgentFormProps {
      mode: "create" | "edit";
      initialData?: AgentFormInitialData;
}

export interface AgentPayload {
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