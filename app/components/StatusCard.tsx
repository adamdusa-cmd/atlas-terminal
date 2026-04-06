'use client'
interface Props { label: string; value: string | number; sub?: string; colorClass?: string; size?: 'sm'|'md'|'lg' }

export default function StatusCard({ label, value, sub, colorClass, size='md' }: Props) {
  const fs = size === 'lg' ? 24 : size === 'md' ? 18 : 14
  return (
    <div className="atlas-card" style={{ minWidth:100 }}>
      <div className="atlas-label" style={{ marginBottom:4 }}>{label}</div>
      <div className={`atlas-value ${colorClass||''}`} style={{ fontSize:fs }}>{value}</div>
      {sub && <div className="atlas-label" style={{ marginTop:2 }}>{sub}</div>}
    </div>
  )
}
