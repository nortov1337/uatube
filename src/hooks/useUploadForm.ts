"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useVideoMetadata } from "@/hooks/useVideoMetadata";
import { errorMessage, uploadWithProgress } from "@/lib/api-client";

interface CreatedVideo {
  id: string;
}

export function useUploadForm() {
  const router = useRouter();
  const { metadata, load, reset } = useVideoMetadata();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = async (nextFile: File) => {
    setError(null);
    setFile(nextFile);
    reset();
    try {
      await load(nextFile);
    } catch (metadataError) {
      setError(errorMessage(metadataError));
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file || pending) return;

    setPending(true);
    setError(null);
    setProgress(0);

    const form = new FormData();
    form.append("file", file);
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("tags", tags.trim());
    form.append("category", category);
    form.append("visibility", visibility);
    form.append("durationSec", String(metadata?.durationSec ?? 0));
    if (metadata?.thumbBlob) form.append("thumb", metadata.thumbBlob, "thumb.jpg");

    try {
      const created = await uploadWithProgress<CreatedVideo>("/api/videos", form, setProgress);
      router.push(`/watch/${created.id}`);
      router.refresh();
    } catch (uploadError) {
      setError(errorMessage(uploadError));
      setPending(false);
    }
  };

  return {
    file,
    title,
    description,
    tags,
    category,
    visibility,
    metadata,
    progress,
    pending,
    error,
    selectFile,
    setTitle,
    setDescription,
    setTags,
    setCategory,
    setVisibility,
    submit,
  };
}
