import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId, title, channel, thumbnail } = await request.json();

  if (!videoId || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const recent = await prisma.watchHistory.findFirst({
    where: {
      userId: session.user.id,
      videoId,
      watchedAt: { gte: new Date(Date.now() - 60_000) },
    },
  });

  if (!recent) {
    await prisma.watchHistory.create({
      data: {
        userId: session.user.id,
        videoId,
        title,
        channel: channel || "",
        thumbnail: thumbnail || "",
      },
    });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.watchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { watchedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ history });
}
