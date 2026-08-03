export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { status: "ok", service: "takeasweet-web" },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
