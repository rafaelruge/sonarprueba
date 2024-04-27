import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrecisionResultadosComponent } from './precision-resultados.component';

describe('PrecisionResultadosComponent', () => {
  let component: PrecisionResultadosComponent;
  let fixture: ComponentFixture<PrecisionResultadosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrecisionResultadosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrecisionResultadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
