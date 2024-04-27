import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosAberrantesComponent } from './datos-aberrantes.component';

describe('DatosAberrantesComponent', () => {
  let component: DatosAberrantesComponent;
  let fixture: ComponentFixture<DatosAberrantesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosAberrantesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosAberrantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
