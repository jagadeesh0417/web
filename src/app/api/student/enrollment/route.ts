import { NextRequest, NextResponse } from "next/server";
import { requireStudentApi } from "@/lib/auth/student-api-guard";
import {
  seedInitialData,
  enrollmentsStore,
  paymentsStore,
  programsStore,
  categoriesStore,
} from "@/lib/data/server-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await requireStudentApi(request as unknown as NextRequest);
  if ("error" in auth) return auth.error;
  await seedInitialData();

  const enrollment = enrollmentsStore.findOne(
    (e) => e.userId === auth.user.id,
  );
  if (!enrollment) {
    return NextResponse.json(
      { error: "No enrollment found" },
      { status: 404 },
    );
  }

  const payment = enrollment.paymentId
    ? paymentsStore.getById(enrollment.paymentId)
    : null;

  const program = programsStore.findOne((p) => p.slug === enrollment.programSlug);
  const category = categoriesStore.findOne((c) => c.slug === enrollment.categorySlug);

  return NextResponse.json({
    enrollment: {
      ...enrollment,
      program: program
        ? { id: program.id, title: program.title, description: program.description, features: program.features, duration: program.duration }
        : null,
      category: category
        ? { id: category.id, slug: category.slug, name: category.name, icon: category.icon }
        : null,
    },
    payment: payment
      ? {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
          invoiceNumber: payment.invoiceNumber,
          createdAt: payment.createdAt,
        }
      : null,
  });
}
