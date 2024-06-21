import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModellingAreaComponent } from './modelling-area.component';

describe('ModellingAreaComponent', () => {
  let component: ModellingAreaComponent;
  let fixture: ComponentFixture<ModellingAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModellingAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModellingAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
