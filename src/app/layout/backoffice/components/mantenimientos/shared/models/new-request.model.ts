import * as moment from 'moment';

enum DocumentType {
  RUC = '2',
  DNI = '1',
  CE = '3'
}

export class ItemModel {
  id: string;
  name: string;

  /**
   * The constructor function for the Item class.
   * @param SITEM Set the id of the item
   * @param SDECRIPTION Set the name of the item
   * @return An object with the properties id and name
   */
  constructor({
    SITEM,
    SDECRIPTION
  }) {
    this.id = SITEM;
    this.name = SDECRIPTION;
  }
}

export class ChannelTypeModel {
  id: number;
  name: string;

  /**
   * The constructor function for the TypeChannel class.
   * @param NIDTYPECHANNEL Set the id of the channel
   * @param SDESCRIPTIONTYPECHANNEL Set the name of the channel
   * @return An object
   */
  constructor({
    NIDTYPECHANNEL,
    SDESCRIPTIONTYPECHANNEL
  }) {
    this.id = NIDTYPECHANNEL;
    this.name = SDESCRIPTIONTYPECHANNEL;
  }
}

export class SearchChannelInfo {
  distributionType: number;
  channelId: number;
  channelRequestId: number;
  request: string;
  legalName: string;
  stateDate: string;
  documentNumber: string;
  state: string;
  status: number;
  documentType: string;
  documentTypeDescription: string;
  tag: any;

  /**
   * @param NDISTRIBUTION Set the distributionid property of the object
   * @param NIDCHANNEL Get the channel name
   * @param NIDCHANNELREQUEST Get the channelrequestid
   * @param NREQUEST Create the request property
   * @param SCLIENTNAME Set the legalname property
   * @param SDATE Create the startdate property
   * @param SNUMDOC Create the documentnumber property
   * @param SSTATE Determine the state of the document
   * @param STATUS Determine the status of the document
   * @param STYPEDOC Set the documenttype property
   * @param TAG
   *
   * @return An object
   */
  constructor({
    NDISTRIBUTION,
    NIDCHANNEL,
    NIDCHANNELREQUEST,
    NREQUEST,
    SCLIENTNAME,
    SDATE,
    SNUMDOC,
    SSTATE,
    STATUS,
    STYPEDOC,
    TAG
  }) {
    this.distributionType = NDISTRIBUTION;
    this.channelId = NIDCHANNEL;
    this.channelRequestId = NIDCHANNELREQUEST;
    this.request = NREQUEST;
    this.legalName = SCLIENTNAME;
    this.stateDate = SDATE;
    this.documentNumber = SNUMDOC;
    this.state = SSTATE;
    this.status = STATUS;
    this.documentType = DocumentType[STYPEDOC];
    this.documentTypeDescription = STYPEDOC;
    this.tag = TAG;
  }
}

export class SearchChannelResponse {
  totalRows: number;
  items: SearchChannelInfo[];

  /**
   * @param ROWTOTAL Set the totalrows property of the class
   * @param entities Map the items to a new instance of SearchChannelInfo
   * @return An object with the following properties:
   */
  constructor({
    ROWTOTAL,
    entities
  }) {
    this.totalRows = ROWTOTAL;
    this.items = entities.map((item) => new SearchChannelInfo(item));
  }
}

export class RequestInfoResponse {
  startValidity: Date;
  endValidity: Date;
  distributionType: number;
  channelId: string;
  department: number;
  province: number;
  district: number;
  stockProvider: number;
  channelType: number;
  documentType: number;
  address: string;
  legalName: string;
  names: string;
  paternalSurname: string;
  maternalSurname: string;
  contact: string;
  email: string;
  documentNumber: string;
  phoneNumber: string;

  /**
   * @param DBEGINVALIDITY Set the startValidity property
   * @param DENDVALIDITY Set the endValidity property
   * @param NDISTRIBUTION Determine the type of distribution
   * @param NIDCHANNEL Identify the channel
   * @param NLOCAL Province ID
   * @param NMUNICIPALITY Store the district of the client
   * @param NPROVIDERSTOCK Indicate the provider of stock
   * @param NPROVINCE Department ID
   * @param NTYPECHANNEL Determine the type of channel
   * @param NTYPEDOC Determine the type of document
   * @param SADDRESS Set the address property
   * @param SCLIENTNAME Store the legal name of a company
   * @param SCONTACT Store the contact name
   * @param SLASTNAME Store the paternal surname of the client
   * @param SLASTNAME2 Store the maternal surname of the client
   * @param SMAIL Store the email address of the client
   * @param SNAME Store the names of the client
   * @param SNUMDOC Store the document number of the client
   * @param SPHONE Set the phone number of the client
   * @return An object with the same properties as the one passed in
   */
  constructor({
    DBEGINVALIDITY,
    DENDVALIDITY,
    NDISTRIBUTION,
    NIDCHANNEL,
    NLOCAL,
    NMUNICIPALITY,
    NPROVIDERSTOCK,
    NPROVINCE,
    NTYPECHANNEL,
    NTYPEDOC,
    SADDRESS,
    SCLIENTNAME,
    SCONTACT,
    SLASTNAME,
    SLASTNAME2,
    SMAIL,
    SNAME,
    SNUMDOC,
    SPHONE
  }) {
    this.startValidity = moment(DBEGINVALIDITY, 'MM/DD/YYYY').toDate();
    this.endValidity = moment(DENDVALIDITY, 'MM/DD/YYYY').toDate();
    this.distributionType = NDISTRIBUTION;
    this.channelId = NIDCHANNEL;
    this.department = NPROVINCE;
    this.province = NLOCAL;
    this.district = NMUNICIPALITY;
    this.stockProvider = NPROVIDERSTOCK;
    this.channelType = NTYPECHANNEL;
    this.documentType = NTYPEDOC;
    this.address = (SADDRESS ?? '').trim();
    this.legalName = (SCLIENTNAME ?? '').trim();
    this.names = (SNAME ?? '').trim();
    this.paternalSurname = (SLASTNAME ?? '').trim();
    this.maternalSurname = (SLASTNAME2 ?? '').trim();
    this.contact = (SCONTACT ?? '').trim();
    this.email = (SMAIL ?? '').trim();
    this.documentNumber = (SNUMDOC ?? '').trim();
    this.phoneNumber = (SPHONE ?? '').trim();
  }
}

export class StockInfo {
  policyType: string;
  maxStock: string;
  minStock: string;
  currentStock: string;

  /**
   * @param NTIPPOL Set the policyType property of the object
   * @param NSTOCKMAX Set the maxStock property of the object
   * @param NSTOCKMIN Set the minimum stock level for a product
   * @param NSTOCKCURRENT Set the current stock of a product
   * @return The object that it creates
   */
  constructor({
    NTIPPOL,
    NSTOCKMAX,
    NSTOCKMIN,
    NSTOCKCURRENT
  }) {
    this.policyType = NTIPPOL;
    this.maxStock = NSTOCKMAX;
    this.minStock = NSTOCKMIN;
    this.currentStock = NSTOCKCURRENT;
  }
}
