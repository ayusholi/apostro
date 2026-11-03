import Link from "next/link";

export function Later({ title, text }: { title: string; text: string }) {
  return (
    <div className="ws-page">
      <header className="ws-pagehead">
        <div>
          <h1>{title}</h1>
          <p className="ws-pagehead__sub">Not part of this prototype</p>
        </div>
      </header>
      <div className="ws-later">
        <p>{text}</p>
        <Link href="/workspace" className="ws-btn">
          Back to My Work
        </Link>
      </div>
    </div>
  );
}
