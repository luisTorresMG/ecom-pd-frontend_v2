import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NewRequestService } from '../../services/new-request.service';
import { Branch, Product } from '../../interfaces/new-request.interface';

const SOAT_BRANCH_ID: number = 66;
const SOAT_PRODUCT_ID: number = 1;

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {

  branchListForm: FormArray = this.builder.array([]);

  branches$: Branch[] = [];

  @Input() set data(array: Branch[]) {
    this.branchListForm.clear();
    array.forEach((item: Branch): void => {
      this.addRowBranch(item);
    });

    if (this.isReadOnly) {
      this.branchListForm.disable({ emitEvent: false });
      return;
    }

    this.branchListForm.enable({ emitEvent: false });
  }

  @Input() set readonly(isReadOnly: boolean) {
    this.isReadOnly = isReadOnly;

    if (this.isReadOnly) {
      this.branchListForm.disable({ emitEvent: false });
      return;
    }

    this.branchListForm.enable({ emitEvent: false });
  }

  @Output() changes: EventEmitter<any> = new EventEmitter<any>();
  @Output() isSOATSelected: EventEmitter<boolean> = new EventEmitter<boolean>();

  isReadOnly: boolean = false;

  constructor(
    private readonly builder: FormBuilder,
    private readonly newRequestService: NewRequestService
  ) {
  }

  ngOnInit(): void {
    this.getProducts();

    this.branchListForm.valueChanges.subscribe((): void => {
      this.emitEventChanges();
    });
  }

  private getProducts(): void {
    this.newRequestService.getProducts().subscribe({
      next: (response: Branch[]): void => {
        this.branches$ = response;
      },
      error: (error: HttpErrorResponse): void => {
        console.error(error);
      },
    });
  }

  /**
   * The addRowBranch function adds a new row to the branchListForm FormArray.
   * @param branch?: Branch Determine if the function is being used to add a new row or edit an existing one
   * @return Void
   */
  addRowBranch(branch?: Branch): void {
    const form: FormGroup = this.builder.group({
      branch: [branch?.branchId ?? '', Validators.required],
      products: this.builder.array([])
    });
    const control: { [key: string]: AbstractControl } = form.controls;
    const array: FormArray = control['products'] as FormArray;

    control['branch'].valueChanges.subscribe((): void => {
      array.clear();
      this.addRowProduct(array);
    });

    this.branchListForm.push(form);

    if (!branch) {
      this.addRowProduct(array);
      return;
    }

    branch.products.forEach((item: Product): void => {
      this.addRowProduct(array, item);
    });
  }

  isVisibleBranchOption(array: FormArray, value, index: number): boolean {
    return !(array.getRawValue()).some((b, i: number): boolean => b.branch == value && index != i);
  }

  /**
   * The addRowProduct function adds a new row to the formArray.
   * @param form: FormArray Add the form-product to the array of products in the form
   * @param product?: Product Pass the product to add in the form
   * @return Void
   */
  addRowProduct(form: FormArray, product?: Product): void {
    const formProduct: FormGroup = this.builder.group({
      product: [product?.idProducto ?? '', Validators.required]
    });
    form.push(formProduct);
  }

  /**
   * The removeOfFormArray function removes a FormGroup from the formArray.
   * @param formArray: FormArray Pass the formArray that we want to remove an item from
   * @param index: number Specify the index of the formArray that is being removed
   * @return Void
   */
  removeOfFormArray(formArray: FormArray, index: number): void {
    if (formArray.length == 1) {
      formArray.at(index).patchValue({
        branch: '',
        product: ''
      });
      return;
    }

    formArray.removeAt(index);
  }

  /**
   * The getProductsByBranch function returns an array of products that are associated with a specific branch
   * @param branchId: number Find the branch with the matching id
   * @return An array of products, which is assigned to the products$ property
   */
  getProductsByBranch(branchId: number): Product[] {
    if (!branchId) {
      return [];
    }

    return this.branches$.find((branch: Branch): boolean => branch.branchId == branchId)?.products ?? [];
  }

  emitEventChanges(): void {
    const branches: any[] = this.branchListForm.getRawValue();
    const products: any[] = [];

    branches.forEach((b): void => {
      b.products.forEach((p): void => {
        products.push({
          productId: p.product,
          branchId: b.branch
        });
      });
    });
    this.changes.emit(products);
    this.isSOATSelected.emit(this.isSoatProductSelected);
  }

  get isSoatProductSelected(): boolean {
    const branches: any[] = this.branchListForm.getRawValue();
    return branches.some((b) => +b.branch == SOAT_BRANCH_ID && b.products.some((p): boolean => +p.product == SOAT_PRODUCT_ID));
  }
}
