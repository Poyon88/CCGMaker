import "@testing-library/jest-dom/vitest";

// Mock canvas context for jsdom (no native canvas support)
const mockContext2D = {
  drawImage: vi.fn(),
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  resetTransform: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  canvas: { width: 0, height: 0 },
} as unknown as CanvasRenderingContext2D;

HTMLCanvasElement.prototype.getContext = vi.fn((_type: string) => mockContext2D) as never;
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/jpeg;base64,mockdata");
