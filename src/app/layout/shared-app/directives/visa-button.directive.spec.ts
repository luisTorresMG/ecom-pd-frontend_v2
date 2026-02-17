import { VisaButtonDirective } from './visa-button.directive';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ElementRef, Renderer2, Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { AppConfig } from '../../../app.config';

@Component({
  template: `
    <img
      src="./assets/soat/img/visa.png"
      alt="Visa"
      height="48"
      appVisaButton
      [config]="visaSessionToken"
      [amount]="rate"
    />
  `,
})
class TestVisaComponent {
  visaSessionToken = {
    sessionToken: 'test',
    purchaseNumber: 'test',
  };

  rate = 60;
}

describe('VisaButtonDirective', () => {
  let component: TestVisaComponent;
  let fixture: ComponentFixture<TestVisaComponent>;
  let el: DebugElement;

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TestVisaComponent, VisaButtonDirective],
      providers: [
        { provide: ElementRef, useValue: { nativeElement: { style: {} } } },
        Renderer2,
        { provide: AppConfig, useValue: { AddEventAnalityc: () => {} } },
      ],
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TestVisaComponent);
    component = fixture.componentInstance;

    el = fixture.debugElement.query(By.css('img'));
  });

  it('should create form', () => {
    fixture.detectChanges();
    expect(el.nativeElement.previousElementSibling).toBeDefined();
  });

  it('should create script', () => {
    fixture.detectChanges();
    expect(
      el.nativeElement.previousElementSibling.querySelector('script')
    ).toBeDefined();
  });

  it('should set the values properly', () => {
    fixture.detectChanges();
    const script = el.nativeElement.previousElementSibling.querySelector(
      'script'
    );

    expect(script.getAttribute('data-sessiontoken')).toEqual('test');
    expect(script.getAttribute('data-purchasenumber')).toEqual('test');
    expect(script.getAttribute('data-amount')).toEqual('60');
  });
});
