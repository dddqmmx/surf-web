import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerSettingDialogComponent } from './server-setting-dialog.component';

describe('ServerSettingDialogComponent', () => {
  let component: ServerSettingDialogComponent;
  let fixture: ComponentFixture<ServerSettingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerSettingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerSettingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
