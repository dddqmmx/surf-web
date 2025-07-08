import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatImageComponent } from './chat-image.component';

describe('ChatImageComponent', () => {
  let component: ChatImageComponent;
  let fixture: ComponentFixture<ChatImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
