"use client";

import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

import { trpc } from "@/app/_trpc/client";

import { ChatContextProvider } from "./ChatContext";
import { ChatInput } from "./ChatInput";
import { Messages } from "./Messages";
import { buttonVariants } from "../ui/button";

type ChatWrapperProps = {
  fileId: string;
};

export function ChatWrapper({ fileId }: ChatWrapperProps) {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    { fileId },
    {
      refetchInterval: (data) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    },
  );

  if (isLoading)
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Carregando...</h3>
            <p className="text-sm text-zinc-500">Estamos preparando seu PDF.</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "PROCESSING") {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <h3 className="text-xl font-semibold">Processando PDF...</h3>
            <p className="text-sm text-zinc-500">
              Isso não deve demorar muito.
            </p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  if (data?.status === "FAILED") {
    return (
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28 flex flex-1 flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="text-xl font-semibold">PDF com muitas páginas...</h3>
            <p className="text-sm text-zinc-500">
              Seu plano <span className="font-medium">Grátis</span> suporta
              apenas documentos de até 5 páginas.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}>
              <ChevronLeft className="mr-1.5 h-3 w-3" />
              Voltar
            </Link>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );
  }

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative flex min-h-full flex-col justify-between gap-2 divide-y divide-zinc-200 bg-zinc-50">
        <div className="mb-28  flex flex-1 flex-col justify-between">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
}
