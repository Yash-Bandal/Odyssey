import React from "react";

export default function ToggleItem({ id, label, checked, onChange, disabled }) {
    return (
        <label htmlFor={id} className={`group flex items-center gap-4 p-3 rounded-xl transition-shadow duration-150 ${disabled ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:bg-white/60"}`}>
            <input id={id} type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
            <span aria-hidden className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors duration-150 ${checked ? "bg-green-500" : "bg-gray-200"}`}>
                <span className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-150 ${checked ? "translate-x-6" : "translate-x-0"}`} />
            </span>
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-semibold truncate ${checked ? "text-green-800" : "text-gray-800"}`}>{label}</div>
                <div className="text-xs text-gray-400">Tap to mark complete</div>
            </div>
            <div className="flex-shrink-0">
                {checked ? (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">✓ Done</span>
                ) : (
                    <span className="text-xs text-gray-400">Not yet</span>
                )}
            </div>
        </label>
    );
}
