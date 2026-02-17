export class ProfilesOfType {
  items: Array<{
    id: number;
    description: string;
  }>;

  constructor(payload?: any) {
    this.items = payload?.PA_SEL_PROFILE.map((val: any) => ({
      id: val.NIDPROFILE,
      description: val.SNAME
    }));
  }
}
