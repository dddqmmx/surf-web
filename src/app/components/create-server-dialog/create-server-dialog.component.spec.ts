import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServerDialogComponent } from './create-server-dialog.component';

describe('CreateServerDialogComponent', () => {
  let component: CreateServerDialogComponent;
  let fixture: ComponentFixture<CreateServerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServerDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateServerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
