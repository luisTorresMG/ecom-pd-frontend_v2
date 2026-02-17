import { DatosContratanteDto } from '../../shared/datos-contratante/DTOs/datos-contratante.dto';
import { DatosVehiculoDto } from '../../shared/datos-vehiculo/DTOs/datos-vehiculo.dto';
import { DataPolizaDto } from '../../shared/datos-poliza/DTOs/datos-poliza.dto';
export class AnularCertificadoDto {
  poliza: DataPolizaDto;
  vehiculo: DatosVehiculoDto;
  contratante: DatosContratanteDto;
}
