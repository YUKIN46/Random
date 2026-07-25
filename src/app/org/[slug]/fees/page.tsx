import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import NewInvoiceForm from "./new-invoice-form";
import PayButton from "./pay-button";

export default async function FeesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const isStaff = ["ORG_ADMIN", "ACCOUNTANT"].includes(user.role);

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: org.id,
      ...(isStaff ? {} : { student: { userId: user.id } }),
    },
    include: { student: { include: { user: true } } },
    orderBy: { dueDate: "desc" },
  });

  const students = isStaff
    ? await prisma.student.findMany({
        where: { organizationId: org.id },
        include: { user: true },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Fees & Billing</h1>

      {isStaff && (
        <NewInvoiceForm
          slug={slug}
          students={students.map((s) => ({ id: s.id, name: s.user.name }))}
        />
      )}

      <div className="bg-white border border-neutral-200 rounded-xl mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Amount due</th>
              <th className="px-4 py-3 font-medium">Paid</th>
              <th className="px-4 py-3 font-medium">Due date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {isStaff && <th className="px-4 py-3 font-medium" />}
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{inv.student.user.name}</td>
                <td className="px-4 py-3">${inv.amountDue.toFixed(2)}</td>
                <td className="px-4 py-3">${inv.amountPaid.toFixed(2)}</td>
                <td className="px-4 py-3">{inv.dueDate.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                {isStaff && (
                  <td className="px-4 py-3">
                    {inv.status !== "PAID" && <PayButton slug={slug} invoiceId={inv.id} remaining={inv.amountDue - inv.amountPaid} />}
                  </td>
                )}
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={isStaff ? 6 : 5} className="px-4 py-6 text-center text-neutral-400">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "bg-emerald-50 text-emerald-700",
    UNPAID: "bg-amber-50 text-amber-700",
    PARTIAL: "bg-blue-50 text-blue-700",
    OVERDUE: "bg-red-50 text-red-700",
    CANCELLED: "bg-neutral-100 text-neutral-500",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
