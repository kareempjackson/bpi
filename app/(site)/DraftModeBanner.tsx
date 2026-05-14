export default function DraftModeBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 rounded-round bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <span className="inline-flex h-2 w-2 rounded-full bg-error-500" />
      Preview mode
      <a
        href="/api/draft-mode/disable"
        className="rounded-round border border-white/30 px-3 py-1 text-xs font-semibold hover:bg-white/10"
      >
        Disable
      </a>
    </div>
  );
}
