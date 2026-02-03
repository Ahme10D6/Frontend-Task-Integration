"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, EllipsisVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const agents = [
  {
    id: "1",
    name: "Sales Assistant",
    description: "Handles inbound sales inquiries and qualifies leads",
    createdAt: "Jan 12, 2025",
    modifiedAt: "Jan 25, 2025",
    type: "inbound" as const,
    model: "Pro" as const,
  },
  {
    id: "2",
    name: "Support Bot",
    description: "Resolves common customer support tickets automatically",
    createdAt: "Dec 5, 2024",
    modifiedAt: "Jan 20, 2025",
    type: "inbound" as const,
    model: "Standard" as const,
  },
  {
    id: "3",
    name: "Outreach Agent",
    description: "Runs outbound cold-call campaigns for lead generation",
    createdAt: "Jan 3, 2025",
    modifiedAt: "Jan 22, 2025",
    type: "outbound" as const,
    model: "Pro" as const,
  },
  {
    id: "4",
    name: "Survey Caller",
    description: "Conducts post-purchase satisfaction surveys",
    createdAt: "Nov 18, 2024",
    modifiedAt: "Jan 10, 2025",
    type: "outbound" as const,
    model: "Flex" as const,
  },
  {
    id: "5",
    name: "Appointment Setter",
    description: "Books and confirms appointments with prospects",
    createdAt: "Jan 8, 2025",
    modifiedAt: "Jan 24, 2025",
    type: "outbound" as const,
    model: "Standard" as const,
  },
  {
    id: "6",
    name: "Retention Agent",
    description: "Reaches out to churning customers with retention offers",
    createdAt: "Jan 15, 2025",
    modifiedAt: "Jan 26, 2025",
    type: "outbound" as const,
    model: "Pro" as const,
  },
  {
    id: "7",
    name: "Billing Helper",
    description: "Answers billing questions and processes refund requests",
    createdAt: "Dec 20, 2024",
    modifiedAt: "Jan 18, 2025",
    type: "inbound" as const,
    model: "Standard" as const,
  },
  {
    id: "8",
    name: "Onboarding Guide",
    description: "Walks new users through product setup and first steps",
    createdAt: "Jan 2, 2025",
    modifiedAt: "Jan 23, 2025",
    type: "inbound" as const,
    model: "Flex" as const,
  },
];

const PAGE_SIZE = 5;

const typeVariant: Record<string, "default" | "secondary"> = {
  inbound: "default",
  outbound: "secondary",
};

const modelVariant: Record<string, "default" | "secondary" | "outline"> = {
  Pro: "default",
  Standard: "secondary",
  Flex: "outline",
};

export default function AgentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const totalPages = Math.ceil(agents.length / PAGE_SIZE);
  const paginatedAgents = agents.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agents</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Set up a new AI agent for your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input id="agent-name" placeholder="e.g. Sales Assistant" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-description">Description</Label>
                <Input
                  id="agent-description"
                  placeholder="e.g. Handles inbound sales inquiries"
                />
              </div>
              <div className="space-y-2">
                <Label>Call Type</Label>
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">
                      Inbound (Receive Calls)
                    </SelectItem>
                    <SelectItem value="outbound">
                      Outbound (Make Calls)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button>Create Agent</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search agents..." className="pl-9" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Agent</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Model</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAgents.map((agent) => (
              <TableRow
                key={agent.id}
                className="cursor-pointer"
                onClick={() => router.push(`/agents/${agent.id}/edit`)}
              >
                <TableCell>
                  <div className="font-medium">{agent.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {agent.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">Created {agent.createdAt}</div>
                  <div className="text-sm text-muted-foreground">
                    Modified {agent.modifiedAt}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={typeVariant[agent.type]}>{agent.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={modelVariant[agent.model]}>
                    {agent.model}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <EllipsisVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/agents/${agent.id}/edit`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
