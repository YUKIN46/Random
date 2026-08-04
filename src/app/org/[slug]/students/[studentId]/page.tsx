import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import EditStudentForm from "./edit-student-form";
import DeleteStudentButton from "./delete-student-button";
import GuardiansSection from "./guardians-section";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ slug: string; studentId: string }>;
}) {
  const { slug, studentId } = await params;
  await requireRole(slug, ["ORG_ADMIN", "TEACHER"]);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      user: true,
      section: { include: { schoolClass: true } },
      attendance: { orderBy: { date: "desc" }, take: 10 },
      examResults: { include: { exam: { include: { subject: true } } }, orderBy: { exam: { examDate: "desc" } }, take: 10 },
      invoices: { orderBy: { dueDate: "desc" }, take: 10 },
      guardians: { include: { parentUser: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!student || student.organizationId !== org.id) notFound();

  const sections = await prisma.section.findMany({
    where: { organizationId: org.id },
    include: { schoolClass: true },
  });

  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePct = student.attendance.length
    ? Math.round((presentCount / student.attendance.length) * 100)
    : null;

  return (
    <div>
      <Link href={`/org/${slug}/students`} className="font-mono text-xs uppercase tracking-wider text-slate hover:text-ink">
        ← Back to students
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{student.user.name}</h1>
          <p className="font-mono text-xs text-slate">{student.user.email}</p>
        </div>
        <DeleteStudentButton slug={slug} studentId={student.id} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Details</h2>
          <EditStudentForm
            slug={slug}
            studentId={student.id}
            sections={sections.map((s) => ({ id: s.id, label: `${s.schoolClass.name} - ${s.name}` }))}
            initial={{
              sectionId: student.sectionId ?? "",
              admissionNo: student.admissionNo ?? "",
              dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().slice(0, 10) : "",
              guardianName: student.guardianName ?? "",
              guardianPhone: student.guardianPhone ?? "",
              guardianEmail: student.guardianEmail ?? "",
              address: student.address ?? "",
            }}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Guardians</h2>
            <GuardiansSection
              slug={slug}
              studentId={student.id}
              guardians={student.guardians.map((g) => ({
                id: g.id,
                name: g.parentUser.name,
                email: g.parentUser.email,
                relationship: g.relationship ?? "",
              }))}
            />
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">
              Attendance{" "}
              {attendancePct !== null && (
                <span className="font-mono text-sm font-normal text-slate">({attendancePct}% present, last {student.attendance.length})</span>
              )}
            </h2>
            <div className="rounded-lg border border-line bg-paper-raised overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {student.attendance.map((a) => (
                    <tr key={a.id} className="border-t border-line first:border-t-0">
                      <td className="px-4 py-2 text-slate">{a.date.toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-ink">{a.status}</td>
                    </tr>
                  ))}
                  {student.attendance.length === 0 && (
                    <tr><td className="px-4 py-4 text-center text-slate">No records yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Exam results</h2>
            <div className="rounded-lg border border-line bg-paper-raised overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {student.examResults.map((r) => (
                    <tr key={r.id} className="border-t border-line first:border-t-0">
                      <td className="px-4 py-2 text-ink">{r.exam.name}</td>
                      <td className="px-4 py-2 text-slate">{r.exam.subject.name}</td>
                      <td className="px-4 py-2 text-ink">{r.marksObtained}/{r.exam.maxMarks}</td>
                      <td className="px-4 py-2 font-mono text-ink">{r.grade ?? "—"}</td>
                    </tr>
                  ))}
                  {student.examResults.length === 0 && (
                    <tr><td className="px-4 py-4 text-center text-slate">No results yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink mb-3">Invoices</h2>
            <div className="rounded-lg border border-line bg-paper-raised overflow-hidden">
              <table className="w-full text-sm">
                <tbody>
                  {student.invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-line first:border-t-0">
                      <td className="px-4 py-2 text-slate">{inv.dueDate.toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-ink">${inv.amountDue.toFixed(2)}</td>
                      <td className="px-4 py-2 font-mono text-ink">{inv.status}</td>
                    </tr>
                  ))}
                  {student.invoices.length === 0 && (
                    <tr><td className="px-4 py-4 text-center text-slate">No invoices yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
