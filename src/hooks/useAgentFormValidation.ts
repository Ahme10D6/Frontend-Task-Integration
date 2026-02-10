import { useCallback, useState } from "react";

interface ValidationConfig {
  agentName: string;
  model: string;
  callType: string;
  language: string;
  voice: string;
  prompt: string;
}

interface Errors {
  agentName?: string;
  model?: string;
  callType?: string;
  language?: string;
  voice?: string;
  prompt?: string;
}

interface Touched {
  agentName?: boolean;
  model?: boolean;
  callType?: boolean;
  language?: boolean;
  voice?: boolean;
  prompt?: boolean;
}
export const useAgentFormValidation = (values: ValidationConfig) => {
      const [errors, setErrors] = useState<Errors>({});
      const [touched, setTouched] = useState<Touched>({});
    
      const rules = {
        agentName: (v: string) => (!v.trim() ? "Agent name is required" : ""),
        model: (v: string) => (!v ? "Model is required" : ""),
        callType: (v: string) => (!v ? "Call type is required" : ""),
        language: (v: string) => (!v ? "Language is required" : ""),
        voice: (v: string) => (!v ? "Voice is required" : ""),
        prompt: (v: string) => (!v ? "Prompt is required" : ""),
      };
    
      const validateField = useCallback(
        (field: keyof ValidationConfig) => {
          if (!touched[field]) return true;
          const rule = rules[field];
          const value = values[field];
          const error = rule(value);
    
          setErrors(prev => ({
            ...prev,
            [field]: error,
          }));
    
          return !error;
        },
        [values, touched]
      );
    
      const validateForm = useCallback(() => {
        let isValid = true;
        const newErrors: Errors = {};
    
        (Object.keys(rules) as (keyof ValidationConfig)[]).forEach(field => {
          const error = rules[field](values[field]);
          if (error) {
            newErrors[field] = error;
            isValid = false;
          }
        });
    
        setErrors(newErrors);
    
        setTouched(
          Object.keys(rules).reduce((acc, key) => {
            acc[key as keyof Touched] = true;
            return acc;
          }, {} as Touched)
        );
    
        return isValid;
      }, [values]);
    
      const markTouched = (field: keyof ValidationConfig) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
      };
    
      return {
        errors,
        touched,
        validateField,
        validateForm,
        markTouched,
      };
    };
    