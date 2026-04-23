"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  activity: {
    id: string;
    authorId: string;
    averageRating: number;
    comments: Array<{
      id: string;
      content: string;
      createdAt: string;
      author: { id: string; name: string; role: "user" | "admin" };
    }>;
    feedbackEntries: Array<{
      id: string;
      summary: string;
      whatWorked: string;
      whatToImprove: string;
      createdAt: string;
      author: { id: string; name: string; role: "user" | "admin" };
      media: Array<{ id: string; fileName: string; url: string }>;
    }>;
    currentUserRating?: number;
  };
  currentUser?: { id: string; role: "user" | "admin" };
  canCopy: boolean;
};

export function ActivitySocialPanel({ activity, currentUser, canCopy }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(activity.currentUserRating?.toString() ?? "");
  const [feedback, setFeedback] = useState({ summary: "", whatWorked: "", whatToImprove: "" });

  async function runAction(key: string, fn: () => Promise<void>) {
    setError(null);
    setBusy(key);
    try {
      await fn();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  async function submitJson(url: string, method: string, body: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? "Request failed.");
    }
  }

  return (
    <section className="space-y-6">
      <section className="space-y-3 rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold">Collaboration</h2>
        {canCopy && currentUser ? (
          <Button
            onClick={() =>
              runAction("copy", async () => {
                await submitJson(`/api/activities/${activity.id}/copy`, "POST", {});
              })
            }
            disabled={busy === "copy"}
          >
            {busy === "copy" ? "Copying..." : "Copy to my activities"}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Sign in to copy and adapt this activity.</p>
        )}
      </section>

      <section className="space-y-3 rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold">Ratings</h2>
        <p className="text-sm">Average rating: {activity.averageRating.toFixed(1)} / 5</p>
        {currentUser ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              runAction("rating", async () => {
                await submitJson(`/api/activities/${activity.id}/rating`, "PUT", { value: Number(rating) });
              });
            }}
          >
            <select
              className="rounded-md border px-2 py-1 text-sm"
              value={rating}
              onChange={(event) => setRating(event.target.value)}
              required
            >
              <option value="">Select rating</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit" disabled={busy === "rating"}>
              {busy === "rating" ? "Saving..." : "Save rating"}
            </Button>
          </form>
        ) : null}
      </section>

      <section className="space-y-3 rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="space-y-2">
          {activity.comments.map((entry) => {
            const canDelete = currentUser && (currentUser.id === entry.author.id || currentUser.role === "admin");
            return (
              <article key={entry.id} className="rounded-md border p-3 text-sm">
                <p>{entry.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {entry.author.name} · {new Date(entry.createdAt).toLocaleString()}
                </p>
                {canDelete ? (
                  <button
                    className="mt-1 text-xs text-red-600 hover:underline"
                    onClick={() =>
                      runAction(`comment-delete-${entry.id}`, async () => {
                        const response = await fetch(`/api/comments/${entry.id}`, { method: "DELETE" });
                        const data = (await response.json()) as { error?: string };
                        if (!response.ok) {
                          throw new Error(data.error ?? "Delete failed.");
                        }
                      })
                    }
                  >
                    Delete
                  </button>
                ) : null}
              </article>
            );
          })}
        </div>

        {currentUser ? (
          <form
            className="space-y-2"
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              runAction("comment", async () => {
                await submitJson(`/api/activities/${activity.id}/comments`, "POST", { content: comment });
                setComment("");
              });
            }}
          >
            <textarea
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Share practical notes or context..."
              required
            />
            <Button size="sm" type="submit" disabled={busy === "comment"}>
              {busy === "comment" ? "Posting..." : "Add comment"}
            </Button>
          </form>
        ) : null}
      </section>

      <section className="space-y-3 rounded-lg border bg-background p-4">
        <h2 className="text-lg font-semibold">Post-activity feedback</h2>
        <div className="space-y-3">
          {activity.feedbackEntries.map((entry) => {
            const canManage = currentUser && (currentUser.id === entry.author.id || currentUser.role === "admin");
            return (
              <article key={entry.id} className="space-y-2 rounded-md border p-3 text-sm">
                <p className="font-medium">{entry.summary}</p>
                <p>
                  <span className="font-medium">What worked:</span> {entry.whatWorked}
                </p>
                <p>
                  <span className="font-medium">What to improve:</span> {entry.whatToImprove}
                </p>
                {!!entry.media.length && (
                  <ul className="list-disc pl-5">
                    {entry.media.map((media) => (
                      <li key={media.id}>
                        <a href={media.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {media.fileName}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-xs text-muted-foreground">
                  {entry.author.name} · {new Date(entry.createdAt).toLocaleString()}
                </p>

                {canManage ? (
                  <div className="space-y-2">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const file = formData.get("file");
                        if (!(file instanceof File) || !file.size) {
                          setError("Choose a file to upload.");
                          return;
                        }

                        runAction(`media-${entry.id}`, async () => {
                          const body = new FormData();
                          body.append("file", file);
                          const response = await fetch(`/api/feedback/${entry.id}/media`, { method: "POST", body });
                          const data = (await response.json()) as { error?: string };
                          if (!response.ok) {
                            throw new Error(data.error ?? "Upload failed.");
                          }
                          (event.currentTarget as HTMLFormElement).reset();
                        });
                      }}
                    >
                      <input type="file" name="file" className="text-xs" />
                      <Button size="sm" type="submit" className="ml-2" disabled={busy === `media-${entry.id}`}>
                        Upload file
                      </Button>
                    </form>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() =>
                        runAction(`feedback-delete-${entry.id}`, async () => {
                          const response = await fetch(`/api/feedback/${entry.id}`, { method: "DELETE" });
                          const data = (await response.json()) as { error?: string };
                          if (!response.ok) {
                            throw new Error(data.error ?? "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete feedback
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {currentUser ? (
          <form
            className="space-y-2"
            onSubmit={(event) => {
              event.preventDefault();
              runAction("feedback", async () => {
                await submitJson(`/api/activities/${activity.id}/feedback`, "POST", feedback);
                setFeedback({ summary: "", whatWorked: "", whatToImprove: "" });
              });
            }}
          >
            <input
              className="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Quick summary"
              value={feedback.summary}
              onChange={(event) => setFeedback((prev) => ({ ...prev, summary: event.target.value }))}
              required
            />
            <textarea
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="What worked"
              value={feedback.whatWorked}
              onChange={(event) => setFeedback((prev) => ({ ...prev, whatWorked: event.target.value }))}
              required
            />
            <textarea
              className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="What to improve"
              value={feedback.whatToImprove}
              onChange={(event) => setFeedback((prev) => ({ ...prev, whatToImprove: event.target.value }))}
              required
            />
            <Button size="sm" type="submit" disabled={busy === "feedback"}>
              {busy === "feedback" ? "Saving..." : "Add feedback"}
            </Button>
          </form>
        ) : null}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </section>
  );
}
