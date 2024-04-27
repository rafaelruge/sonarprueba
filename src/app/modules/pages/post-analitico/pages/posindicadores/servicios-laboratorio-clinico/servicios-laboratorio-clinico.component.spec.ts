import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosLaboratorioClinicoComponent } from './servicios-laboratorio-clinico.component';

describe('ServiciosLaboratorioClinicoComponent', () => {
  let component: ServiciosLaboratorioClinicoComponent;
  let fixture: ComponentFixture<ServiciosLaboratorioClinicoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiciosLaboratorioClinicoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiciosLaboratorioClinicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
