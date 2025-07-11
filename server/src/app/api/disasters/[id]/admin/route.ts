import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabaseServer";
import { getAuthenticatedUser } from "@/lib/authMiddlware";
import { withCorsHeaders } from "@/lib/withCors";
import { liveKitEmitter } from "@/lib/livekitEmitter";

type UpdateReportPayload = {
  verification_status: "verified" | "rejected" | "pending";
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return withCorsHeaders(
        new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
      );
    }

    if (user.role !== "admin") {
      return withCorsHeaders(
        new Response(JSON.stringify({ error: "Forbidden – admin only" }), { status: 403 })
      );
    }

    const disaster_id = params.id;
    const body: UpdateReportPayload & { reportId: string } = await req.json();
    const { reportId } = body;

    if (!["verified", "rejected", "pending"].includes(body.verification_status)) {
      return withCorsHeaders(
        new Response(JSON.stringify({ error: "Invalid status" }), { status: 400 })
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .update({ verification_status: body.verification_status })
      .eq("id", reportId)
      .eq("disaster_id", disaster_id)
      .select("*")
      .single();

    if (error) {
      console.error("Update report error:", error.message);
      return withCorsHeaders(
        new Response(JSON.stringify({ error: error.message }), { status: 500 })
      );
    }

    // Invalidate cache
    await supabase.from("cache").delete().eq("key", `reports:verified:${disaster_id}`);

    // Send real-time update
    await liveKitEmitter(`disaster-${disaster_id}`, {
      type: "report_updated",
      data: {
        disaster_id,
        report_id: data.id,
        content: data.content,
        user_id: data.user_id,
        image_url: data.image_url,
        verification_status: data.verification_status,
        created_at: data.created_at,
      },
    });

    return withCorsHeaders(
      new Response(JSON.stringify(data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (err) {
    console.error("PATCH /reports error:", err);
    return withCorsHeaders(
      new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 })
    );
  }
}
