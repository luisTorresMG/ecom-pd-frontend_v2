export interface IMoreInfo {
  background: string;
  icon: string;
  title: string;
  descriptions: Array<string>;
  url: string;
  items: Array<{
    img: string;
    icon: string;
    description: string;
    url: string;
  }>;
}
