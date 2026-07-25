import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOrgMember(slug);

  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const [studentCount, teacherCount, unpaidInvoices, todayAttendance] = await Promise.all([
    prisma.student.count({ where: { organizationId: org.id } }),
    prisma.teacher.count({ where: { organizationId: org.id } }),
    prisma.invoice.count({ where: { organizationId: org.id, status: { in: ["UNPAID", "OVERDUE", "PARTIAL"] } } }),
    prisma.attendanceRecord.count({
      where: {
        organizationId: org.id,
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
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
