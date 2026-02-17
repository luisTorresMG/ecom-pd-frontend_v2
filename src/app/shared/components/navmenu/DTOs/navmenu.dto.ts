export interface NavMenuDto {
  nuserregister: number;
  nidresource: number;
  sname: string;
  sdescription: string;
  shtml: string;
  sstate: string;
  children: {
    nidresource: number;
    sname: string;
    sdescription: string;
    shtml: string;
    sstate: string;
    children: {
      nidresource: number;
      sname: string;
      sdescription: string;
      sstate: string;
      stag: string;
    }[];
  }[];
}
