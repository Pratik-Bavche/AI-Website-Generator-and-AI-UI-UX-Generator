"use client";
import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export type Messages = {
  role: string;
  content: string;
};

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Messages[];
};

const getPrompt = (userInput: string) => `userInput: ${userInput}
Instructions:
If the user input is explicitly asking to generate code, design, or HTML/CSS/JS output (e.g., "Create a landing page", "Build a dashboard", "Generate HTML Tailwind CSS code"), then:
Generate a complete HTML Tailwind CSS code using Flowbite UI components.
Use a modern design with blue as the primary color theme.
- Only include the <body> content (do not add <head> or <title>).
- Make it fully responsive for all screen sizes.
- All primary components must match the theme color.
- Add proper padding and margin for each element.
- Components should be independent; do not connect them.
- Use dynamic AI-generated images using Pollinations AI:
  - Format: https://image.pollinations.ai/prompt/[description]
  - Example: https://image.pollinations.ai/prompt/business-meeting-office
  - Ensure the description in the URL matches the context of the image.
  - Add alt tag describing the image prompt.
- Use the following libraries/components where appropriate:
  - FontAwesome icons (fa fa-)
  - Flowbite UI components: buttons, modals, forms, tables, tabs, alerts, cards, dialogs, dropdowns, accordions, etc.
  - Chart.js for charts & graphs
  - Swiper.js for sliders/carousels
  - Tippy.js for tooltips & popovers
- Include interactive components like modals, dropdowns, and accordions.
- Ensure proper spacing, alignment, hierarchy, and theme consistency.
- Ensure charts are visually appealing and match the theme color.
- Header menu options should be spread out and not connected.
- Do not include broken links.
- Do not add any extra text before or after the HTML code.

If the user input is general text or greetings (e.g., "Hi", "Hello", "How are you?") or does not explicitly ask to generate code, then:
- Respond with a simple, friendly text message instead of generating any code.

Example:
- User: "Hi" > Response: "Hello! How can I help you today?"
- User: "Build a responsive landing page with Tailwind CSS" > Response: [Generate full HTML code as per instructions above]`;

const Playground = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const frameId = searchParams.get("frameId");
  const projectId = params.projectId as string;

  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>("");

  useEffect(() => {
    if (frameId) GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    try {
      const result = await axios.get(
        `/api/frames?frameId=${frameId}&projectId=${projectId}`
      );

      if (!result?.data) {
        console.error("No frame data found.");
        return;
      }

      const data = result.data;
      setFrameDetail(data);

      const designCode = data?.designCode || "";

      if (designCode && designCode.includes("```html")) {
        const startIndex = designCode.indexOf("```html") + 7;
        const endIndex = designCode.lastIndexOf("```");
        const formattedCode =
          endIndex > startIndex
            ? designCode.slice(startIndex, endIndex)
            : designCode.slice(startIndex);
        setGeneratedCode(formattedCode.trim());
      } else {
        setGeneratedCode(designCode.trim());
      }

      // if only one message — auto-generate response
      if (data?.chatMessages?.length === 1) {
        const msg = data.chatMessages[0].content;
        sendMessage(msg);
      } else {
        setMessages(data?.chatMessages || []);
      }
    } catch (error) {
      console.error("Error fetching frame details:", error);
    }
  };

  const sendMessage = async (userInput: string) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: userInput }]);

    try {
      const formattedPrompt = getPrompt(userInput);
      const response = await fetch("/api/ai-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: formattedPrompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Unknown error",
        }));
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      if (!response.body) throw new Error("No response body received");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let aiResponse = "";
      let isCode = false;
      let codeContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        if (!isCode && aiResponse.includes("```html")) {
          isCode = true;
          const startIndex = aiResponse.indexOf("```html") + 7;
          codeContent = aiResponse.slice(startIndex);
          setGeneratedCode(codeContent);
        } else if (isCode) {
          codeContent += chunk;
          setGeneratedCode(codeContent);
        }
      }

      await SaveGeneratedCode(aiResponse);

      if (isCode) {
        const endIndex = codeContent.indexOf("```");
        const finalCode =
          endIndex !== -1 ? codeContent.slice(0, endIndex) : codeContent;
        setGeneratedCode(finalCode.trim());
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Your code is ready!" },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiResponse },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      SaveMessages();
    }
  }, [messages]);

  const SaveMessages = async () => {
    try {
      const result = await axios.put("/api/chats", {
        messages: messages,
        frameId: frameId,
      });
      console.log("Messages saved:", result.data);
    } catch (err) {
      console.error("Error saving messages:", err);
    }
  };

  const SaveGeneratedCode = async (code: string) => {
    try {
      const result = await axios.put("/api/frames", {
        designCode: code,
        frameId: frameId,
        projectId: projectId,
      });
      console.log(result.data);
      toast.success("Website is ready!");
    } catch (error) {
      console.error("Error saving code:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PlaygroundHeader />
      <div className="flex flex-1 overflow-hidden">
        <ChatSection
          loading={loading}
          messages={messages}
          onSend={(input: string) => sendMessage(input)}
        />
        <div className="flex-1 overflow-hidden">
          <WebsiteDesign generatedCode={generatedCode} />
        </div>
      </div>
    </div>
  );
};

export default Playground;
