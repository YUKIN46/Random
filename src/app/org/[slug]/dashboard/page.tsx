import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const isStaff = ["ORG_ADMIN", "TEACHER", "ACCOUNTANT"].includes(user.role);

  if (isStaff) {
    return <StaffDashboard organizationId={org.id} />;
  }

  // STUDENT or PARENT: show their own snapshot
  const student = await prisma.student.findUnique({
    where: { userId: user.id },
    include: {
      section: { include: { schoolClass: true } },
      attendance: { orderBy: { date: "desc" }, take: 30 },
      invoices: { where: { status: { in: ["UNPAID", "PARTIAL", "OVERDUE"] } } },
      examResults: { include: { exam: { include: { subject: true } } }, orderBy: { exam: { examDate: "desc" } }, take: 5 },
    },
  });

  if (!student) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-2">Welcome</h1>
        <p className="text-neutral-500">
          No student profile is linked to your account yet. Contact your school
          admin if this seems wrong.
        </p>
      </div>
    );
  }

  const presentCount = student.attendance.filter((a) => a.status === "PRESENT").length;
  const attendancePct = student.attendance.length
    ? Math.round((presentCount / student.attendance.length) * 100)
    : null;
  const totalDue = student.invoices.reduce((sum, i) => sum + (i.amountDue - i.amountPaid), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
      <p className="text-neutral-500 mb-6">
        {student.section ? `${student.section.schoolClass.name} - ${student.section.name}` : "No section assigned"}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">Attendance (last 30 records)</p>
          <p className="text-3xl font-semibold mt-1">{attendancePct !== null ? `${attendancePct}%` : "—"}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">Outstanding fees</p>
          <p className="text-3xl font-semibold mt-1">${totalDue.toFixed(2)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <p className="text-sm text-neutral-500">Recent exams</p>
          <p className="text-3xl font-semibold mt-1">{student.examResults.length}</p>
        </div>
      </div>

      <h2 className="text-lg font-medium mb-3">Recent exam results</h2>
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Exam</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Marks</th>
              <th className="px-4 py-3 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody>
            {student.examResults.map((r) => (
              <tr key={r.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{r.exam.name}</td>
                <td className="px-4 py-3">{r.exam.subject.name}</td>
                <td className="px-4 py-3">{r.marksObtained} / {r.exam.maxMarks}</td>
                <td className="px-4 py-3">{r.grade ?? "—"}</td>
              </tr>
            ))}
            {student.examResults.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">No results yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function StaffDashboard({ organizationId }: { organizationId: string }) {
  const [studentCount, teacherCount, unpaidInvoices, todayAttendance] = await Promise.all([
    prisma.student.count({ where: { organizationId } }),
    prisma.teacher.count({ where: { organizationId } }),
    prisma.invoice.count({ where: { organizationId, status: { in: ["UNPAID", "OVERDUE", "PARTIAL"] } } }),
    prisma.attendanceRecord.count({
      where: {
        organizationId,
        date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        status: "PRESENT",
      },
    }),
  ]);

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Teachers", value: teacherCount },
    { label: "Outstanding invoices", value: unpaidInvoices },
    { label: "Present today", value: todayAttendance },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="text-3xl font-semibold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
