import { Subcategory } from './subcategory';

export class Category {
  id: string;
  descripcion: string;
  image?: string | any;
  productos?: Subcategory[];
  key: string;
}
