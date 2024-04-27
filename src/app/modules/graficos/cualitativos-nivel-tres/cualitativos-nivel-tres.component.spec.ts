import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CualitativosNivelTresComponent } from './cualitativos-nivel-tres.component';

describe('CualitativosNivelTresComponent', () => {
  let component: CualitativosNivelTresComponent;
  let fixture: ComponentFixture<CualitativosNivelTresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CualitativosNivelTresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CualitativosNivelTresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
