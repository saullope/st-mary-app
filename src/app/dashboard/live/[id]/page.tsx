import { redirect } from "next/navigation";
import getCurrentUser from "@/lib/auth/getCurrentUser";
import prisma from "@/lib/db";
import LiveDashboardClient from "./LiveDashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Panel en Vivo | LudiGame",
};

export default async function LiveDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login");
  }

  const sessionId = BigInt(resolvedParams.id);
  const session = await (prisma as any).lUDI_SESION.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    redirect("/dashboard/my-activities");
  }

  // Verify that the current user is the teacher who created this session
  if (session.userId !== user.id) {
    redirect("/dashboard/my-activities");
  }

  return (
    <LiveDashboardClient sessionId={resolvedParams.id} />
  );
}
