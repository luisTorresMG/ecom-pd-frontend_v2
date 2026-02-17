export class ProductsProfileModel {
  items: Array<{
    id: number;
    description: string;
  }>;

  constructor(payload?: any) {
    this.items = payload?.LIST_PROFILE.map((val: any) => ({
      id: +val.NIDPROFILE,
      description: val.SNAME
    })) || [];
  }
}
