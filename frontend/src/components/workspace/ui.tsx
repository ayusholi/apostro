"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Globe,
  Mail,
  MessageCircle,
  MoreHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Channel, TeamMember } from "@/types/workspace";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* Status tag ---------------------------------------------------------------
   Tone sets colour, but each tone also carries an icon and text so status
   never depends on colour alone. */

export type Tone = "neutral" | "accent" | "attention" | "urgent" | "done";

const TONE_ICON: Record<Tone, LucideIcon | null> = {
  neutral: null,
  accent: Circle,
  attention: Clock,
  urgent: AlertTriangle,
  done: CheckCircle2,
};

export function Tag({ tone = "neutral", children, icon }: { tone?: Tone; children: React.ReactNode; icon?: LucideIcon | false }) {
  const Icon = icon === false ? null : (icon ?? TONE_ICON[tone]);
  return (
    <span className={`ws-tag ws-tag--${tone}`}>
      {Icon && <Icon aria-hidden size={12} strokeWidth={2.25} />}
      {children}
    </span>
  );
}

/* Identity ------------------------------------------------------------------ */

export function Avatar({ person, name, size = "sm" }: { person?: TeamMember; name?: string; size?: "sm" | "md" | "lg" }) {
  const label = person?.name ?? name ?? "";
  const initials =
    person?.initials ??
    label
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("");
  return (
    <span className={`ws-avatar ws-avatar--${size}${person ? " ws-avatar--team" : ""}`} aria-hidden>
      {initials}
    </span>
  );
}

export function MatterRef({ id, refText, link = true }: { id: string; refText: string; link?: boolean }) {
  if (!link) return <span className="ws-ref">{refText}</span>;
  return (
    <Link className="ws-ref ws-ref--link" href={`/workspace/matters/${id}`} onClick={(e) => e.stopPropagation()}>
      {refText}
    </Link>
  );
}

const CHANNEL: Record<Channel, { icon: LucideIcon; label: string }> = {
  email: { icon: Mail, label: "Email" },
  whatsapp: { icon: MessageCircle, label: "WhatsApp" },
  web: { icon: Globe, label: "Web enquiry" },
};

export function ChannelMark({ channel, withLabel = false }: { channel: Channel; withLabel?: boolean }) {
  const { icon: Icon, label } = CHANNEL[channel];
  return (
    <span className={`ws-channel ws-channel--${channel}`} title={label}>
      <Icon aria-hidden size={13} strokeWidth={2} />
      {withLabel ? <span>{label}</span> : <span className="ws-sr">{label}</span>}
    </span>
  );
}

export function channelLabel(channel: Channel) {
  return CHANNEL[channel].label;
}

/* Empty state --------------------------------------------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="ws-empty">
      <Icon aria-hidden size={22} strokeWidth={1.5} />
      <p className="ws-empty__title">{title}</p>
      {children && <p className="ws-empty__text">{children}</p>}
      {action}
    </div>
  );
}

/* Action menu ----------------------------------------------------------------
   Menu-button pattern: arrow keys move between items, Escape closes and
   returns focus to the trigger, clicking outside dismisses. */

export type MenuItem =
  | { label: string; icon?: LucideIcon; onSelect: () => void; tone?: "danger"; disabled?: boolean }
  | "separator";

export function ActionMenu({
  label,
  items,
  align = "end",
  trigger,
  className = "ws-iconbtn",
}: {
  label: string;
  items: MenuItem[];
  align?: "start" | "end";
  trigger?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const first = wrap.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
    first?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const nodes = Array.from(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      nodes[(index + 1) % nodes.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      nodes[(index - 1 + nodes.length) % nodes.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      nodes[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      nodes[nodes.length - 1]?.focus();
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div className="ws-menuwrap" ref={wrap} onKeyDown={open ? onKeyDown : undefined} onClick={(e) => e.stopPropagation()}>
      <button
        ref={button}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={trigger ? undefined : label}
        title={trigger ? undefined : label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {trigger ?? <MoreHorizontal aria-hidden size={16} />}
      </button>
      {open && (
        <div className={`ws-menu ws-menu--${align}`} role="menu" id={menuId} aria-label={label}>
          {items.map((item, i) =>
            item === "separator" ? (
              <div key={`sep-${i}`} className="ws-menu__sep" role="separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                className={`ws-menu__item${item.tone === "danger" ? " ws-menu__item--danger" : ""}`}
                onClick={() => {
                  close(false);
                  item.onSelect();
                }}
              >
                {item.icon && <item.icon aria-hidden size={15} />}
                {item.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* Context panel --------------------------------------------------------------
   A side column on wide screens; on narrower screens the same content becomes
   a modal drawer so it never squeezes the main workspace. */

export function ContextPanel({
  open,
  onClose,
  label,
  children,
  wide = false,
  drawerQuery = "(max-width: 1199px)",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  wide?: boolean;
  /** Below this media query the panel becomes a modal drawer. */
  drawerQuery?: string;
}) {
  const drawer = useMediaQuery(drawerQuery);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || !drawer) return;
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, drawer, onClose]);

  if (!open) return null;

  return (
    <>
      {drawer && <div className="ws-scrim" onClick={onClose} aria-hidden />}
      <aside
        ref={panel}
        className={`ws-context${wide ? " ws-context--wide" : ""}${drawer ? " ws-context--drawer" : ""}`}
        aria-label={label}
        role={drawer ? "dialog" : "complementary"}
        aria-modal={drawer || undefined}
        tabIndex={-1}
      >
        <button type="button" className="ws-iconbtn ws-context__close" onClick={onClose} aria-label={`Close ${label.toLowerCase()}`} title="Close panel">
          <X aria-hidden size={16} />
        </button>
        {children}
      </aside>
    </>
  );
}

/** Labelled definition rows used across context panels and headers. */
export function Facts({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="ws-facts">
      {items.map((item) => (
        <div key={item.label} className="ws-facts__row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionTitle({ children, count, action }: { children: React.ReactNode; count?: number; action?: React.ReactNode }) {
  return (
    <div className="ws-sectiontitle">
      <h3>
        {children}
        {count !== undefined && <span className="ws-count">{count}</span>}
      </h3>
      {action}
    </div>
  );
}
