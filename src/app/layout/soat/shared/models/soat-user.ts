import { PrimaFilter } from '../../../client/shared/models/prima.model';
import { Selling } from '../interfaces/selling.interface';
import { Certificado } from '../../../client/shared/models/certificado.model';
import Rate from './rate';
import { isNullOrUndefined } from 'util';

export default class SoatUser {
  private _license: string;
  private _email: string;
  private _terms: boolean;
  private _soat_terms: boolean;
  private _carType: string;
  private _campaignId: number;
  private _brandId: string;
  private _brandDesc: string;
  private _usageId: string;
  private _usageDesc: string;
  private _modelId: string;
  private _modelEhId: string;
  private _modelIndex: number;
  private _modelDesc: string;
  private _modelInDesc: string;
  private _typeId: string;
  private _typeDesc: string;
  private _seats: number;
  private _serialNumber: string;
  private _soatDate: string;
  private _carYear: string;
  private _documentType: string;
  private _documentNumber: string;
  private _nidProcess: string;
  private _expDate: string;
  private _valid: string;
  private _soatExpDate: string;
  private _autoZone: string;
  private _autoZoneDesc: string;
  private _departmentId: string;
  private _address: string;
  private _district: string;
  private _districtName: string;
  private _lastName: string;
  private _name: string;
  private _phoneNumber: string;
  private _province: string;
  private _surname: string;
  private _legalName: string;
  private _clientNidProcess: string;
  private _policyNumber: string;
  private _privacy: boolean;
  private _tipoCliente: string;

  public get license(): string {
    return this._license;
  }

  public set license(value: string) {
    this._license = value.toUpperCase().trim();
  }

  public get email(): string {
    return this._email;
  }

  public set email(value: string) {
    this._email = value;
  }

  public get terms(): boolean {
    return this._terms;
  }
  public set terms(value: boolean) {
    this._terms = value;
  }
   public set soat_terms(value: boolean) {
    this._soat_terms = value;
  }
  public get soat_terms(): boolean {
    return this._soat_terms;
  }
  public get carType() {
    return this._carType;
  }

  public set carType(value) {
    this._carType = `${value}`;
  }

  public get campaignId(): number {
    return this._campaignId;
  }

  public set campaignId(value: number) {
    this._campaignId = value;
  }

  public get brandId(): string {
    return this._brandId;
  }

  public set brandId(value: string) {
    this._brandId = value;
  }

  public get usageId(): string {
    return this._usageId;
  }

  public set usageId(value: string) {
    this._usageId = value;
  }

  public get usageDesc(): string {
    return this._usageDesc;
  }

  public set usageDesc(value: string) {
    this._usageDesc = value.toUpperCase();
  }

  public get modelId(): string {
    return this._modelId;
  }

  public set modelId(value: string) {
    this._modelId = value;
  }

  public get modelIndex(): number {
    return this._modelIndex;
  }

  public set modelIndex(value: number) {
    this._modelIndex = value;
  }

  public get typeId(): string {
    return this._typeId;
  }

  public set typeId(value: string) {
    this._typeId = value;
  }

  public get typeDesc(): string {
    return this._typeDesc;
  }

  public set typeDesc(value: string) {
    this._typeDesc = value;
  }

  public get seats(): number {
    return this._seats;
  }

  public set seats(value: number) {
    this._seats = value;
  }

  public get serialNumber(): string {
    return this._serialNumber;
  }

  public set serialNumber(value: string) {
    this._serialNumber = value ? value.toUpperCase().trim() : null;
  }

  public get soatDate(): string {
    return this._soatDate;
  }

  public set soatDate(value: string) {
    this._soatDate = value;
  }

  public get carYear(): string {
    return this._carYear;
  }

  public set carYear(value: string) {
    this._carYear = value;
  }

  public get documentType(): string {
    return this._documentType;
  }

  public set documentType(value: string) {
    this._documentType = value;
  }

  public get documentNumber(): string {
    return this._documentNumber;
  }

  public set documentNumber(value: string) {
    this._documentNumber = value ? value.trim() : null;
  }

  public get nidProcess(): string {
    return this._nidProcess;
  }

  public set nidProcess(value: string) {
    this._nidProcess = value;
  }

  public get sTipoCliente(): string {
    return this._tipoCliente;
  }

  public set sTipoCliente(value: string) {
    this._tipoCliente = value;
  }

  public get expDate(): string {
    return this._expDate;
  }

  public set expDate(value: string) {
    this._expDate = value;
  }

  public get valid(): string {
    return this._valid;
  }

  public set valid(value: string) {
    this._valid = value;
  }

  public get soatExpDate(): string {
    return this._soatExpDate;
  }

  public set soatExpDate(value: string) {
    this._soatExpDate = value;
  }

  public get brandDesc(): string {
    return this._brandDesc;
  }

  public set brandDesc(value: string) {
    this._brandDesc = value;
  }

  public get modelDesc(): string {
    return this._modelDesc;
  }

  public set modelDesc(value: string) {
    this._modelDesc = value;
  }

  public get autoZone(): string {
    return this._autoZone;
  }

  public set autoZone(value: string) {
    this._autoZone = value;
  }

  public get autoZoneDesc(): string {
    return this._autoZoneDesc;
  }

  public set autoZoneDesc(value: string) {
    this._autoZoneDesc = value;
  }

  public get modelInDesc(): string {
    return this._modelInDesc;
  }

  public set modelInDesc(value: string) {
    this._modelInDesc = value;
  }

  public get departmentId(): string {
    return this._departmentId;
  }

  public set departmentId(value: string) {
    this._departmentId = value;
  }

  public get address(): string {
    return this._address;
  }

  public set address(value: string) {
    this._address = value;
  }

  public get district(): string {
    return this._district;
  }

  public set district(value: string) {
    this._district = value;
  }

  public get lastName(): string {
    return this._lastName;
  }

  public set lastName(value: string) {
    this._lastName = value;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public get phoneNumber(): string {
    return this._phoneNumber;
  }

  public set phoneNumber(value: string) {
    this._phoneNumber = value;
  }

  public get province(): string {
    return this._province;
  }

  public set province(value: string) {
    this._province = value;
  }

  public get surname(): string {
    return this._surname;
  }

  public set surname(value: string) {
    this._surname = value;
  }

  public get districtName(): string {
    return this._districtName;
  }

  public set districtName(value: string) {
    this._districtName = value;
  }

  public get modelEhId(): string {
    return this._modelEhId;
  }

  public set modelEhId(value: string) {
    this._modelEhId = value;
  }

  public get legalName(): string {
    return this._legalName;
  }

  public set legalName(value: string) {
    this._legalName = value;
  }

  public get clientNidProcess(): string {
    return this._clientNidProcess;
  }

  public set clientNidProcess(value: string) {
    this._clientNidProcess = value;
  }

  public get policyNumber(): string {
    return this._policyNumber;
  }

  public set policyNumber(value: string) {
    this._policyNumber = value;
  }

  public get privacy(): boolean {
    return this._privacy;
  }

  public set privacy(value: boolean) {
    this._privacy = value;
  }

  constructor(payload: any) {
    this.license = !isNullOrUndefined(payload._license) ? payload._license : '';
    this.email = !isNullOrUndefined(payload._email) ? payload._email : '';
    this.terms = !isNullOrUndefined(payload._terms) ? payload._terms : false;
    this.soat_terms = !isNullOrUndefined(payload._soat_terms) ? payload._soat_terms : false;
    this.carType = !isNullOrUndefined(payload._carType)
      ? payload._carType
      : '1';
    this.campaignId = !isNullOrUndefined(payload._campaignId)
      ? payload._campaignId
      : 0;
    this.brandId = !isNullOrUndefined(payload._brandId) ? payload._brandId : '';
    this.brandDesc = !isNullOrUndefined(payload._brandDesc)
      ? payload._brandDesc
      : '';
    this.usageId = !isNullOrUndefined(payload._usageId)
      ? payload._usageId
      : '1';
    this.usageDesc = !isNullOrUndefined(payload._usageDesc)
      ? payload._usageDesc
      : '';
    this.modelId = !isNullOrUndefined(payload._modelId) ? payload._modelId : '';
    this.modelIndex = !isNullOrUndefined(payload._modelIndex)
      ? payload._modelIndex
      : 0;
    this.modelDesc = !isNullOrUndefined(payload._modelDesc)
      ? payload._modelDesc
      : '';
    this.modelInDesc = !isNullOrUndefined(payload._modelInDesc)
      ? payload._modelInDesc
      : '';
    this.typeId = !isNullOrUndefined(payload._typeId) ? payload._typeId : '';
    this.typeDesc = !isNullOrUndefined(payload._typeDesc)
      ? payload._typeDesc
      : '';
    this.seats = !isNullOrUndefined(payload._seats) ? payload._seats : null;
    this.serialNumber = !isNullOrUndefined(payload._serialNumber)
      ? payload._serialNumber
      : '';
    this.soatDate = !isNullOrUndefined(payload._soatDate)
      ? payload._soatDate
      : '';
    this.carYear = !isNullOrUndefined(payload._carYear) ? payload._carYear : '';
    this.documentType = !isNullOrUndefined(payload._documentType)
      ? payload._documentType
      : '';
    this.documentNumber = !isNullOrUndefined(payload._documentNumber)
      ? payload._documentNumber
      : '';
    this.nidProcess = !isNullOrUndefined(payload._nidProcess)
      ? payload._nidProcess
      : null;
    this.expDate = !isNullOrUndefined(payload._expDate) ? payload._expDate : '';
    this.valid = !isNullOrUndefined(payload._valid) ? payload._valid : '';
    this.soatExpDate = !isNullOrUndefined(payload._soatExpDate)
      ? payload._soatExpDate
      : '';
    this.autoZone = !isNullOrUndefined(payload._autoZone)
      ? payload._autoZone
      : null;
    this.autoZoneDesc = !isNullOrUndefined(payload._autoZoneDesc)
      ? payload._autoZoneDesc
      : null;
    this.departmentId = !isNullOrUndefined(payload._departmentId)
      ? payload._departmentId
      : '';
    this.address = !isNullOrUndefined(payload._address) ? payload._address : '';
    this.district = !isNullOrUndefined(payload._district)
      ? payload._district
      : '';
    this.lastName = !isNullOrUndefined(payload._lastName)
      ? payload._lastName
      : '';
    this.name = !isNullOrUndefined(payload._name) ? payload._name : '';
    this.phoneNumber = !isNullOrUndefined(payload._phoneNumber)
      ? payload._phoneNumber
      : '';
    this.province = !isNullOrUndefined(payload._province)
      ? payload._province
      : '';
    this.surname = !isNullOrUndefined(payload._surname) ? payload._surname : '';
    this.districtName = !isNullOrUndefined(payload._districtName)
      ? payload._districtName
      : '';
    this.modelEhId = !isNullOrUndefined(payload._modelEhId)
      ? payload._modelEhId
      : '';
    this.legalName = !isNullOrUndefined(payload._legalName)
      ? payload._legalName
      : '';
    this.clientNidProcess = !isNullOrUndefined(payload._clientNidProcess)
      ? payload._clientNidProcess
      : '';
    this.policyNumber = !isNullOrUndefined(payload._policyNumber)
      ? payload._policyNumber
      : '';
    this.privacy = !isNullOrUndefined(payload._privacy)
      ? payload._privacy
      : false;
    this.sTipoCliente = !isNullOrUndefined(payload._tipoCliente)
      ? payload._tipoCliente
      : '';
  }

  getCarPayload() {
    return {
      p_NIDPROCESS: !isNullOrUndefined(this.nidProcess) ? this.nidProcess : 0,
      p_DEXPIRDAT: this.soatExpDate,
      p_NAUTOZONE: this.autoZone,
      p_NIDCLASE: this.typeId,
      p_NIDFLOW: '1', // Client
      p_NIDUSO: this.usageId,
      p_NREMINDER: '1', // Client
      p_NVEHBRAND: this.brandId,
      p_NVEHMAINMODEL: this.modelIndex,
      p_NVEHMODEL: this.modelEhId,
      p_NYEAR: this.carYear,
      p_SEATNUMBER: this.seats,
      p_SNAMECLASE: this.typeDesc,
      p_SNAME_AUTOZONE: this.autoZoneDesc,
      p_SNAME_USO: this.usageDesc,
      p_SNAME_VEHBRAND: this.brandDesc,
      p_SNAME_VEHMAINMODEL: this.modelInDesc,
      p_SNAME_VEHMODEL: this.modelDesc,
      p_SNUMSERIE: this.serialNumber,
      p_SREGIST: this.license,
      AceptaTerminos: this.terms,
      AceptaTerminosSoat: this.soat_terms,
      AceptaPrivacidad: this.privacy,
    };
  }

  getRatePayload(campaign, selling: Selling, validity: string) {
    let rateId = null;
    let client = null;

    if (this.documentType !== '') {
      client =
        this.padLeft(`${this.documentType}`, '0', 2) +
        this.padLeft(`${this.documentNumber}`, '0', 12);
    }

    if (Number(this.valid) === 1 && Number(campaign.valid) === 1) {
      rateId = campaign.planCampaign;
      client = campaign.canalClient;
    }

    const filter = new PrimaFilter();
    filter.IdProcess = this.nidProcess.toString();
    filter.TipoPapel = 3;
    filter.Plan = '0';
    filter.Moneda = 'PEN';
    filter.BrokerId = null;
    filter.IntermediaId = null;
    filter.SalesPointId = null;
    filter.TarifaId = rateId;
    filter.UsoId = this.usageId;
    filter.ClaseId = this.typeId;
    filter.MarcaId = this.brandId;
    filter.ModeloId = this.modelIndex.toString();
    filter.CantidadAsientos = this.seats.toString();
    filter.Placa = this.license;
    if (this.documentType) {
      filter.Cliente = client;
    }
    filter.Departamento = !isNullOrUndefined(this.district)
      ? this.padLeft(this.district.toString(), '0', 6)
      : '150101';
    filter.TipoPersona = this.getUserType();

    filter.Canal = selling.sellingChannel;
    filter.PuntoVenta = selling.sellingPoint;

    filter.Fecha = validity;
    filter.Carroceria = '1';
    filter.CategoriaId = '1';
    filter.IsPd = true;

    return filter;
  }

  getClientPayload() {
    const tipoPersona = this.getUserType();
    let nombre = this.name;
    let apellidoPaterno = this.lastName;
    let apellidoMaterno = this.surname;
    let razonSocial = '';
    if (tipoPersona === '2') {
      razonSocial = this.legalName;
      nombre = '';
      apellidoPaterno = '';
      apellidoMaterno = '';
    } else if (tipoPersona === '1' && this.documentType === '1') {
      razonSocial = this.lastName + ' ' + this.surname + ' ' + this.name;
    }
    return {
      p_NPERSON_TYP: tipoPersona,
      p_NDOCUMENT_TYP: this.documentType,
      p_SDOCUMENT: this.documentNumber,
      p_SLEGALNAME: razonSocial,
      p_SCLIENT_NAME: nombre,
      p_SCLIENT_APPPAT: apellidoPaterno,
      p_SCLIENT_APPMAT: apellidoMaterno,
      p_NPROVINCE: this.departmentId,
      p_NLOCAT: this.province,
      p_NMUNICIPALITY: this.district,
      p_SADDRESS: this.address.toUpperCase(),
      p_SMAIL: this.email,
      p_SPHONE: this.phoneNumber,
      p_NIDPROCESS: this.nidProcess,
      v_CONTRATANTE: {
        p_NPERSON_TYP: this.getUserType(),
        p_NDOCUMENT_TYP: this.documentType,
        p_SDOCUMENT: this.documentNumber,
        p_SLEGALNAME: razonSocial,
        p_SCLIENT_NAME: nombre,
        p_SCLIENT_APPPAT: apellidoPaterno,
        p_SCLIENT_APPMAT: apellidoMaterno,
        p_NPROVINCE: this.departmentId,
        p_NLOCAT: this.province,
        p_NMUNICIPALITY: this.district,
        p_SADDRESS: this.address.toUpperCase(),
        p_SMAIL: this.email,
        p_SPHONE: this.phoneNumber,
        p_NIDPROCESS: this.nidProcess,
      },
      p_NFACTURA: 1,
      V_NIDPROCESS: this.nidProcess,
    };
  }

  getClientBillPayload(contractor) {
    // let name = contractor.name;
    // if (contractor.documentType === '1') {
    //   contractor.legalName = contractor.name;
    //   name = '';
    // }

    return {
      ...this.getClientPayload(),
      v_CONTRATANTE: {
        p_NPERSON_TYP: this.getUserType.bind(contractor)(),
        p_NDOCUMENT_TYP: contractor.documentType,
        p_SDOCUMENT: contractor.documentNumber,
        p_SLEGALNAME: contractor.legalName,
        p_SCLIENT_NAME: contractor.name,
        p_SCLIENT_APPPAT: !isNullOrUndefined(contractor.lastName)
          ? contractor.lastName
          : '',
        p_SCLIENT_APPMAT: !isNullOrUndefined(contractor.surname)
          ? contractor.surname
          : '',
        p_NPROVINCE: contractor.department,
        p_NLOCAT: contractor.province,
        p_NMUNICIPALITY: contractor.district,
        p_SADDRESS: contractor.address.toUpperCase(),
        p_SMAIL: contractor.email,
        p_SPHONE: contractor.phoneNumber,
        p_NIDPROCESS: this.nidProcess,
      },
    };
  }

  getCertificatePayload(rate: Rate, campaign, selling: Selling, ref) {
    const certificado = new Certificado();

    certificado.P_NIDPROCESS = `${this.clientNidProcess}`;
    certificado.P_NPOLICY = this.policyNumber;
    certificado.P_DSTARTDATE = this.soatDate.split('/').reverse().join('-');
    certificado.P_NPREMIUM = rate.precio;
    certificado.P_NCOMMISSION = 0;

    certificado.P_IDTARIFARIO = rate.id;
    certificado.P_DESCRIPTARIFARIO = rate.descripcion;
    certificado.P_NCOMISSION_BROK = rate.comisionBroker;
    certificado.P_NCOMISSION_INTERM = rate.comisionIntermediario;
    certificado.P_NCOMISSION_SPOINT = rate.comisionPuntoVenta;
    certificado.P_NTIPOPAPEL = 3;

    certificado.P_NPLAN = 0;
    certificado.P_NIDCAMPAIGN = 0;

    if (this.valid === '1' && campaign.valid === '1') {
      certificado.P_NIDCAMPAIGN = this.campaignId;
    }

    certificado.P_NCODCHANNEL_BO = selling.sellingChannel;
    certificado.P_NCODNUMPOINT_BO = selling.sellingPoint;

    if (ref.referenteOrigenPublicidad === '1') {
      certificado.P_CHANNELEXTERNAL = 1;
      certificado.P_NCODCHANNEL_BO = ref.referenteCanal;
      certificado.P_NCODNUMPOINT_BO = ref.referentePuntoVenta;
      certificado.P_SDESCHANNEL_BO = ref.referenteDesCanal?.trim();
      certificado.P_SDESNUMPOINT_BO = ref.referenteDesPuntoVenta;
      certificado.P_NTYPECHANNEL_BO = ref.referenteTipoCanal;
    }

    certificado.IsPD = true;

    return certificado;
  }

  getCouponPayload(campaign, selling: Selling, ref, coupon: string) {
    const rawFilter = this.getRatePayload(campaign, selling, this.soatDate);

    return {
      IdProcess: rawFilter.IdProcess,
      CantidadAsientos: rawFilter.CantidadAsientos,
      Carroceria: '1',
      CategoriaId: '1',
      ClaseId: rawFilter.ClaseId,
      Departamento: this.departmentId,
      Fecha: rawFilter.Fecha.split('/').reverse().join('-'),
      MarcaId: rawFilter.MarcaId,
      ModeloId: Number(rawFilter.ModeloId),
      Plan: Number(rawFilter.Plan),
      TipoPersona: rawFilter.TipoPersona,
      UsoId: Number(rawFilter.UsoId),
      Code: ref.referenteCode,
      puntoVenta: ref.referentePuntoVenta,
      Coupon: coupon,
      Documento: this.documentNumber,
      TipoDocumento: this.documentType,
    };
  }

  mergeValues(payload) {
    this.license = this.setMemoryValue(this.license, payload.p_SREGIST);
    this.brandId = this.setMemoryValue(this.brandId, payload.p_NVEHBRAND);
    this.modelDesc = this.setMemoryValue(
      this.modelDesc,
      payload.p_SNAME_VEHMODEL
    );
    this.modelEhId = this.setMemoryValue(this.modelEhId, payload.p_NVEHMODEL);
    this.modelIndex = this.setMemoryValue(
      this.modelIndex,
      payload.p_NVEHMAINMODEL
    );
    this.seats = this.setMemoryValue(this.seats, payload.p_SEATNUMBER);
    this.serialNumber = this.setMemoryValue(
      this.serialNumber,
      payload.p_SNUMSERIE
    );

    this.soatDate = this.setMemoryValue(this.soatDate, payload.p_DEXPIRDAT);
    this.typeId = this.setMemoryValue(this.typeId, payload.p_NIDCLASE);
    this.usageId = this.setMemoryValue(this.usageId, payload.p_NIDUSO);
    this.carYear = this.setMemoryValue(this.carYear, payload.p_NYEAR);
    this.usageDesc = this.setMemoryValue(this.usageDesc, payload.p_SNAME_USO);
    this.typeDesc = this.setMemoryValue(this.typeDesc, payload.p_SNAMECLASE);
    this.brandDesc = this.setMemoryValue(
      this.brandDesc,
      payload.p_SNAME_VEHBRAND
    );
    this.documentType = this.setMemoryValue(
      this.documentType,
      payload.p_CLIENTE.p_NDOCUMENT_TYP
    );
    this.documentNumber = this.setMemoryValue(
      this.documentNumber,
      payload.p_CLIENTE.p_SDOCUMENT
    );
    this.departmentId = this.setMemoryValue(
      this.departmentId,
      payload.p_CLIENTE.p_NPROVINCE
    );
    this.address = this.setMemoryValue(
      this.address,
      payload.p_CLIENTE.p_SADDRESS
    );
    this.district = this.setMemoryValue(
      this.district,
      payload.p_CLIENTE.p_NMUNICIPALITY
    );
    this.lastName = this.setMemoryValue(
      this.lastName,
      payload.p_CLIENTE.p_SCLIENT_APPPAT
    );
    this.phoneNumber = this.setMemoryValue(
      this.phoneNumber,
      payload.p_CLIENTE.p_SPHONE
    );
    this.province = this.setMemoryValue(
      this.province,
      payload.p_CLIENTE.p_NLOCAT
    );
    this.surname = this.setMemoryValue(
      this.surname,
      payload.p_CLIENTE.p_SCLIENT_APPMAT
    );
    this.name = this.setMemoryValue(
      this.name,
      payload.p_CLIENTE.p_SCLIENT_NAME
    );
    this.legalName = this.setMemoryValue(
      this.legalName,
      payload.p_CLIENTE.p_SLEGALNAME
    );
  }

  private padLeft(text: string, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr(size * -1, size);
  }

  private getUserType() {
    let userType = '1';

    if (
      Number(this.documentType) === 1 &&
      `${this.documentNumber}`.substr(0, 2) === '20'
    ) {
      userType = '2';
    }

    return userType;
  }

  private setMemoryValue(soatVal, val) {
    return isNullOrUndefined(soatVal) || soatVal === '0' || soatVal === ''
      ? val
      : soatVal;
  }
}
