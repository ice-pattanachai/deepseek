import { Webhook, WebhookVerificationError } from "svix";
import connectDB from "@/settings/db"; // สมมติว่า connectDB จัดการ error ภายในได้ดีแล้ว
import User from "@/models/User"; // สมมติว่า User model มี schema ที่เหมาะสม
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface SvixUserPayload {
  id: string;
  email_addresses: { id: string; email_address: string }[]; // Clerk อาจมีหลาย email
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

interface UserDataInput {
  _id: string;
  email: string; 
  name: string;
  image: string;
}

const WEBHOOK_SECRET = process.env.SIGNING_SECRET;

export async function POST(req: NextRequest): Promise<NextResponse> {
// 1. ตรวจสอบ Secret Key ก่อน
  if (!WEBHOOK_SECRET) {
    console.error("Error: SIGNING_SECRET environment variable not set.");
    return NextResponse.json(
      { success: false, message: "Internal Server Configuration Error" },
      { status: 500 }
    );
  }

  // 2. ดึง Headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // ตรวจสอบว่ามี Headers ครบหรือไม่
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn("Webhook verification failed: Missing svix headers.");
    return NextResponse.json(
      { success: false, message: "Missing required headers" },
      { status: 400 }
    );
  }

  const svixHeaders = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  // 3. อ่านและ Parse Payload
  let payload: any;
  let body: string;
  try {
    payload = await req.json();
    body = JSON.stringify(payload); // ใช้ body ที่เป็น string สำหรับ verify
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 }
    );
  }

  // 4. ตรวจสอบ Signature (Verify Webhook)
  const wh = new Webhook(WEBHOOK_SECRET);
  let msg: { data: SvixUserPayload; type: string };
  try {
    msg = wh.verify(body, svixHeaders) as { data: SvixUserPayload; type: string };
  } catch (err) {
    let errorMessage = "Webhook verification failed.";
    let statusCode = 400;
    if (err instanceof WebhookVerificationError) {
        errorMessage = err.message;
    } else if (err instanceof Error) {
        errorMessage = err.message;
        statusCode = 500; // Unexpected error
    }
    console.error(`Error verifying webhook: ${errorMessage}`, err);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: statusCode }
    );
  }

  // 5. ประมวลผล Event Type
  const { data, type } = msg;
  const eventType = type;

  // 6. เตรียมข้อมูล User (จัดการค่า null/undefined และเลือก email)
  const primaryEmail = data.email_addresses?.find(
    (email) => email.id === (payload.data?.primary_email_address_id) // Clerk ส่ง primary_email_address_id มาด้วย
  )?.email_address || data.email_addresses?.[0]?.email_address; // Fallback ไปเอาอันแรก

  if (!primaryEmail && (eventType === 'user.created' || eventType === 'user.updated')) {
      console.warn(`Webhook received for user ${data.id} without a valid email address for event type ${eventType}. Skipping DB operation.`);
      // อาจจะ return success หรือ error ขึ้นอยู่กับว่ายอมรับ user ไม่มี email ได้ไหม
      // return NextResponse.json({ success: true, message: "User processed (no email found, skipped DB)." });
       return NextResponse.json({ success: false, message: "User email is required but not found." }, { status: 400 });
  }

  // จัดการชื่อ (ป้องกัน "null undefined")
  const firstName = data.first_name ?? "";
  const lastName = data.last_name ?? "";
  const name = `${firstName} ${lastName}`.trim() || "Unnamed User"; // ให้ default name ถ้าไม่มี

  const userData: UserDataInput = {
    _id: data.id,
    email: primaryEmail!, // ใช้ ! เพราะตรวจสอบแล้วว่ามีค่า (ถ้า event type ต้องการ)
    name: name,
    image: data.image_url,
  };


  // 7. เชื่อมต่อและดำเนินการกับ Database
  try {
    await connectDB();

    switch (eventType) {
      case "user.created":
        console.log(`Webhook received: Creating user ${userData._id}`);
        // ใช้ findOneAndUpdate + upsert เพื่อ Idempotency
        await User.findOneAndUpdate(
            { _id: userData._id }, // query by _id
            { $set: userData },     // data to set on create or update
            { upsert: true, new: true, runValidators: true } // options: create if not exist, return new doc, run schema validation
        );
        console.log(`User ${userData._id} created or updated successfully.`);
        break;

      case "user.updated":
        console.log(`Webhook received: Updating user ${userData._id}`);
        // ตรวจสอบให้แน่ใจว่า userData มี email ก่อนอัปเดต
        if (!userData.email) throw new Error("Email is missing for user update.");
        await User.findByIdAndUpdate(data.id, userData, { new: true, runValidators: true });
        console.log(`User ${userData._id} updated successfully.`);
        break;

      case "user.deleted":
        console.log(`Webhook received: Deleting user ${data.id}`);
        // Clerk อาจส่ง payload ของ user ที่ถูกลบมาเป็น null หรือ {} ในบางกรณี
        // ใช้ data.id ที่ได้จาก msg โดยตรง
        const deletedUser = await User.findByIdAndDelete(data.id);
        if (deletedUser) {
            console.log(`User ${data.id} deleted successfully.`);
        } else {
            console.log(`User ${data.id} not found for deletion (already deleted?).`);
        }
        break;

      default:
        console.log(`Webhook received: Unhandled event type: ${eventType}`);
        // อาจจะ log หรือทำอย่างอื่นตามต้องการ
        break;
    }

    // 8. ส่ง Response สำเร็จ
    return NextResponse.json({ success: true, message: "Webhook processed successfully." });

  } catch (dbError) {
    console.error(`Database operation failed for event ${eventType}, user ${data.id}:`, dbError);
    // ควร log error อย่างละเอียด
    return NextResponse.json(
      { success: false, message: "Database operation failed." },
      { status: 500 }
    );
  }
}
