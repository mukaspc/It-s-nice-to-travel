import { useToast } from "./use-toast";
import { cn } from "../../lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-white rounded-lg shadow-lg p-4 transition-all duration-300 transform",
            toast.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
            toast.variant === "destructive" && "bg-red-50 border-l-4 border-red-500"
          )}
        >
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className={cn(
                "text-sm font-medium",
                toast.variant === "destructive" ? "text-red-800" : "text-gray-900"
              )}>
                {toast.title}
              </h3>
              <p className={cn(
                "mt-1 text-sm",
                toast.variant === "destructive" ? "text-red-700" : "text-gray-500"
              )}>
                {toast.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 