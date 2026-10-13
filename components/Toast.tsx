"use client";
import { useEffect } from "react";

export function Toast({ message, type, onDone }: { message: string; type: "success" | "error"; onDone: () => void }) {
  const visibleMessage = message?.trim() || (type === "error" ? "Request failed. Please try again." : "Done.");
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div role={type === "error" ? "alert" : "status"} className={`fixed bottom-4 right-4 z-50 max-w-[min(90vw,32rem)] px-4 py-3 rounded-lg shadow-lg text-sm text-white
      ${type === "success" ? "bg-green-600" : "bg-red-600"}`}>
      {visibleMessage}
    </div>
  );
}
export function Spinner() {
  return (
    <div className="flex justify-center items-center py-10" aria-label="Loading">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
