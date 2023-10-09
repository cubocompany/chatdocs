"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";

import { trpc } from "@/app/_trpc/client";
import { getUserSubscriptionPlan } from "@/lib/stripe";

import { MaxWidthWrapper } from "./MaxWidthWrapper";
import { Button } from "./ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useToast } from "./ui/use-toast";

type BillingFormProps = {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
};

export function BillingForm({ subscriptionPlan }: BillingFormProps) {
  const { toast } = useToast();

  const { mutate: createStripeSession, isLoading } =
    trpc.createStripeSession.useMutation({
      onSuccess: function ({ url }) {
        if (url) {
          window.location.href = url;
        }

        if (!url) {
          toast({
            title: "Ocorreu um erro ao carregar os dados",
            description: "Por favor, tente novamente em alguns instantes",
            variant: "destructive",
          });
        }
      },
    });

  return (
    <MaxWidthWrapper className="max-w-5xl">
      <form
        className="mt-12"
        onSubmit={(e) => {
          e.preventDefault();
          createStripeSession();
        }}>
        <Card>
          <CardHeader>
            <CardTitle>Minha assinatura</CardTitle>
            <CardDescription>
              Atualmente você está no plano{" "}
              <strong>{subscriptionPlan.name}.</strong>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
            <Button type="submit">
              {isLoading ? (
                <Loader2 className="mr-4 h-4 w-4 animate-spin" />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? "Gerenciar assinatura"
                : "Fazer upgrade para o PRO"}
            </Button>
            {subscriptionPlan.isSubscribed ? (
              <p className="rounded-full text-xs font-medium">
                {subscriptionPlan.isCanceled
                  ? "Seu plano foi cancelado em "
                  : "Seu plano será renovado em "}
                {format(subscriptionPlan.stripeCurrentPeriodEnd!, "dd.MM.yyyy")}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  );
}
