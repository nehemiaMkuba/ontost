import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInsertShaclPropertyComponent } from './modal-insert-shacl-property.component';

describe('ModalInsertShaclPropertyComponent', () => {
  let component: ModalInsertShaclPropertyComponent;
  let fixture: ComponentFixture<ModalInsertShaclPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalInsertShaclPropertyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInsertShaclPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
