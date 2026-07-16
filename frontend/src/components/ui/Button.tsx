import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "gold" | "ghost" | "dark" | "icon";

type CommonProps = {
  variant?: Variant;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

type LinkButtonProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type Props = LinkButtonProps | NativeButtonProps;

function classesFor(variant: Variant, className?: string) {
  const base = variant === "icon" ? "btn--icon btn" : `btn btn--${variant}`;
  return className ? `${base} ${className}` : base;
}

export function Button({ variant = "gold", arrow = false, children, className, ...props }: Props) {
  const classes = classesFor(variant, className);
  const content = (
    <>
      {children}
      {arrow && <span className="arrow">↗</span>}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props as LinkButtonProps;
    const isInternal = href.startsWith("/");
    if (isInternal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {content}
        </Link>
      );
    }
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...(props as NativeButtonProps)}>
      {content}
    </button>
  );
}
