import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroBeneficiarioModalComponent } from './registro-benficiaro-modal.component';


describe('RegistroBeneficiarioModalComponent', () => {
  let component: RegistroBeneficiarioModalComponent;
  let fixture: ComponentFixture<RegistroBeneficiarioModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroBeneficiarioModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroBeneficiarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
