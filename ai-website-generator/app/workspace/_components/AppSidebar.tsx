"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const [projectList, setProjectList] = useState<any[]>([]);
  const { userDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState(false);
  const { has } = useAuth();
  useEffect(() => {
    GetProjectList();
  }, []);

  const hasUnlimitedAccess = has && has({ plan: 'unlimited' })

  const GetProjectList = async () => {
    try {
      setLoading(true);
      const result = await axios.get("/api/get-all-projects");
      setProjectList(result.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar className="h-screen z-50">
      <SidebarHeader>
        <div className="flex gap-1 items-center">
          <Image
            src="/logo.svg"
            alt="logo"
            width={35}
            height={35}
            style={{ height: "auto" }}
          />
          <h2 className="font-bold text-xl">PromptUX</h2>
        </div>

        <Link href="/workspace" className="mt-5 w-full">
          <Button className="w-full flex items-center gap-2">
            Add New Project <PlusIcon size={18} />
          </Button>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>

          {!loading && projectList.length === 0 && (
            <h2 className="text-sm px-2 text-gray-500">No Projects found</h2>
          )}

          <div>
            {!loading && projectList.length > 0
              ? projectList.map((item, index) => {
                const title =
                  item?.chats?.[0]?.chatMessage?.[0]?.content || "Untitled";
                return (
                  <Link
                    href={`/playground/${item.projectId}?frameId=${item.frameId}`}
                    key={index}
                    className="my-2 hover:bg-secondary p-2 rounded-lg cursor-pointer block"
                  >
                    <h2 className="line-clamp-1">{title}</h2>
                  </Link>
                );
              })
              : [1, 2, 3, 4, 5].map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-full h-10 rounded-lg m-2"
                />
              ))}
          </div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!hasUnlimitedAccess && <div className="p-3 border rounded-xl space-y-3 bg-secondary">
          <h2 className="flex justify-between items-center">
            Remaining credits:
            <span className="font-bold">{userDetail?.credits ?? 0}</span>
          </h2>

          <Progress value={(userDetail?.credits / 2) * 100} />
          <Link href={'/workspace/pricing'} className="w-full">
            <Button className="w-full cursor-pointer">Upgrade to Unlimited</Button>
          </Link>
        </div>}

        <div className="mt-1 flex items-center gap-2">
          <UserButton showName afterSignOutUrl="/sign-in" />
          <Button variant="ghost" className="cursor-pointer">
            Settings
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
