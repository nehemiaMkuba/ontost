import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModalInsertObjectPropertyComponent } from './modal-insert-object-property.component';

describe('ModalInsertObjectPropertyComponent', () => {
  let component: ModalInsertObjectPropertyComponent;
  let fixture: ComponentFixture<ModalInsertObjectPropertyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInsertObjectPropertyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInsertObjectPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
