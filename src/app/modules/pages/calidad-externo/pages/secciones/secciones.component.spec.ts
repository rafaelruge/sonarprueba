import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeccionesComponentQce } from './secciones.component';

describe('SeccionesComponentQce', () => {
  let component: SeccionesComponentQce;
  let fixture: ComponentFixture<SeccionesComponentQce>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeccionesComponentQce ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeccionesComponentQce);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
