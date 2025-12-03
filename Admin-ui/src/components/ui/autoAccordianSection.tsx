import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";
import { useAutoAccordion } from "../../hooks/useAutoAccordian";
import { ReactNode } from "react";

interface AutoAccordionSectionProps {
  // title: string;
  children: ReactNode;
  id: string; // or number — depending on how you use it
}

export default function AutoAccordionSection({
  // title,
  children,
  id
}: AutoAccordionSectionProps) {
  const { ref, open } = useAutoAccordion(0.4);
  

  return (
    <div ref={ref} className="my-4">
      <Accordion type="single" collapsible value={open ? id : undefined}>
        <AccordionItem value={id}>
          {/* <AccordionTrigger className="text-lg font-semibold">
            {title}
          </AccordionTrigger> */}
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
