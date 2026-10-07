import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LogOut, MessageSquare, Trophy, Wallet, ClipboardList } from "lucide-react";
import { useEffect } from "react";

import { ChatPanel } from "@/components/admin/chat-panel";
import { SectionPanel } from "@/components/admin/section-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Cadarcq Technologies" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useMe();

  // Not logged in -> login page.
  useEffect(() => {
    if (!isLoading && !me) void navigate({ to: "/admin/login" });
  }, [isLoading, me, navigate]);

  async function logout() {
    try {
      await api.logout();
    } finally {
      queryClient.clear();
      queryClient.setQueryData(["me"], null);
      await navigate({ to: "/admin/login" });
    }
  }

  if (isLoading || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isOwner = me.role === "owner";

  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-20 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.24em] text-primary">Company updates</p>
          <h1 className="mt-3 font-display text-3xl font-black sm:text-4xl">
            Welcome, <span className="text-primary">{me.displayName}</span>
          </h1>
          <div className="mt-3">
            <Badge variant="outline" className="uppercase tracking-widest">
              {isOwner ? "Owner · can add & delete" : "Admin · view only"}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut /> Log out
        </Button>
      </div>

      <Tabs defaultValue="work" className="mt-8">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-4">
          <TabsTrigger value="work" className="gap-2 py-2.5">
            <ClipboardList className="h-4 w-4" /> Next Work
          </TabsTrigger>
          <TabsTrigger value="funding" className="gap-2 py-2.5">
            <Wallet className="h-4 w-4" /> Funding
          </TabsTrigger>
          <TabsTrigger value="competition" className="gap-2 py-2.5">
            <Trophy className="h-4 w-4" /> Competitions
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2 py-2.5">
            <MessageSquare className="h-4 w-4" /> Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work" className="mt-6">
          <SectionPanel
            section="work"
            heading="Next work assigned"
            description="Latest tasks and assignments for the team."
            isOwner={isOwner}
          />
        </TabsContent>
        <TabsContent value="funding" className="mt-6">
          <SectionPanel
            section="funding"
            heading="Funding applied & status"
            description="Grants and funding applications, with their current status."
            isOwner={isOwner}
          />
        </TabsContent>
        <TabsContent value="competition" className="mt-6">
          <SectionPanel
            section="competition"
            heading="Competition updates"
            description="Competitions we are entering or tracking."
            isOwner={isOwner}
          />
        </TabsContent>
        <TabsContent value="chat" className="mt-6">
          <ChatPanel me={me} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
