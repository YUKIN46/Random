import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import EditTeacherForm from "./edit-teacher-form";
import DeleteTeacherButton from "./delete-teacher-button";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ slug: string; teacherId: string }>;
}) {
  const { slug, teacherId } = await params;
  await requireRole(slug, ["ORG_ADMIN"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: true,
      subjects: { include: { subject: true } },
      sectionsLed: { include: { schoolClass: true } },
    },
  });

  if (!teacher || teacher.organizationId !== org.id) notFound();

  return (
    <div>
      <Link href={`/org/${slug}/teachers`} className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">
        ← Back to teachers
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{teacher.user.name}</h1>
          <p className="font-mono text-xs text-slate">{teacher.user.email}</p>
        </div>
        <DeleteTeacherButton slug={slug} teacherId={teacher.id} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Details</h2>
          <EditTeacherForm
            slug={slug}
            teacherId={teacher.id}
            initial={{
              name: teacher.user.name,
              employeeCode: teacher.employeeCode ?? "",
              phone: teacher.phone ?? "",
            }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Subjects taught</h2>
            <div className="rounded-lg border border-line bg-paper-raised p-4">
              {teacher.subjects.length > 0 ? (
                <ul className="space-y-1 text-sm text-ink">
                  {teacher.subjects.map((s) => <li key={s.id}>{s.subject.name}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-slate">
                  None assigned — manage from Academic Structure.
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Sections led</h2>
            <div className="rounded-lg border border-line bg-paper-raised p-4">
              {teacher.sectionsLed.length > 0 ? (
                <ul className="space-y-1 text-sm text-ink">
                  {teacher.sectionsLed.map((s) => <li key={s.id}>{s.schoolClass.name} - {s.name}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-slate">Not leading any section.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
