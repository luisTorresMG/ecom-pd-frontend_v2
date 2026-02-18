declare var module: NodeModule;
interface NodeModule {
  id: string;
}

export {};
declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}
