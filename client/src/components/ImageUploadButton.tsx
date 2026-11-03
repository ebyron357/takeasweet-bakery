import { useRef, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { prepareImageForUpload } from "@/lib/prepare-image";
import { trpc } from "@/lib/trpc";
import { UPLOAD_IMAGE_TYPES } from "@shared/image-upload";

/**
 * Lets the owner pick a photo from their device; it is resized, cleaned of
 * location data, stored, and its URL handed to `onUploaded`. The surrounding
 * form still needs saving for the photo to appear on the site.
 */
export default function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);
  const upload = trpc.admin.uploadImage.useMutation();
  const busy = preparing || upload.isPending;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      setPreparing(true);
      const prepared = await prepareImageForUpload(file);
      setPreparing(false);
      const { url } = await upload.mutateAsync(prepared);
      onUploaded(url);
      toast.success("Photo uploaded. Save to publish it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The photo couldn't be uploaded.");
    } finally {
      setPreparing(false);
      // Let the same file be chosen again after a failure.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={UPLOAD_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        className="min-h-11 shrink-0 rounded-full sm:min-h-9"
        disabled={busy}
        aria-busy={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? <Loader2 className="animate-spin" /> : <ImageUp />}
        {busy ? "Uploading…" : "Upload photo"}
      </Button>
    </>
  );
}
