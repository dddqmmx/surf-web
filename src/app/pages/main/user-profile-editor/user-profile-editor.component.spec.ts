import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileEditorComponent } from './user-profile-editor.component';

describe('UserProfileEditorComponent', () => {
  let component: UserProfileEditorComponent;
  let fixture: ComponentFixture<UserProfileEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
