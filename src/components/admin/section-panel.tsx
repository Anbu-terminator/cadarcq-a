import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, FUNDING_STATUSES, api, fileUrl, type Post, type Section } from "@/lib/api";

const MAX_MB = 10;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,application/pdf";

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusClass(status: string) {
  switch (status) {
    case "Approved":
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
    case "Rejected":
      return "border-red-500/50 bg-red-500/10 text-red-400";
    case "Shortlisted":
      return "border-sky-500/50 bg-sky-500/10 text-sky-400";
    case "Under Review":
      return "border-amber-500/50 bg-amber-500/10 text-amber-400";
    default:
      return "border-border bg-muted text-foreground";
  }
}

function PostCard({ post, isOwner, onDelete }: { post: Post; isOwner: boolean; onDelete: (post: Post) => void }) {
  const file = post.file;
  return (
    <article className="overflow-hidden border bg-card/40">
      {file?.kind === "image" && (
        <a href={fileUrl(file.id)} target="_blank" rel="noopener noreferrer" className="block bg-background/60">
          <img src={fileUrl(file.id)} alt={`Poster for ${post.title}`} loading="lazy" className="max-h-96 w-full object-contain" />
        </a>
      )}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words font-display text-xl font-bold">{post.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(post.createdAt)} · posted by {post.createdBy}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {post.status && <Badge variant="outline" className={statusClass(post.status)}>{post.status}</Badge>}
            {isOwner && (
              <Button variant="outline" size="icon" aria-label={`Delete ${post.title}`} onClick={() => onDelete(post)}>
                <Trash2 className="text-destructive" />
              </Button>
            )}
          </div>
        </div>

        {post.content && <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-muted-foreground">{post.content}</p>}

        {file?.kind === "pdf" && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border bg-background/50 p-3">
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
            <Button asChild size="sm" variant="outline">
              <a href={fileUrl(file.id)} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href={fileUrl(file.id, true)}>
                <Download /> Download
              </a>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

function AddPostDialog({ section, open, onOpenChange }: { section: Section; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string>(FUNDING_STATUSES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (form: FormData) => api.createPost(form),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts", section] });
      toast.success("Added successfully");
      setTitle("");
      setContent("");
      setStatus(FUNDING_STATUSES[0]);
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      onOpenChange(false);
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not save. Please try again."),
  });

  function onFileChange(selected: File | null) {
    setError("");
    if (selected && selected.size > MAX_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_MB} MB.`);
      if (fileRef.current) fileRef.current.value = "";
      setFile(null);
      return;
    }
    setFile(selected);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    const form = new FormData();
    form.append("section", section);
    form.append("title", title.trim());
    form.append("content", content.trim());
    if (section === "funding") form.append("status", status);
    if (file) form.append("file", file);
    mutation.mutate(form);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !mutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Add new entry</DialogTitle>
          <DialogDescription>Title is required. Poster / PDF and content are optional.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required />
          </div>

          {section === "funding" && (
            <div className="space-y-2">
              <Label htmlFor="post-status">Status</Label>
              <select
                id="post-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {FUNDING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="post-file">Poster image or PDF</Label>
            <Input
              id="post-file"
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF or PDF · up to {MAX_MB} MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea id="post-content" value={content} onChange={(e) => setContent(e.target.value)} rows={6} maxLength={5000} />
          </div>

          {error && (
            <p role="alert" className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SectionPanel({
  section,
  heading,
  description,
  isOwner,
}: {
  section: Section;
  heading: string;
  description: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Post | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["posts", section],
    queryFn: () => api.listPosts(section),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.deletePost(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["posts", section] });
      toast.success("Deleted");
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : "Could not delete."),
    onSettled: () => setToDelete(null),
  });

  const posts = data?.posts ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {isOwner && (
          <Button onClick={() => setAdding(true)}>
            <Plus /> Add
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {error && (
          <p className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error instanceof ApiError ? error.message : "Could not load this section."}
          </p>
        )}
        {!isLoading && !error && posts.length === 0 && (
          <p className="border border-dashed py-16 text-center text-sm text-muted-foreground">Nothing posted here yet.</p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} isOwner={isOwner} onDelete={setToDelete} />
        ))}
      </div>

      {isOwner && <AddPostDialog section={section} open={adding} onOpenChange={setAdding} />}

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && !remove.isPending && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” and its attached file will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (toDelete) remove.mutate(toDelete.id);
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
