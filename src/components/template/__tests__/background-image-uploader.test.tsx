import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BackgroundImageUploader } from "../background-image-uploader";
import { validateBackgroundFile, fileToDataUrl, resizeImageToDataUrl } from "@/lib/image-utils";
import { pdfFirstPageToDataUrl } from "@/lib/pdf-to-image";
import { uploadBackgroundImage, deleteBackgroundImage } from "@/services/storage.service";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

// Mock dependencies
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("@/stores/auth-store", () => ({
  useAuthStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: null, isGuest: true }),
  ),
}));

vi.mock("@/services/storage.service", () => ({
  uploadBackgroundImage: vi.fn(),
  deleteBackgroundImage: vi.fn(),
}));

vi.mock("@/lib/image-utils", () => ({
  validateBackgroundFile: vi.fn(() => ({ valid: true })),
  fileToDataUrl: vi.fn(() => Promise.resolve("data:image/png;base64,mock")),
  resizeImageToDataUrl: vi.fn(() => Promise.resolve("data:image/jpeg;base64,resized")),
  BACKGROUND_IMAGE_LIMITS: {
    MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
    ACCEPTED_MIME_TYPES: ["image/png", "image/jpeg", "application/pdf"],
    TARGET_WIDTH: 750,
    TARGET_HEIGHT: 1050,
  },
}));

vi.mock("@/lib/pdf-to-image", () => ({
  pdfFirstPageToDataUrl: vi.fn(() => Promise.resolve("data:image/png;base64,pdfpage")),
}));

const defaultProps = {
  backgroundImage: undefined as string | undefined,
  backgroundImageFit: undefined as "cover" | "contain" | "fill" | undefined,
  templateId: "tmpl-1",
  isGuest: true,
  onChange: vi.fn(),
};

describe("BackgroundImageUploader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows upload button when no image is set", () => {
    render(<BackgroundImageUploader {...defaultProps} />);
    expect(screen.getByText("template.background_image.upload")).toBeInTheDocument();
  });

  it("does not show fit selector when no image is set", () => {
    render(<BackgroundImageUploader {...defaultProps} />);
    expect(screen.queryByText("template.background_image.fit")).not.toBeInTheDocument();
  });

  it("shows replace and remove buttons when image is set", () => {
    render(
      <BackgroundImageUploader
        {...defaultProps}
        backgroundImage="data:image/png;base64,abc"
        backgroundImageFit="cover"
      />,
    );
    expect(screen.getByText("template.background_image.replace")).toBeInTheDocument();
    expect(screen.getByText("template.background_image.remove")).toBeInTheDocument();
  });

  it("shows fit selector when image is set", () => {
    render(
      <BackgroundImageUploader
        {...defaultProps}
        backgroundImage="data:image/png;base64,abc"
        backgroundImageFit="cover"
      />,
    );
    expect(screen.getByText("template.background_image.fit")).toBeInTheDocument();
  });

  it("calls onChange with undefined backgroundImage when remove is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <BackgroundImageUploader
        {...defaultProps}
        backgroundImage="data:image/png;base64,abc"
        backgroundImageFit="cover"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByText("template.background_image.remove"));
    expect(onChange).toHaveBeenCalledWith({ backgroundImage: undefined });
  });

  it("shows the label", () => {
    render(<BackgroundImageUploader {...defaultProps} />);
    expect(screen.getByText("template.background_image.label")).toBeInTheDocument();
  });

  it("has a hidden file input with correct accept attribute", () => {
    render(<BackgroundImageUploader {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.accept).toBe("image/png,image/jpeg,application/pdf");
    expect(input.className).toContain("hidden");
  });

  it("shows error toast when file validation fails", async () => {
    vi.mocked(validateBackgroundFile).mockReturnValueOnce({
      valid: false,
      errorKey: "template.background_image.error_type",
    });

    render(<BackgroundImageUploader {...defaultProps} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["test"], "test.gif", { type: "image/gif" });

    Object.defineProperty(input, "files", { value: [file], writable: false });
    fireEvent.change(input);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("template.background_image.error_type");
    });
  });
});

// ─── Functional tests: PDF upload flow ───────────────────────────────

function uploadFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("BackgroundImageUploader – PDF upload (guest mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("full flow: PDF file → pdfFirstPageToDataUrl → resizeImageToDataUrl → onChange", async () => {
    const onChange = vi.fn();
    render(<BackgroundImageUploader {...defaultProps} onChange={onChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["%PDF-1.4 fake content"], "card-bg.pdf", { type: "application/pdf" });

    uploadFile(input, pdfFile);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    // 1. Validation was called with the PDF file
    expect(validateBackgroundFile).toHaveBeenCalledWith(pdfFile);

    // 2. PDF was converted to image (not fileToDataUrl)
    expect(pdfFirstPageToDataUrl).toHaveBeenCalledWith(pdfFile, 750, 1050);
    expect(fileToDataUrl).not.toHaveBeenCalled();

    // 3. Image was resized for guest storage
    expect(resizeImageToDataUrl).toHaveBeenCalledWith(
      "data:image/png;base64,pdfpage",
      750,
      1050,
    );

    // 4. onChange was called with the resized base64 and default fit
    expect(onChange).toHaveBeenCalledWith({
      backgroundImage: "data:image/jpeg;base64,resized",
      backgroundImageFit: "cover",
    });

    // 5. No storage upload in guest mode
    expect(uploadBackgroundImage).not.toHaveBeenCalled();
  });

  it("preserves existing backgroundImageFit when uploading PDF", async () => {
    const onChange = vi.fn();
    render(
      <BackgroundImageUploader
        {...defaultProps}
        backgroundImage="data:image/png;base64,old"
        backgroundImageFit="contain"
        onChange={onChange}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["%PDF"], "new.pdf", { type: "application/pdf" });

    uploadFile(input, pdfFile);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        backgroundImage: "data:image/jpeg;base64,resized",
        backgroundImageFit: "contain",
      });
    });
  });

  it("shows error toast and does not call onChange when PDF conversion fails", async () => {
    vi.mocked(pdfFirstPageToDataUrl).mockRejectedValueOnce(new Error("PDF parse error"));
    const onChange = vi.fn();

    render(<BackgroundImageUploader {...defaultProps} onChange={onChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["%PDF"], "broken.pdf", { type: "application/pdf" });

    uploadFile(input, pdfFile);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("template.background_image.error_upload");
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("BackgroundImageUploader – PDF upload (authenticated mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({ user: { id: "user-42" }, isGuest: false }) as never,
    );
  });

  afterEach(() => {
    vi.mocked(useAuthStore).mockImplementation(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({ user: null, isGuest: true }) as never,
    );
  });

  it("full flow: PDF file → pdfFirstPageToDataUrl → Supabase upload → onChange with URL", async () => {
    const mockBlob = new Blob(["img"], { type: "image/png" });
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({ blob: () => Promise.resolve(mockBlob) }),
    ));

    vi.mocked(uploadBackgroundImage).mockResolvedValue(
      "https://storage.supabase.co/template-backgrounds/user-42/tmpl-1.png",
    );

    const onChange = vi.fn();
    render(
      <BackgroundImageUploader
        {...defaultProps}
        isGuest={false}
        onChange={onChange}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pdfFile = new File(["%PDF-1.4"], "design.pdf", { type: "application/pdf" });

    uploadFile(input, pdfFile);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    expect(pdfFirstPageToDataUrl).toHaveBeenCalledWith(pdfFile, 750, 1050);
    expect(resizeImageToDataUrl).not.toHaveBeenCalled();
    expect(uploadBackgroundImage).toHaveBeenCalledWith(
      "user-42",
      "tmpl-1",
      mockBlob,
      "png",
    );
    expect(onChange).toHaveBeenCalledWith({
      backgroundImage: "https://storage.supabase.co/template-backgrounds/user-42/tmpl-1.png",
      backgroundImageFit: "cover",
    });

    vi.unstubAllGlobals();
  });

  it("calls deleteBackgroundImage when remove is clicked for authenticated user", async () => {
    vi.mocked(deleteBackgroundImage).mockResolvedValue(undefined);
    const onChange = vi.fn();

    render(
      <BackgroundImageUploader
        {...defaultProps}
        isGuest={false}
        backgroundImage="https://storage.supabase.co/bg.png"
        backgroundImageFit="cover"
        onChange={onChange}
      />,
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("template.background_image.remove"));

    await waitFor(() => {
      expect(deleteBackgroundImage).toHaveBeenCalledWith("user-42", "tmpl-1");
    });
    expect(onChange).toHaveBeenCalledWith({ backgroundImage: undefined });
  });
});

describe("BackgroundImageUploader – Image upload (guest mode)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("full flow: PNG file → fileToDataUrl → resizeImageToDataUrl → onChange", async () => {
    const onChange = vi.fn();
    render(<BackgroundImageUploader {...defaultProps} onChange={onChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const pngFile = new File(["img data"], "background.png", { type: "image/png" });

    uploadFile(input, pngFile);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    expect(fileToDataUrl).toHaveBeenCalledWith(pngFile);
    expect(pdfFirstPageToDataUrl).not.toHaveBeenCalled();
    expect(resizeImageToDataUrl).toHaveBeenCalledWith(
      "data:image/png;base64,mock",
      750,
      1050,
    );
    expect(onChange).toHaveBeenCalledWith({
      backgroundImage: "data:image/jpeg;base64,resized",
      backgroundImageFit: "cover",
    });
  });
});
