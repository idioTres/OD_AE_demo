export class Camera {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  public constructor() {
    this.video = document.createElement('video');
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = 640;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  public async getCameraList(): Promise<MediaDeviceInfo[]> {
    const devices = await window.navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  }

  public async useCamera(deviceId: string) {
    const camera = await window.navigator.mediaDevices.getUserMedia({video: {deviceId: deviceId}});
    this.video.srcObject = camera;
    this.video.play();
    this.canvas.remove();
    document.body.append(this.canvas);
  }

  public capture(): string {
    const w = this.video.videoWidth;
    const h = this.video.videoHeight;
    const size = Math.min(w, h);
    this.ctx.drawImage(
      this.video,
       (w - size) / 2, (h - size) / 2, size, size,
       0, 0, this.canvas.width, this.canvas.height);

    return this.canvas.toDataURL('image/png');
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}