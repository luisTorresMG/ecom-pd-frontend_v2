export function replaceArgField(value: string, type: string) {
  const listTypes = ['0', '2'];
  let nextValue = value;
  if (listTypes.includes(`${type}`)) {
    nextValue = value?.replace(`'`, '`').replace(`'`, '`') || null;
  }

  return nextValue;
}

export function replaceArgFieldReverse(value: string, type: string) {
  const listTypes = ['0', '2'];
  let nextValue = value;
  if (listTypes.includes(`${type}`)) {
    nextValue = value?.replace('`', `'`).replace('`', `'`) || null;
  }

  return nextValue;
}

export class SavePlotConfigurationModel {
  idEstructura?: number;
  ramo: number;
  producto: number;
  descripcion: string;
  tipoArchivo: number;
  filaInicio: number;
  columnaInicio: number;
  aplicaCabecera: number;
  indicePestaña: number;
  formatoFecha: string;
  delimitador: string;
  aplicaReniec: number;
  usuario: number;

  argumentos: Array<{
    idArgumentoGeneral?: number;
    argumentoGeneral: string;
    idTipoDato: number;
    valorPorDefecto: string;
  }>;

  lectura: Array<{
    idCampo?: number;
    campo: string;
    idTipoDato: number;
    obligatorio: 1 | 0;
    valorUnico: 1 | 0;
    idCampoDestino: number;
    idFuncion: number;
    idParametro: number;
    idTipoValor: number;
    valor: string;
    numeroOrden: number;
  }>;

  salida: Array<{
    idCampo?: number;
    campo: string;
    idTipoDato: number;
    idTipoValor: number;
    valorCampo: number;
    idFuncion: number;
    idParametro: number;
    valor: string;
    idTipoValorCampo: number;
    numeroOrden: number;
  }>;

  constructor(payload: any) {
    this.idEstructura = +payload?.structureId || null;
    this.ramo = +payload.structure.branch;
    this.producto = +payload.structure.product;
    this.descripcion = payload.structure.description;
    this.tipoArchivo = +payload.structure.fileType;
    this.filaInicio = +payload.structure.startRow;
    this.columnaInicio = +payload.structure.startColumn;
    this.aplicaCabecera = +payload.structure.hasHeader;
    this.indicePestaña = +payload.structure.tabIndex;
    this.formatoFecha = payload.structure.dateFormat;
    this.delimitador = payload.structure.separator;
    this.aplicaReniec = payload.structure.reniecApply;
    this.usuario = payload.codigoUsuario;

    this.argumentos = payload.arguments.map((value: any) => ({
      idArgumentoGeneral: +value?.argumentId || null,
      argumentoGeneral: value.name,
      idTipoDato: +value.dataType || null,
      valorPorDefecto: value.defaultValue,
    }));

    this.lectura = payload.fields.map((value: any) => ({
      idCampo: +value?.fieldId || null,
      campo: value.inputData,
      idTipoDato: +value.dataType,
      obligatorio: value.required ? 1 : 0,
      valorUnico: value.uniqueValue ? 1 : 0,
      idCampoDestino: +value.targetField || null,
      idFuncion: +value.type || null,
      idParametro: +value.parameter || null,
      idTipoValor: +value.parameterType ?? null,
      valor: replaceArgFieldReverse(value.detail, value.parameterType),
      numeroOrden: value.numeroOrden,
    }));

    this.salida = payload.outputFields.map((value: any) => ({
      idCampo: +value?.fieldId || null,
      campo: value.outputData,
      idTipoDato: +value.dataTypeField,
      idTipoValorCampo: +value.valueTypeField ?? null,
      valorCampo: replaceArgFieldReverse(
        value.fieldValue,
        value.valueTypeField
      ),
      idFuncion: +value.functionType || null,
      idParametro: +value.functionParameter || null,
      idTipoValor: +value.valueTypeParameter || null,
      valor: replaceArgFieldReverse(value.parameterValue, value.valueTypeField),
      numeroOrden: value.numeroOrden,
    }));
  }
}

export class TransformPlotDetailConfigurationModel {
  structure: StructureModel;
  arguments: Array<ArgumentModel>;
  read: Array<ReadingFieldModel>;
  output: Array<OutputFieldModel>;
  constructor(payload: any) {
    this.structure = new StructureModel(payload.estructura);
    this.arguments = payload.argumentos.map((arg) => new ArgumentModel(arg));

    const objReadField = {};
    const objReadFunction = {};

    this.read = payload.lectura.filter((x) =>
      objReadField[x.numeroOrden] ? false : (objReadField[x.numeroOrden] = true)
    );

    this.read = this.read.map((item: any) => ({
      index: item.numeroOrden,
      fieldId: item.idCampo,
      inputData: item.campo,
      dataType: +item.idTipoDato || null,
      targetField: +item.idCampoDestino || null,
      required: +item.obligatorio == 1,
      uniqueValue: +item.valorUnico == 1,
      functions: payload.lectura
        .filter((x) => x.numeroOrden == item.numeroOrden && item.idFuncion)
        .filter((x) =>
          objReadFunction[`${item.numeroOrden}${x.idFuncion}`]
            ? false
            : (objReadFunction[`${item.numeroOrden}${x.idFuncion}`] = true)
        )
        .map((funct: any) => ({
          type: +funct.idFuncion,
          parameters: payload.lectura
            .filter(
              (x) =>
                x.numeroOrden == funct.numeroOrden &&
                funct.idFuncion == x.idFuncion &&
                funct.idFuncion &&
                funct.idParametro
            )
            .map((x) => ({
              parameter: x.idParametro,
              parameterType: x.idTipoValor,
              detail: replaceArgField(x.valor, x.idTipoValor),
            })),
        })),
    }));

    const objOutputField = {};
    const objOutputFunction = {};

    this.output = payload.salida.filter((x) =>
      objOutputField[x.numeroOrden]
        ? false
        : (objOutputField[x.numeroOrden] = true)
    );

    this.output = this.output.map((item: any) => ({
      fieldId: item.idCampo,
      index: item.numeroOrden,
      outputData: item.campo,
      dataTypeField: +item.idTipoDato || null,
      valueTypeField: item.idTipoValorCampo,
      fieldValue: replaceArgField(item.valorCampo, item.idTipoValorCampo),
      functions: payload.salida
        .filter((x) => x.numeroOrden == item.numeroOrden && item.idFuncion)
        .filter((x) =>
          objOutputFunction[`${item.numeroOrden}${x.idFuncion}`]
            ? false
            : (objOutputFunction[`${item.numeroOrden}${x.idFuncion}`] = true)
        )
        .map((funct: any) => ({
          functionType: +funct.idFuncion,
          parameters: payload.salida
            .filter(
              (x) =>
                x.numeroOrden == funct.numeroOrden &&
                funct.idFuncion == x.idFuncion &&
                funct.idFuncion &&
                funct.idParametro
            )
            .map((x) => ({
              functionParameter: x.idParametro,
              valueTypeParameter: +x.idTipoValor,
              parameterValue: replaceArgField(x.valor, item.idTipoValor),
            })),
        })),
    }));
  }
}

export class StructureModel {
  description: string;
  branch: number;
  product: number;
  fileType: number;
  startRow: string;
  startColumn: string;
  reniecApply: number;
  hasHeader: number;
  tabIndex: number;
  dateFormat: string;
  separator: string;

  constructor(payload) {
    this.description = payload?.estructura ?? null;
    this.branch = payload?.idRamo ?? null;
    this.product = payload?.idProducto ?? null;
    this.fileType = payload?.idTipoArchivo ?? null;
    this.startRow = payload?.filaInicio ?? null;
    this.startColumn = payload?.columnaInicio ?? null;
    this.reniecApply = payload?.aplicaReniec ?? null;
    this.hasHeader = payload?.tieneCabecera ?? null;
    this.tabIndex = payload?.indiceTab ?? null;
    this.dateFormat = payload?.formatoFecha ?? null;
    this.separator = payload?.separador ?? null;
  }
}

// *Modelo para argumentos
export class ArgumentModel {
  argumentId: number;
  name: string;
  dataType: number;
  defaultValue: string;

  constructor(payload: any) {
    this.argumentId = payload.idArgumento;
    this.name = payload.argumento;
    this.dataType = +payload.idTipoDato;
    this.defaultValue = payload.valorPorDefecto;
  }
}

// *Modelos para lectura
export class ReadingFieldModel {
  functions: Array<ReadingFunctionModel>;

  constructor(payload: any) {}
}

export class ReadingFunctionModel {
  parameters: Array<ReadingParameterModel>;

  constructor(payload: any) {}
}

export class ReadingParameterModel {
  constructor(payload: any) {}
}

// *Modelos para salida
export class OutputFieldModel {
  functions: Array<OutputFunctionModel>;

  constructor(payload: any) {}
}

export class OutputFunctionModel {
  parameters: Array<OutputParameterModel>;

  constructor(payload: any) {}
}

export class OutputParameterModel {
  constructor(payload: any) {}
}
