import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiccionarioParametrosComponent } from './diccionario-parametros.component';

describe('DiccionarioParametrosComponent', () => {
  let component: DiccionarioParametrosComponent;
  let fixture: ComponentFixture<DiccionarioParametrosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiccionarioParametrosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiccionarioParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
