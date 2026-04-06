export interface RiskState {
  G: number; VPIN: number; entropy: number
  carry_score: number; credit_score: number
  position_scale: number; stop_pct: number
  cash_fraction: number; equity_fraction: number
  risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
  circuit_breaker: boolean; timestamp: string
}
export interface ParliamentState {
  verdict: string; score: number
  brain_weights: Record<string, number>
  brain_votes: Record<string, string>; timestamp: string
}
export interface Position {
  symbol: string; size: number
  entry_price?: number; current_price?: number
  pnl?: number; pnl_pct?: number; region?: string
}
export interface PortfolioState {
  positions: Position[]; cash_balance: number
  total_equity: number; daily_pnl: number
  daily_pnl_pct: number; total_pnl: number
  drawdown: number; mode: string; timestamp: string
}
export interface SignalState {
  layer_5a: Record<string, number>
  layer_5b: Record<string, number>
  layer_5c: Record<string, number>; timestamp: string
}
export interface SurfacesState {
  position_scale: number; stop_pct: number
  cash_fraction: number; equity_fraction: number
  risk_level: string; G: number; VPIN: number
  entropy: number; timestamp: string
}
export interface BriefState { brief: string; timestamp: string }
export interface StatusState {
  mode: string; is_live: boolean; circuit_breaker: boolean
  risk_level: string; session_start: string
  last_update: string; ws_connections: number
}
export interface ATLASSnapshot {
  risk: RiskState | null; parliament: ParliamentState | null
  portfolio: PortfolioState | null; signals: SignalState | null
  surfaces: SurfacesState | null; brief: BriefState | null
  status: StatusState | null
}
