export interface IAcordion {
  title: string;
  icon?: string;
  hasTemplate?: boolean;
  items: Array<{
    type: null | 'disc' | 'check';
    desc: string;
    weight: 'normal' | 'bold';
  }>;
}
