import React, { createContext, ReactNode, useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

import { useToast } from "../ui/use-toast";

type ChatContextData = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
};

export const ChatContext = createContext<ChatContextData>({
  addMessage: function () {},
  message: "",
  handleInputChange: function () {},
  isLoading: false,
});

type ChatContextProviderProps = {
  fileId: string;
  children: ReactNode;
};

export function ChatContextProvider({
  fileId,
  children,
}: ChatContextProviderProps) {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const utils = trpc.useContext();
  const { toast } = useToast();
  const backupMessage = useRef("");
  const { mutate: sendMessage } = useMutation({
    mutationFn: async function ({ message }: { message: string }) {
      const response = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({ fileId, message }),
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar mensagem");
      }

      return response.body;
    },
    onMutate: async function ({ message }) {
      backupMessage.current = message;
      setMessage("");

      await utils.getFileMessages.cancel();

      const previousMessages = utils.getFileMessages.getInfiniteData();

      utils.getFileMessages.setInfiniteData(
        {
          fileId,
          limit: INFINITE_QUERY_LIMIT,
        },
        function (oldData) {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = [...oldData.pages];
          const latestPage = newPages[0]!;

          latestPage.messages = [
            {
              createdAt: new Date().toISOString(),
              id: crypto.randomUUID(),
              text: message,
              isUserMessage: true,
            },
            ...latestPage.messages,
          ];
          newPages[0] = latestPage;

          return {
            ...oldData,
            pages: newPages,
          };
        },
      );

      setIsLoading(true);

      return {
        previousMessages:
          previousMessages?.pages.flatMap((page) => page.messages) ?? [],
      };
    },
    onSuccess: async function (stream) {
      setIsLoading(false);

      if (!stream) {
        return toast({
          title: "Ocorreu um problema o tentar enviar a mensagem",
          description: "Por favor, atualize a página e tente novamente",
          variant: "destructive",
        });
      }

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();

        done = doneReading;
        const chunkValue = decoder.decode(value);

        accResponse += chunkValue;

        utils.getFileMessages.setInfiniteData(
          { fileId, limit: INFINITE_QUERY_LIMIT },
          function (oldData) {
            if (!oldData) {
              return {
                pages: [],
                pageParams: [],
              };
            }

            const isAiResponseCreated = oldData.pages.some((page) =>
              page.messages.some((message) => message.id === "ai-response"),
            );

            const updatedPages = oldData.pages.map((page) => {
              if (page === oldData.pages[0]) {
                let updatedMessages;

                if (!isAiResponseCreated) {
                  updatedMessages = [
                    {
                      createdAt: new Date().toISOString(),
                      id: "ai-response",
                      text: accResponse,
                      isUserMessage: false,
                    },
                    ...page.messages,
                  ];
                } else {
                  updatedMessages = page.messages.map((message) => {
                    if (message.id === "ai-response") {
                      return {
                        ...message,
                        text: accResponse,
                      };
                    }
                    return message;
                  });
                }

                return {
                  ...page,
                  messages: updatedMessages,
                };
              }

              return page;
            });

            return {
              ...oldData,
              pages: updatedPages,
            };
          },
        );
      }
    },
    onError: function (_, __, context) {
      setMessage(backupMessage.current);
      utils.getFileMessages.setData(
        {
          fileId,
        },
        {
          messages: context?.previousMessages ?? [],
        },
      );
    },
    onSettled: async function () {
      setIsLoading(false);

      await utils.getFileMessages.invalidate({ fileId });
    },
  });

  function addMessage() {
    sendMessage({ message });
  }

  function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
  }

  return (
    <ChatContext.Provider
      value={{
        addMessage,
        message,
        handleInputChange,
        isLoading,
      }}>
      {children}
    </ChatContext.Provider>
  );
}
