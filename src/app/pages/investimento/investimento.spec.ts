import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Investimento } from './investimento';

describe('Investimento', () => {
  let component: Investimento;
  let fixture: ComponentFixture<Investimento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Investimento],
    }).compileComponents();

    fixture = TestBed.createComponent(Investimento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
