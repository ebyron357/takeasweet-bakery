import { Link } from "wouter";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQ_ITEMS } from "@shared/bakery";

export default function Faq() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <div className="text-center">
        <p className="text-secondary-foreground flex items-center justify-center gap-1.5 text-sm font-bold tracking-widest uppercase">
          <HelpCircle className="size-4" /> FAQ
        </p>
        <h1 className="font-display mt-2 text-4xl font-extrabold sm:text-5xl">
          Frequently asked questions
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md">
          Everything you need to know about ordering from TakeASweet. Can't find your answer? Just
          ask!
        </p>
      </div>

      <Accordion type="single" collapsible className="mt-10 w-full">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem key={i} value={`faq-${i}`}>
            <AccordionTrigger className="text-left font-bold">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="bg-muted mt-10 rounded-2xl p-6 text-center">
        <h2 className="font-display text-xl font-bold">Still have a question?</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          We're happy to help with anything not covered here.
        </p>
        <Button asChild className="mt-4 rounded-full font-bold">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
    </div>
  );
}
