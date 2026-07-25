import Link from "next/link";

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-semibold tracking-tight mb-3">
        School Management System
      </h1>
      <p className="text-neutral-500 max-w-md mb-8">
        One platform for every school. Attendance, grades, timetables, fees,
        and announcements — organized per school, each on its own subdomain.
      </p>
      <div className="flex gap-3">
        <Link href="/apply" className="rounded-lg bg-neutral-900 text-white px-5 py-2.5 font-medium">
          Register your school
        </Link>
        <Link href="/login" className="rounded-lg border border-neutral-300 px-5 py-2.5 font-medium">
          Log in
        </Link>
      </div>
    </main>
  );
}
