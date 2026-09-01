"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Upload, FileVideo, FileText, Image, Trash2, ExternalLink, Copy, Check,
  AlertCircle,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, Field } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatDate, fileSizeLabel, cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "PDF";
  sortOrder: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  modules: Module[];
}

interface UploadedFile {
  id: string;
  fileName: string;
  url: string;
  type: "video" | "pdf" | "image";
  size: number;
  uploadedAt: string;
  linkedLessonId?: string;
}

const FILE_LIMITS = {
  video: 500 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
  image: 10 * 1024 * 1024,
};

const ACCEPT = {
  video: "video/*",
  pdf: ".pdf",
  image: "image/*",
};

function UploadZone({
  type,
  onUpload,
  uploading,
  progress,
}: {
  type: "video" | "pdf" | "image";
  onUpload: (file: File) => void;
  uploading: boolean;
  progress: number;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSize = FILE_LIMITS[type];

  const iconMap = { video: FileVideo, pdf: FileText, image: Image };
  const Icon = iconMap[type];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File too large. Maximum size is ${fileSizeLabel(maxSize)}.`);
        return;
      }
      onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File too large. Maximum size is ${fileSizeLabel(maxSize)}.`);
        return;
      }
      onUpload(file);
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer",
        dragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        uploading && "pointer-events-none opacity-60",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[type]}
        onChange={handleFileSelect}
        className="hidden"
      />
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
        dragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="mt-3 text-sm font-medium">
        {dragging ? "Drop file here" : "Click or drag to upload"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Max size: {fileSizeLabel(maxSize)}
      </p>
      {uploading && (
        <div className="mt-4 w-full max-w-xs">
          <Progress value={progress} />
          <p className="mt-1 text-xs text-center text-muted-foreground">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}

function LinkLessonModal({
  open,
  onClose,
  course,
  fileUrl,
  fileName,
  onLink,
}: {
  open: boolean;
  onClose: () => void;
  course: Course;
  fileUrl: string;
  fileName: string;
  onLink: (moduleId: string, lessonId: string) => void;
}) {
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");

  if (!open) return null;

  const currentModule = course.modules.find((m) => m.id === selectedModule);
  const lessons = currentModule?.lessons ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-up">
        <h3 className="text-lg font-semibold">Link to Lesson</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Link &ldquo;{fileName}&rdquo; to a lesson.
        </p>
        <div className="mt-4 space-y-3">
          <Field label="Module" htmlFor="link-module">
            <Select id="link-module" value={selectedModule} onChange={(e) => { setSelectedModule(e.target.value); setSelectedLesson(""); }}>
              <option value="">Select a module</option>
              {course.modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </Select>
          </Field>
          <Field label="Lesson" htmlFor="link-lesson">
            <Select id="link-lesson" value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)}>
              <option value="">Select a lesson</option>
              {lessons.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.type})</option>)}
            </Select>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="gradient"
            disabled={!selectedModule || !selectedLesson}
            onClick={() => { onLink(selectedModule, selectedLesson); onClose(); }}
          >
            Link Content
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function UploadContentPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploadingType, setUploadingType] = useState<"video" | "pdf" | "image" | null>(null);
  const [progress, setProgress] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [linkingFile, setLinkingFile] = useState<{ url: string; fileName: string } | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      const data = await res.json();
      setCourse(data);
    } catch {
      toast("error", "Fetch failed", "Could not load course data.");
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const uploadFile = async (file: File, type: "video" | "pdf" | "image") => {
    setUploadingType(type);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    const endpoint = type === "video"
      ? "/api/admin/upload/video"
      : type === "pdf"
        ? "/api/admin/upload/pdf"
        : "/api/admin/upload/image";

    try {
      const xhr = new XMLHttpRequest();
      const result = await new Promise<{ id: string; url: string; fileName: string }>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress((e.loaded / e.total) * 100);
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error("Upload failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", endpoint);
        xhr.send(formData);
      });

      setFiles((prev) => [...prev, {
        id: result.id,
        fileName: result.fileName || file.name,
        url: result.url,
        type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }]);

      toast("success", "Uploaded", `${file.name} uploaded successfully.`);
    } catch {
      toast("error", "Upload failed", `Could not upload ${file.name}.`);
    } finally {
      setUploadingType(null);
      setProgress(0);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    toast("success", "Removed", "File removed from list.");
  };

  const handleLinkLesson = (moduleId: string, lessonId: string) => {
    if (!linkingFile) return;
    setFiles((prev) => prev.map((f) =>
      f.url === linkingFile.url ? { ...f, linkedLessonId: lessonId } : f,
    ));
    toast("success", "Linked", "Content linked to lesson.");
    setLinkingFile(null);
  };

  const findLessonName = (lessonId?: string) => {
    if (!lessonId || !course) return null;
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) return `${mod.title} > ${lesson.title}`;
    }
    return null;
  };

  const allLessons = course?.modules.flatMap((m) =>
    m.lessons.map((l) => ({ ...l, moduleTitle: m.title })),
  ) ?? [];

  if (loading) {
    return (
      <DashboardShell>
        <PageHeader title="Upload Content" description="Loading..." />
        <div className="mx-auto max-w-3xl space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-40 animate-pulse rounded-lg bg-muted" /></CardContent></Card>
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell>
        <PageHeader title="Upload Content" description="Course not found." />
        <Card className="mx-auto max-w-3xl p-8 text-center">
          <p className="text-muted-foreground">The requested course could not be loaded.</p>
          <Link href="/admin/courses"><Button variant="ghost" className="mt-4"><ArrowLeft className="h-4 w-4" /> Back to Courses</Button></Link>
        </Card>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        title={`Upload: ${course.title}`}
        description="Upload videos, PDFs, and images. Drag & drop or click to browse."
        actions={
          <div className="flex gap-2">
            <Link href={`/admin/courses/${courseId}`}>
              <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Back to Edit</Button>
            </Link>
          </div>
        }
      />

      <div className="mx-auto max-w-3xl space-y-6">
        {/* Upload Zones */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileVideo className="h-4 w-4 text-blue-500" /> Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone
                type="video"
                onUpload={(file) => uploadFile(file, "video")}
                uploading={uploadingType === "video"}
                progress={progress}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-red-500" /> PDF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone
                type="pdf"
                onUpload={(file) => uploadFile(file, "pdf")}
                uploading={uploadingType === "pdf"}
                progress={progress}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Image className="h-4 w-4 text-green-500" /> Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadZone
                type="image"
                onUpload={(file) => uploadFile(file, "image")}
                uploading={uploadingType === "image"}
                progress={progress}
              />
            </CardContent>
          </Card>
        </div>

        {/* Upload Limits Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Video:</strong> Maximum 500 MB per file</p>
                <p><strong>PDF:</strong> Maximum 50 MB per file</p>
                <p><strong>Image:</strong> Maximum 10 MB per file</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {files.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 text-sm text-muted-foreground">No files uploaded yet.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Linked To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((f) => {
                    const linkedName = findLessonName(f.linkedLessonId);
                    return (
                      <TableRow key={f.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            {f.type === "video" && <FileVideo className="h-4 w-4 text-blue-500 shrink-0" />}
                            {f.type === "pdf" && <FileText className="h-4 w-4 text-red-500 shrink-0" />}
                            {f.type === "image" && <Image className="h-4 w-4 text-green-500 shrink-0" />}
                            <span className="truncate text-sm">{f.fileName}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{f.type.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{fileSizeLabel(f.size)}</TableCell>
                        <TableCell className="text-sm">
                          {linkedName ? (
                            <Badge variant="primary" className="text-[10px]">{linkedName}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleCopyUrl(f.url)} title="Copy URL">
                              {copiedUrl === f.url ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => window.open(f.url, "_blank")} title="Open in new tab">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                            {allLessons.length > 0 && (
                              <Button variant="ghost" size="icon" onClick={() => setLinkingFile({ url: f.url, fileName: f.fileName })} title="Link to lesson">
                                <Upload className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteFile(f.id)} title="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Link Modal */}
      {course && (
        <LinkLessonModal
          open={!!linkingFile}
          onClose={() => setLinkingFile(null)}
          course={course}
          fileUrl={linkingFile?.url ?? ""}
          fileName={linkingFile?.fileName ?? ""}
          onLink={handleLinkLesson}
        />
      )}
    </DashboardShell>
  );
}
