export interface ISessionAction {
  type: string;
  data: any;
  origin: 'eco-soat' | 'eco-vidaley' | 'eco-sctr' | 'platform';
}
