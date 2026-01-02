"use client";
import { Button } from "@/components/ui/button";
import { UserDetailContext } from "@/context/UserDetailContext";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import {
  ArrowUp,
  HomeIcon,
  ImagePlusIcon,
  Key,
  LayoutDashboard,
  Loader,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const suggestion = [
  {
    label: "Dashboard",
    prompt:
      "Create an analytics dashboard to track customers and revenue data for a SaaS",
    icon: LayoutDashboard,
  },
  {
    label: "SignUp Form",
    prompt:
      "Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox",
    icon: Key,
  },
  {
    label: "Hero",
    prompt:
      "Create a modern header and centered hero section for a productivity SaaS. Include a badge for feature announcement, a title with a subtle gradient effect",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a modern user profile card component for a social media website",
    icon: User,
  },
];

const Hero = () => {
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { has } = useAuth();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  const hasUnlimitedAccess = has && has({ plan: 'unlimited' })

  const CreateNewProject = async () => {

    if (!hasUnlimitedAccess && userDetail?.credits! <= 0) {
      toast.error('You have no credits left. Please upgrade your plan')
      return;
    }

    setLoading(true);
    const projectId = uuidv4();
    const frameId = generateRandomFrameNumber();
    const messages = [
      {
        role: "user",
        content: userInput,
      },
    ];
    try {
      const result = await axios.post("/api/projects", {
        projectId: projectId,
        frameId: frameId,
        messages: messages,
        credits: userDetail?.credits
      });
      console.log(result.data);
      toast.success("Project created!");
      router.push(`/playground/${projectId}?frameId=${frameId}`);
      setUserDetail((prev: any) => ({
        ...prev,
        credits: prev?.credits! - 1
      }))
      setLoading(false);
    } catch (error) {
      toast.error("Internal server error");
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-10">
          <Loader className="animate-spin w-10 h-10 mb-2" />
          <span className="text-lg font-medium">Loading, please wait...</span>
        </div>
      )}
      {/* Header & Description */}
      <h2 className="font-bold text-6xl text-center">What should we design</h2>
      <p className="mt-2 text-lg text-gray-500 text-center">
        Generate, Edit & Explore design with AI, Export code as well
      </p>

      {/* Input Box */}
      <div className="w-full max-w-2xl mt-8 p-5 border rounded-2xl shadow-sm">
        <textarea
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe your page design"
          value={userInput}
          className="w-full h-28 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
          disabled={loading}
        ></textarea>
        <div className="flex justify-between items-center mt-3">
          <Button variant="ghost" className="cursor-pointer" disabled={loading}>
            <ImagePlusIcon />
          </Button>
          <Button
            className="cursor-pointer"
            disabled={!userInput || loading}
            onClick={CreateNewProject}
          >
            {loading ? <Loader className="animate-spin" /> : <ArrowUp />}
          </Button>
        </div>
      </div>

      {/* Suggestion List */}
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {suggestion.map((item, index) => (
          <Button
            onClick={() => !loading && setUserInput(item.prompt)}
            key={index}
            variant="outline"
            className="flex items-center gap-2 cursor-pointer"
            disabled={loading}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Hero;

const generateRandomFrameNumber = () => {
  const num = Math.floor(Math.random() * 10000);
  return num;
};
