import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentoModalComponent } from './documento-modal.component';


describe('ComentarioModalComponent', () => {
  let component: DocumentoModalComponent;
  let fixture: ComponentFixture<DocumentoModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentoModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
