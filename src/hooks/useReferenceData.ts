import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useReferenceData<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    api
      .get(endpoint)
      .then(res => {
        if (mounted) setData(res.data);
      })
      .catch(() => {
        if (mounted) setError("Failed to load data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [endpoint]);

  return { data, loading, error };
}
