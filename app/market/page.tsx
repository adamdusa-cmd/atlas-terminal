'use client'
export default function MarketPage() {
  return (
    <iframe
      src="https://atlas-market-production.up.railway.app"
      style={{ width:'100%', height:'calc(100vh - 48px)', border:'none', display:'block' }}
      allow="fullscreen"
    />
  )
}
