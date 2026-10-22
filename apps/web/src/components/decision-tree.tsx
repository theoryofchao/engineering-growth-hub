"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, type Edge, type Node, ReactFlow } from "@xyflow/react";
import { useRouter } from "next/navigation";

import { useFetch } from "@/hooks/use-fetch";

type Competency = { id: number; title: string; slug: string; description: string | null };

type QuestionDetail = {
  id: number;
  prompt: string;
  source: "seed" | "custom";
  competency: Competency;
  created_at: string;
};

type StorySummary = {
  id: number;
  title: string;
  competency: Competency;
  result: string;
  created_at: string;
  updated_at: string;
};

const NODE_STYLE_BASE = {
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  border: "1px solid",
  textAlign: "center" as const,
};

/**
 * Renders the question -> competency -> story flow for one behavioral
 * question as a small React Flow graph (ADR 0033). Fixed, hand-placed
 * positions rather than an auto-layout library -- this is always a
 * 3-level tree with a handful of leaves, not a graph that needs one.
 */
export function DecisionTree({ questionId }: { questionId: number }) {
  const router = useRouter();
  const questionState = useFetch<QuestionDetail>(`/api/v1/leadership/questions/${questionId}`);
  const competencyId = questionState.phase === "success" ? questionState.data.competency.id : null;
  const storiesState = useFetch<StorySummary[]>(
    competencyId !== null ? `/api/v1/leadership/stories?competency_id=${competencyId}` : null,
  );

  if (
    questionState.phase === "loading" ||
    (competencyId !== null && storiesState.phase === "loading")
  ) {
    return (
      <p role="status" aria-live="polite" className="text-zinc-600 dark:text-zinc-400">
        Loading…
      </p>
    );
  }

  if (questionState.phase === "not-found") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
      >
        <p className="font-medium">Question not found.</p>
      </div>
    );
  }

  if (questionState.phase !== "success") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load the question.</p>
      </div>
    );
  }

  if (storiesState.phase === "error") {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
      >
        <p className="font-medium">Could not load your stories for this competency.</p>
      </div>
    );
  }

  const question = questionState.data;
  const stories = storiesState.phase === "success" ? storiesState.data : [];

  const nodes: Node[] = [
    {
      id: "question",
      position: { x: 260, y: 0 },
      data: { label: question.prompt },
      style: { ...NODE_STYLE_BASE, width: 260, background: "#f4f4f5", borderColor: "#a1a1aa" },
    },
    {
      id: "competency",
      position: { x: 300, y: 150 },
      data: { label: question.competency.title },
      style: { ...NODE_STYLE_BASE, width: 180, background: "#dbeafe", borderColor: "#60a5fa" },
    },
    ...(stories.length === 0
      ? [
          {
            id: "no-stories",
            position: { x: 280, y: 300 },
            data: { label: "No stories yet — add one" },
            style: {
              ...NODE_STYLE_BASE,
              width: 220,
              background: "#fef3c7",
              borderColor: "#fbbf24",
              cursor: "pointer",
            },
          },
        ]
      : stories.map((story, index) => ({
          id: `story-${story.id}`,
          position: { x: 60 + index * 230, y: 300 },
          data: { label: story.title },
          style: {
            ...NODE_STYLE_BASE,
            width: 200,
            background: "#dcfce7",
            borderColor: "#4ade80",
            cursor: "pointer",
          },
        }))),
  ];

  const edges: Edge[] = [
    { id: "e-question-competency", source: "question", target: "competency" },
    ...(stories.length === 0
      ? [{ id: "e-competency-no-stories", source: "competency", target: "no-stories" }]
      : stories.map((story) => ({
          id: `e-competency-story-${story.id}`,
          source: "competency",
          target: `story-${story.id}`,
        }))),
  ];

  function handleNodeClick(_event: React.MouseEvent, node: Node) {
    if (node.id === "no-stories") {
      router.push("/leadership/stories/new");
    } else if (node.id.startsWith("story-")) {
      router.push(`/leadership/stories/${node.id.slice("story-".length)}`);
    }
  }

  return (
    <div style={{ height: 420 }} className="rounded-lg border border-zinc-300 dark:border-zinc-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
