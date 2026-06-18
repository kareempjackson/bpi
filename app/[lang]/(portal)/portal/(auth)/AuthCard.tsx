import Logo from "@/app/components/Logo";

/** Shared centered card chrome for the portal auth pages — BPI brand. */
export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-primary-500/10 bg-white p-8 shadow-[0_12px_40px_-12px_rgb(0_0_54/0.12)]">
          <div className="mb-7 flex items-center gap-3">
            <Logo size={92} className="text-primary-500" />
            <span className="h-5 w-px bg-primary-500/15" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-500/60">
              Portal
            </span>
          </div>
          <h1 className="font-display text-display-xs font-semibold tracking-[-0.01em] text-primary-500">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm leading-relaxed text-primary-500/70">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? (
          <div className="mt-4 text-center text-sm text-primary-500/70">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
