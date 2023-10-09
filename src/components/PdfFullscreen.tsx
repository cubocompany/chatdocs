import { useState } from "react";

import { Expand, Loader2 } from "lucide-react";
import { Document, Page } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";
import SimpleBar from "simplebar-react";

import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useToast } from "./ui/use-toast";

type PdfFullscreenProps = {
  fileUrl: string;
};

export function PdfFullscreen({ fileUrl }: PdfFullscreenProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();

  const { toast } = useToast();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(visibility) => {
        if (!visibility) {
          setIsOpen(visibility);
        }
      }}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-7xl">
        <SimpleBar autoHide={false} className="mt-6 max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              file={fileUrl}
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Erro ao carregar PDF",
                  description:
                    "Por favor, tente novamente em alguns instantes.",
                  variant: "destructive",
                });
              }}
              onLoadSuccess={({ numPages }) => {
                setNumPages(numPages);
              }}
              className="max-h-full">
              {new Array(numPages).fill(0).map((_, index) => (
                <Page
                  key={index}
                  width={width ? width : 1}
                  pageNumber={index + 1}
                />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
}
