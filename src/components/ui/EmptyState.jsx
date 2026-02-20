"use client";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full py-12">
      {Icon && <Icon className="w-10 h-10 text-gray-300 mb-4" />}

      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>

      {description && (
        <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
