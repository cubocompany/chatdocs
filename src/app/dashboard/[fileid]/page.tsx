import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

import { PdfRenderer } from "@/components/PdfRenderer";
import { ChatWrapper } from "@/components/chat/ChatWrapper";
import { db } from "@/db";

type PageProps = {
  params: {
    fileid: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { fileid } = params;

  const { getUser } = getKindeServerSession();

  const user = getUser();

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${fileid}`);
  }

  const file = await db.file.findFirst({
    where: {
      id: fileid,
      userId: user.id,
    },
  });

  if (!file) {
    return notFound();
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-1 flex-col justify-between">
      <div className="max-w-8xl mx-auto w-full grow lg:flex xl:px-2">
        {/* left side */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-4 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>

        {/* right side */}
        <div className="flex-[0.75] shrink-0 border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <ChatWrapper fileId={file.id} />
        </div>
      </div>
    </div>
  );
}
