import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModalAddPropertiesComponent } from './modal-add-properties.component';

describe('ModalAddPropertiesComponent', () => {
  let component: ModalAddPropertiesComponent;
  let fixture: ComponentFixture<ModalAddPropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
