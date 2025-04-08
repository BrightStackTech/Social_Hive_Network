declare module 'video-trimmer' {
  export default class VideoTrimmer {
    constructor(element: HTMLElement, url: string);
    trimVideo(file: File, options: { start: number; end: number }): Promise<Blob>;
  }
}