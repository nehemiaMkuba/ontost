import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { ModalConnectorManageCombinationsComponent } from './modal-connector-manage-combinations.component';

describe('ModalConnectorManageCombinationsComponent', () => {
  let component: ModalConnectorManageCombinationsComponent;
  let fixture: ComponentFixture<ModalConnectorManageCombinationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConnectorManageCombinationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConnectorManageCombinationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
