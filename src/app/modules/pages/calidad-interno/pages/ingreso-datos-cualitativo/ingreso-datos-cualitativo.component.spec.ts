import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoDatosCualitativoComponent } from './ingreso-datos-cualitativo.component';

describe('IngresoDatosCualitativoComponent', () => {
  let component: IngresoDatosCualitativoComponent;
  let fixture: ComponentFixture<IngresoDatosCualitativoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IngresoDatosCualitativoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IngresoDatosCualitativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
