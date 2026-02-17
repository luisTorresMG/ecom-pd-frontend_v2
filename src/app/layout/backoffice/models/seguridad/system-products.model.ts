export class SystemProductsModel {
    items: Array<{
        id: number,
        description: string
    }>;
    constructor(payload?: any) {
        this.items = payload?.LIST_PRODUCT.map((val) => ({
            id: +val.NIDPRODUCT,
            description: val.SNAME
        })) || [];
    }
}
