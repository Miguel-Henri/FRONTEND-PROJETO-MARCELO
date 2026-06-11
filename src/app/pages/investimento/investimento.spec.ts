import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvestimentosComponent } from './investimento';

describe('InvestimentosComponent', () => {
  let component: InvestimentosComponent;
  let fixture: ComponentFixture<InvestimentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestimentosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestimentosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
