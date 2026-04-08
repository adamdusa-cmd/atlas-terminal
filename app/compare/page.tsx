'use client'
export default function ComparePage() {
  return (
    <iframe
      src="https://atlas-compare-production.up.railway.app"
      style={{ width:'100%', height:'calc(100vh - 48px)', border:'none', display:'block' }}
      allow="fullscreen"
    />
  )
}
