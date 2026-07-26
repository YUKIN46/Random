import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import NewNoteForm from "./new-note-form";
import DeleteNoteButton from "./delete-note-button";

export default async function NotesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const notes = await prisma.note.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Notes & Announcements</h1>
      <NewNoteForm slug={slug} />
      <div className="space-y-3 mt-6">
        {notes.map((n) => (
          <div key={n.id} className="bg-paper-raised border border-line rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-ink">{n.title}</p>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-xs text-slate">{n.visibility}</span>
                {(n.authorId === user.id || user.role === "ORG_ADMIN" || user.role === "SUPER_ADMIN") && (
                  <DeleteNoteButton slug={slug} noteId={n.id} />
                )}
              </div>
            </div>
            <p className="text-sm text-slate mt-1 whitespace-pre-wrap">{n.content}</p>
            <p className="text-xs text-slate mt-2">{n.createdAt.toLocaleString()}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-slate">No notes yet.</p>}
      </div>
    </div>
  );
}
