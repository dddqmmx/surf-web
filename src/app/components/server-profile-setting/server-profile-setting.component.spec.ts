import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerProfileSettingComponent } from './server-profile-setting.component';

describe('ServerProfileSettingComponent', () => {
  let component: ServerProfileSettingComponent;
  let fixture: ComponentFixture<ServerProfileSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerProfileSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerProfileSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
