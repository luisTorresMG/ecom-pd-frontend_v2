export class Logger {
  constructor(
    public nidprocess: number,
    public sfuncionality: string,
    public smetod: string,
    public sdata: string,
    public sresponse: string,
    public nsuccess: number,
    public dstartdate: Date,
    public denddate: Date,
    public nusercode: number,
    public nerrortype: number,
    public serrordes: string,
  ) { }
}
