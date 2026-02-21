"use client";

export default function Input({
  label,
  register,
  name,
  error,
  type = "text",
  registerOptions = {},
  ...rest
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <input
        type={type}
        {...register(name, registerOptions)}
        {...rest}
        className={`w-full rounded-md border px-3 py-2.5 text-sm
        transition outline-none bg-white
        ${
          error
            ? "border-red-400 focus:ring-2 focus:ring-red-300"
            : "border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        }`}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
}
