"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { PlusIcon, MinusIcon } from "@/components/icons";
import type { FaqItem } from "@/content/data";

/**
 * One open at a time, animated height over --duration-base.
 * The plus becomes a minus rather than rotating a chevron — quieter.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <Accordion.Root type="single" collapsible className="w-full">
      {items.map((item, i) => (
        <Accordion.Item
          key={item.question}
          value={`item-${i}`}
          className="border-b border-ink-12 first:border-t"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-start justify-between gap-6 py-6 text-left">
              <span className="text-d4 text-ink">{item.question}</span>
              <span
                aria-hidden="true"
                className="mt-1 grid h-6 w-6 shrink-0 place-items-center text-ink-55"
              >
                <PlusIcon className="h-4 w-4 group-data-[state=open]:hidden" />
                <MinusIcon className="hidden h-4 w-4 group-data-[state=open]:block" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[acc-up_320ms_cubic-bezier(0.22,1,0.36,1)] data-[state=open]:animate-[acc-down_320ms_cubic-bezier(0.22,1,0.36,1)]">
            <p className="measure pb-7 pr-10 text-ink-70">{item.answer}</p>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
