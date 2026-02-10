import { uploadBackgroundImage, deleteBackgroundImage } from "../storage.service";

const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@/config/supabase", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        remove: mockRemove,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadBackgroundImage", () => {
  it("uploads to the correct path", async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://storage.example.com/template-backgrounds/user1/tmpl1.png" },
    });

    const blob = new Blob(["test"], { type: "image/png" });
    const result = await uploadBackgroundImage("user1", "tmpl1", blob as File, "png");

    expect(mockUpload).toHaveBeenCalledWith(
      "user1/tmpl1.png",
      blob,
      { upsert: true, contentType: "image/png" },
    );
    expect(result).toBe("https://storage.example.com/template-backgrounds/user1/tmpl1.png");
  });

  it("constructs path with userId/templateId.extension", async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "url" } });

    const blob = new Blob(["x"], { type: "image/jpeg" });
    await uploadBackgroundImage("abc", "def", blob as File, "jpg");

    expect(mockUpload).toHaveBeenCalledWith(
      "abc/def.jpg",
      blob,
      expect.objectContaining({ upsert: true }),
    );
  });

  it("throws when upload fails", async () => {
    mockUpload.mockResolvedValue({ error: new Error("Upload failed") });

    const blob = new Blob(["test"], { type: "image/png" });
    await expect(uploadBackgroundImage("user1", "tmpl1", blob as File, "png")).rejects.toThrow(
      "Upload failed",
    );
  });
});

describe("deleteBackgroundImage", () => {
  it("removes files with all 3 extensions", async () => {
    mockRemove.mockResolvedValue({ error: null });

    await deleteBackgroundImage("user1", "tmpl1");

    expect(mockRemove).toHaveBeenCalledWith([
      "user1/tmpl1.png",
      "user1/tmpl1.jpg",
      "user1/tmpl1.jpeg",
    ]);
  });
});
