import { db } from "@/config/db";
import { chatTable, frameTable, projectTable, usersTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//it fetch the current user using currentUser from clerk
//if it exists it creates a new project, frame and chat message in the database
//if not create new user with default credits
export async function POST(req:NextRequest) {
    try {
        const {projectId,frameId,messages,credits}=await req.json();
        const user=await currentUser();
        const {has}=await auth()
        const hasUnlimitedAccess = has&&has({ plan: 'unlimited' })
        if (!user) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        if (!projectId || !frameId || !messages) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Validate and parse credits
        const parsedCredits = typeof credits === 'number' ? credits : parseInt(credits, 10);
        if (isNaN(parsedCredits)) {
            return NextResponse.json({ error: "Invalid credits value" }, { status: 400 });
        }

        //create project
        const projectResult=await db.insert(projectTable).values({
            projectId:projectId,
            createdBy:user.primaryEmailAddress?.emailAddress
        })

        //create frame
        const frameResult=await db.insert(frameTable).values({
            frameId:frameId,
            projectId:projectId
        })

        //create user message
        const chatResult=await db.insert(chatTable).values({
            chatMessage:messages,
            frameId:frameId,
            createdBy:user.primaryEmailAddress?.emailAddress
        })

        //Update user credits
        if(!hasUnlimitedAccess)
        {
            const userResult=await db.update(usersTable).set({
                credits:parsedCredits-1
                //@ts-ignore
            }).where(eq(usersTable.email,user?.primaryEmailAddress?.emailAddress))
        }

        return NextResponse.json({
            projectId,frameId,messages
        })
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}