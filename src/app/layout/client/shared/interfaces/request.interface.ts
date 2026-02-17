export interface Request {
  branchId: number;
  productId: number;
  channelCode: number;
  plate: string;
  stateId: number;
  userId: number;
  requestDetail: RequestDetail[];
  attachments: { documentType: number };
  file: File;
}

export interface RequestDetail {
  field: string;
  current: string;
  required: string;
}
