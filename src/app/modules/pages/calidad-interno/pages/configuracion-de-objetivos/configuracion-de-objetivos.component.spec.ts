import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionDeObjetivosComponent } from './configuracion-de-objetivos.component';

describe('ConfiguracionDeObjetivosComponent', () => {
  let component: ConfiguracionDeObjetivosComponent;
  let fixture: ComponentFixture<ConfiguracionDeObjetivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfiguracionDeObjetivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracionDeObjetivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
