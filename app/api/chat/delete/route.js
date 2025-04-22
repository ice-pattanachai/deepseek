import connectDB from "@/settings/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
            const { userId } = getAuth(req);
            const { chatId } = await req.json();

            if (!userId) {
                return NextResponse.json({
                    success: false,
                    message: "User not authenticated",

                });
            }

        
        await connectDB();
        await Chat.deleteOne({_id: chatId, userId})
        return NextResponse.json({ success: true, message: "Chat deleted successfully"})
    } catch (error) {
        console.log("🚀 ~ GET ~ error: delete", error)
        return NextResponse.json({ success: false, error: error.message, });
    }
}