import { BeneficiarioDto } from './beneficiario.model';
import { AseguradoDto } from './asegurado.model';
export class ValidateQuotationRequest {
  idProcess: number;
  idCategoria: number;
  asegurados?: Array<AseguradoDto>;
  beneficiarios?: Array<BeneficiarioDto>;
  prima: number;
  fileAttach?: File;
}
