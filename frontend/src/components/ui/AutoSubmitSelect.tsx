"use client";

import type { SelectHTMLAttributes } from "react";

/**
 * A <select> that submits its parent <form> on change. Pure progressive
 * enhancement: the surrounding form still has a real submit button, so
 * filtering/sorting keeps working with JS disabled — this just removes the
 * extra click for everyone else.
 */
export function AutoSubmitSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        e.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
