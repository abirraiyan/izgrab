import { useCms } from "@/lib/cms-store";

export function AnnouncementBar() {
  const { settings } = useCms();
  const messages = settings.announcements.length > 0 ? settings.announcements : [""];
  const loop = [...messages, ...messages, ...messages, ...messages];

  return (
    <div className="bg-cocoa text-cocoa-foreground text-[10px] xs:text-[11px] sm:text-xs md:text-[13px]">
      <div className="group relative overflow-hidden h-6 xs:h-7 sm:h-8 md:h-9">
        <div className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((m, idx) => (
            <span
              key={idx}
              className="px-4 xs:px-6 sm:px-10 md:px-14 lg:px-16 font-medium tracking-wide flex items-center gap-1.5 xs:gap-2 sm:gap-3"
            >
              {m}
              <span className="opacity-40">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
