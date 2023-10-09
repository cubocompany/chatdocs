"use client";

import { ArrowRight } from "lucide-react";

import { trpc } from "@/app/_trpc/client";

import { Button } from "./ui/button";

export function UpgradeButton() {
  const { mutate: createStripeSession } = trpc.createStripeSession.useMutation({
    onSuccess: function ({ url }) {
      window.location.href = url ?? "/dashboard/billing";
    },
  });

  return (
    <Button className="w-full" onClick={() => createStripeSession()}>
      Faça o upgrade agora <ArrowRight className="ml-1.5 h-5 w-5" />
    </Button>
  );
}
