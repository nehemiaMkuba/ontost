import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModellingEnvironmentComponent } from './modelling-environment.component';

describe('ModellingEnvironmentComponent', () => {
  let component: ModellingEnvironmentComponent;
  let fixture: ComponentFixture<ModellingEnvironmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModellingEnvironmentComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModellingEnvironmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
