import connectDB from "@/settings/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({ 
                success : false ,
                message : "User not authenticated"
            });
        }

        const {chatId, name} = await request.json();
        await connectDB();
        await Chat.findOneAndUpdate({_id : chatId , userId},{name})
        
        return NextResponse.json({ success: true , message: "Chat Renamed" });
    } catch (error) {
        console.log("🚀 ~ POST ~ error: rename", error)
        return NextResponse.json({ success: false , error: error.message });
    }
    
}