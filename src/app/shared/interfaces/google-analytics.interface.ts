export interface IGoogleAnalytics {
  branchId: number;
  productId: number;
  sessionId?: string;
  processId: number;
  category: string;
  action: string;
  label: string;
  type: number;
  ammount: number;
}
