import { Injectable } from "@angular/core";
import { RequestService } from "./request.service";
import { CommonDataService } from "./common-data.service";
import { SocketService } from "./socket.service";
import { Subject, Subscription } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class VoiceChatService {
  private channelId: string | undefined;
  private audioContext: AudioContext;
  private audioQueue: { data: Float32Array; duration: number }[] = [];
  private isRecording = false;
  private silentChunks = 0;
  private readonly SILENCE_THRESHOLD = 0.01; // 声音阈值
  private readonly SILENT_CHUNKS = 150; // 连续静音块数量
  private totalRecordedDuration = 0;
  private readonly MAX_RECORDING_DURATION = 0.5; // 最大录音时长，单位秒

  // 为每个说话者维护独立的播放队列
  private playbackQueues: Map<string, string[]> = new Map();
  private playingQueues: Set<string> = new Set(); // 存储正在播放的说话者

  private stream: MediaStream | undefined;
  private subject: Subscription | undefined;

  constructor(
    private requestService: RequestService,
    private socketService: SocketService,
    private commonData: CommonDataService
  ) {
    this.audioContext = new AudioContext({ latencyHint: 'interactive' }); // 优化音频上下文延迟
  }

  /** 初始化录音器 */
  async initializeRecorder(channelId: string) {
    this.channelId = channelId;
    await this.audioContext.audioWorklet.addModule(window.location.origin + '/js/audio-processor.js');
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 48000, channelCount: 1 } });
    const source = this.audioContext.createMediaStreamSource(this.stream);

    const audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
    source.connect(audioWorkletNode);
    audioWorkletNode.connect(this.audioContext.destination);

    audioWorkletNode.port.onmessage = (event) => {
      if (this.commonData.micEnabled) {
        const inputData = event.data as Float32Array;
        this.processAudioInput(inputData);
      }
    };

    this.subject = this.socketService.getMessageSubject("server", "send_audio").subscribe(data => {
      if (this.commonData.speakerEnabled) {
        this.playBase64Audio(data["sender"], data['data']);
      }
    });
  }

  /** 停止录音并释放资源 */
  stopRecording() {
    this.isRecording = false;
    this.audioQueue = [];
    this.totalRecordedDuration = 0;
    this.silentChunks = 0;

    this.playbackQueues.forEach((queue, sender) => {
      this.playbackQueues.set(sender, []);
    });
    this.playingQueues.clear();

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = undefined;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = new AudioContext({ latencyHint: 'interactive' });
    }

    if (this.subject) {
      this.subject.unsubscribe();
    }

    this.requestService.requestDisconnectToVoiceChannel(this.channelId);
  }

  /** 处理输入的音频数据 */
  private processAudioInput(inputData: Float32Array) {
    const rms = this.computeRMS(inputData);

    if (this.isRecording) {
      this.audioQueue.push({ data: inputData.slice(), duration: inputData.length / this.audioContext.sampleRate });
      this.totalRecordedDuration += inputData.length / this.audioContext.sampleRate;

      if (this.totalRecordedDuration >= this.MAX_RECORDING_DURATION) {
        this.processAudioSegment();
        this.isRecording = false;
        this.totalRecordedDuration = 0;
      }
      if (rms < this.SILENCE_THRESHOLD) {
        this.silentChunks++;
        if (this.silentChunks > this.SILENT_CHUNKS) {
          this.processAudioSegment();
          this.isRecording = false;
          this.totalRecordedDuration = 0;
        }
      } else {
        this.silentChunks = 0;
      }
    } else if (rms >= this.SILENCE_THRESHOLD) {
      this.isRecording = true;
      this.silentChunks = 0;
      this.audioQueue.push({ data: inputData.slice(), duration: inputData.length / this.audioContext.sampleRate });
      this.totalRecordedDuration += inputData.length / this.audioContext.sampleRate;
    }
  }

  /** 计算 RMS（均方根）以检测声音强度 */
  private computeRMS(data: Float32Array): number {
    const sum = data.reduce((acc, value) => acc + value * value, 0);
    return Math.sqrt(sum / data.length);
  }

  /** 处理并发送音频片段 */
  private processAudioSegment() {
    // const audioData = this.combineAudioFrames(this.audioQueue);
    // const base64String = this.float32ToBase64(audioData);
    this.requestService.sendAudio(this.channelId, "");
    // this.audioQueue = [];
  }

  /** 播放 Base64 格式的音频 */
  public playBase64Audio(sender: string, base64String: string) {
    if (!this.playbackQueues.has(sender)) {
      this.playbackQueues.set(sender, []);
    }
    this.playbackQueues.get(sender)?.push(base64String);

    if (!this.playingQueues.has(sender)) {
      this.playingQueues.add(sender);
      this.playNextAudio(sender);
    }
  }

  /** 播放队列中的下一个音频 */
  private playNextAudio(sender: string) {
    const queue = this.playbackQueues.get(sender);
    if (!queue || queue.length === 0) {
      this.playingQueues.delete(sender);
      return;
    }

    const base64String = queue.shift()!;
    const float32Array = this.base64ToFloat32(base64String);
    const buffer = this.audioContext.createBuffer(1, float32Array.length, this.audioContext.sampleRate);
    buffer.copyToChannel(float32Array, 0);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);

    source.onended = () => {
      source.disconnect();
      this.playNextAudio(sender);
    };
  }

  /** Float32Array 转为 Base64 */
  private float32ToBase64(float32Array: Float32Array): string {
    const uint8Array = new Uint8Array(float32Array.buffer);
    const chunkSize = 0x8000; // 32KB 分块
    let binary = '';
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return btoa(binary);
  }

  /** Base64 转为 Float32Array */
  private base64ToFloat32(base64String: string): Float32Array {
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }
    return new Float32Array(uint8Array.buffer);
  }

  /** 合并音频帧 */
  private combineAudioFrames(frames: { data: Float32Array; duration: number }[]): Float32Array {
    const totalLength = frames.reduce((sum, frame) => sum + frame.data.length, 0);
    const combined = new Float32Array(totalLength);
    let offset = 0;

    for (const frame of frames) {
      combined.set(frame.data, offset);
      offset += frame.data.length;
    }
    return combined;
  }
}
