"use client";

import { useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import type { TripGuide } from "@/types/trip";

const SNAP_POINTS = ["180px", 0.55, 0.92] as const;
const HALF_SNAP = 0.55;

type SnapPoint = (typeof SNAP_POINTS)[number];

export function GuideDrawer({
  guide,
  onBack,
}: {
  guide: TripGuide;
  onBack: () => void;
}) {
  const [activeSnap, setActiveSnap] = useState<SnapPoint>(HALF_SNAP);

  return (
    <DrawerPrimitive.Root
      open={true}
      modal={false}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={activeSnap}
      setActiveSnapPoint={setActiveSnap as (snap: string | number | null) => void}
      fadeFromIndex={2}
      dismissible={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content className="drawer-glass fixed inset-x-0 bottom-0 z-50 flex h-full max-h-[92vh] flex-col rounded-t-2xl border-t border-border/30 outline-none lg:!hidden">
          <DrawerPrimitive.Title className="sr-only">{guide.title}</DrawerPrimitive.Title>
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
            <div className="h-1 w-10 rounded-full bg-ink-muted/30" />
          </div>

          {/* Back link */}
          <div className="px-4 pt-1 pb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              Overview
            </button>
          </div>

          {/* Title */}
          <div className="px-4 pb-3">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              {guide.title}
            </h2>
            <div className="mt-2 h-px bg-gradient-to-r from-border via-border to-transparent" />
          </div>

          {/* Scrollable sections */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-8">
            <div className="space-y-6 px-4">
              {guide.sections.map((section) => (
                <div key={section.title}>
                  {/* Section header */}
                  <div className="flex items-center gap-2 mb-2">
                    {section.icon && (
                      <span className="text-base">{section.icon}</span>
                    )}
                    <h3 className="text-sm font-semibold text-ink">
                      {section.title}
                    </h3>
                  </div>

                  {/* Section content */}
                  <p className="text-[13px] leading-relaxed text-ink-light whitespace-pre-line">
                    {section.content}
                  </p>

                  {/* Optional section image */}
                  {section.image && (
                    <div className="mt-3 relative aspect-[16/9] overflow-hidden rounded-sm photo-filter">
                      <Image
                        src={section.image}
                        alt={section.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* End marker */}
            <div className="flex flex-col items-center gap-2 py-8 mt-4">
              <div className="h-2 w-2 rotate-45 bg-sand/40" />
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
