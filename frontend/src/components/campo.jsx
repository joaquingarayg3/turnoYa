// Input con su label y su mensaje de error, para usar con React Hook Form:
//   <Campo id="email" label="Email" type="email" error={errors.email} {...register("email")} />
// En React 19 "ref" llega como prop comun, asi que register() funciona directo.
export default function Campo({ id, label, error, ayuda, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? "true" : "false"}
        className={`w-full rounded-lg border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ya ${
          error ? "border-red-600" : "border-borde"
        }`}
        {...props}
      />
      {ayuda && !error && <p className="mt-1 text-xs text-pizarra">{ayuda}</p>}
      {error && <p className="mt-1 text-sm text-red-700">{error.message}</p>}
    </div>
  )
}
