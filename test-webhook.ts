import { POST } from "./src/app/api/telegram/webhook/route.ts";

async function test() {
  const req = new Request("http://localhost:3000/api/telegram/webhook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      update_id: 12345,
      message: {
        message_id: 1,
        from: { id: 111, is_bot: false, first_name: "Test" },
        chat: { id: 111, type: "private" },
        date: 1620000000,
        text: "/start"
      }
    })
  });

  const res = await POST(req);
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}
test();
