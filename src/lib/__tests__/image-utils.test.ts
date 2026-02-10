import { validateBackgroundFile, fileToDataUrl, BACKGROUND_IMAGE_LIMITS } from "../image-utils";

function makeFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe("validateBackgroundFile", () => {
  it("accepts PNG files", () => {
    const file = makeFile("test.png", 1000, "image/png");
    expect(validateBackgroundFile(file)).toEqual({ valid: true });
  });

  it("accepts JPEG files", () => {
    const file = makeFile("test.jpg", 1000, "image/jpeg");
    expect(validateBackgroundFile(file)).toEqual({ valid: true });
  });

  it("accepts PDF files", () => {
    const file = makeFile("test.pdf", 1000, "application/pdf");
    expect(validateBackgroundFile(file)).toEqual({ valid: true });
  });

  it("rejects GIF files", () => {
    const file = makeFile("test.gif", 1000, "image/gif");
    const result = validateBackgroundFile(file);
    expect(result.valid).toBe(false);
    expect(result.errorKey).toBe("template.background_image.error_type");
  });

  it("rejects SVG files", () => {
    const file = makeFile("test.svg", 1000, "image/svg+xml");
    const result = validateBackgroundFile(file);
    expect(result.valid).toBe(false);
    expect(result.errorKey).toBe("template.background_image.error_type");
  });

  it("rejects text files", () => {
    const file = makeFile("test.txt", 1000, "text/plain");
    const result = validateBackgroundFile(file);
    expect(result.valid).toBe(false);
    expect(result.errorKey).toBe("template.background_image.error_type");
  });

  it("rejects files larger than 5MB", () => {
    const file = makeFile("big.png", BACKGROUND_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES + 1, "image/png");
    const result = validateBackgroundFile(file);
    expect(result.valid).toBe(false);
    expect(result.errorKey).toBe("template.background_image.error_size");
  });

  it("accepts files exactly at the 5MB limit", () => {
    const file = makeFile("exact.png", BACKGROUND_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES, "image/png");
    expect(validateBackgroundFile(file)).toEqual({ valid: true });
  });
});

describe("fileToDataUrl", () => {
  it("converts a file to a data URL", async () => {
    const content = "hello";
    const file = new File([content], "test.txt", { type: "text/plain" });
    const result = await fileToDataUrl(file);
    expect(result).toMatch(/^data:text\/plain;base64,/);
  });
});

describe("BACKGROUND_IMAGE_LIMITS", () => {
  it("has correct max file size of 5MB", () => {
    expect(BACKGROUND_IMAGE_LIMITS.MAX_FILE_SIZE_BYTES).toBe(5 * 1024 * 1024);
  });

  it("accepts exactly 3 MIME types", () => {
    expect(BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES).toHaveLength(3);
    expect(BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES).toContain("image/png");
    expect(BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES).toContain("image/jpeg");
    expect(BACKGROUND_IMAGE_LIMITS.ACCEPTED_MIME_TYPES).toContain("application/pdf");
  });
});
