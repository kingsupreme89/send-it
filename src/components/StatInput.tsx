interface StatInputProps {
  label: string
  value: number
  onChange: (value: number) => void
}

export function StatInput({ label, value, onChange }: StatInputProps) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onFocus={(e) => e.target.select()}
        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--text)]"
      />
    </label>
  )
}
