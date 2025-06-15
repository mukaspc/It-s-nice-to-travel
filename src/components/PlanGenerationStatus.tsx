import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface GenerationStatus {
  status: "processing" | "completed" | "failed";
  estimated_time_remaining?: number;
}

interface Props {
  planId: string;
}

export function PlanGenerationStatus({ planId }: Props) {
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const eventSource = new EventSource(`/api/plans/${planId}/status?sse=true`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        setError(data.error);
        eventSource.close();
        return;
      }

      setStatus(data);

      if (data.status === "completed") {
        eventSource.close();
        navigate(`/plans/${planId}/view`);
      } else if (data.status === "failed") {
        eventSource.close();
        setError("Generation failed. Please try again.");
      }
    };

    eventSource.onerror = () => {
      setError("Connection lost. Please refresh the page.");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [planId, navigate]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="p-4">
        <p>Initializing generation...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{
              width:
                status.status === "completed"
                  ? "100%"
                  : status.estimated_time_remaining
                    ? `${Math.max(0, 100 - (status.estimated_time_remaining / 120) * 100)}%`
                    : "0%",
            }}
          />
        </div>
      </div>
      <p className="text-gray-600">
        {status.status === "processing" && (
          <>
            Generating your travel plan...
            {status.estimated_time_remaining && (
              <span> (about {Math.ceil(status.estimated_time_remaining / 60)} minutes remaining)</span>
            )}
          </>
        )}
        {status.status === "completed" && "Generation completed!"}
        {status.status === "failed" && "Generation failed. Please try again."}
      </p>
    </div>
  );
}
