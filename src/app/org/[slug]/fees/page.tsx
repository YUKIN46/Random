import { prisma } from "@/lib/prisma";
import { requireOrgMember } from "@/lib/authz";
import NewInvoiceForm from "./new-invoice-form";
import PayButton from "./pay-button";
import InvoiceCancelButton from "./invoice-cancel-button";
import Pagination from "@/components/pagination";

const PAGE_SIZE = 25;

export default async function FeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const user = await requireOrgMember(slug);
  const org = await prisma.organization.findUniqueOrThrow({ where: { slug } });

  const isStaff = ["ORG_ADMIN", "ACCOUNTANT", "SUPER_ADMIN"].includes(user.role);

  const where = {
    organizationId: org.id,
    ...(isStaff
      ? {}
      : user.role === "PARENT"
      ? { student: { guardians: { some: { parentUserId: user.id } } } }
      : { student: { userId: user.id } }),
  };

  const [invoices, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { student: { include: { user: true } } },
      orderBy: { dueDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const students = isStaff
    ? await prisma.student.findMany({
        where: { organizationId: org.id },
        include: { user: true },
        orderBy: { user: { name: "asc" } },
      })
    : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-6">Fees & Billing</h1>

      {isStaff && (
        <NewInvoiceForm
          slug={slug}
          students={students.map((s) => ({ id: s.id, name: s.user.name }))}
        />
      )}

      <div className="bg-paper-raised border border-line rounded-xl mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-slate">
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
              <tr key={inv.id} className="border-t border-line">
                <td className="px-4 py-3">{inv.student.user.name}</td>
                <td className="px-4 py-3">${inv.amountDue.toFixed(2)}</td>
                <td className="px-4 py-3">${inv.amountPaid.toFixed(2)}</td>
                <td className="px-4 py-3">{inv.dueDate.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                {isStaff && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
                        <PayButton slug={slug} invoiceId={inv.id} remaining={inv.amountDue - inv.amountPaid} />
                      )}
                      {inv.status !== "PAID" && (
                        <InvoiceCancelButton slug={slug} invoiceId={inv.id} cancelled={inv.status === "CANCELLED"} />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={isStaff ? 6 : 5} className="px-4 py-6 text-center text-slate">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath={`/org/${slug}/fees`}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PAID: "bg-chalk/10 text-chalk",
    UNPAID: "bg-brass/10 text-brass-dark",
    PARTIAL: "bg-ink/5 text-ink-soft",
    OVERDUE: "bg-ledger-red/5 text-ledger-red",
    CANCELLED: "bg-line/60 text-slate",
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[status] ?? ""}`}>
      {status}
    </span>
  );
}
