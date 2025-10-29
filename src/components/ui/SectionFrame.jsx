// src/components/ui/SectionFrame.jsx
// Server Component — fără styled-jsx, fără client-only. Tailwind + <style> simplu.

export default function SectionFrame({
  children,
  className = "",
  innerClassName = "",
  halo = true,          // setează false dacă nu vrei inelul conic animat
  rounded = "2rem",     // raza colțurilor
}) {
  const cx = (...a) => a.filter(Boolean).join(" ");

  return (
    <section className={cx("relative", className)}>
      {/* inel conic animat (decor), nu interacționează cu mouse-ul */}
      {halo && (
        <div
          aria-hidden="true"
          className="sf-ring pointer-events-none absolute inset-0"
          style={{
            borderRadius: rounded,
            padding: "2px",
            background:
              "conic-gradient(from var(--a,0deg), rgba(34,211,238,.28), rgba(192,132,252,.28), rgba(249,168,212,.22), rgba(34,211,238,.28))",
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}

      {/* containerul propriu-zis */}
      <div
        className={cx(
          "relative border border-secondary/60 bg-card/50",
          innerClassName
        )}
        style={{ borderRadius: rounded }}
      >
        {children}
      </div>

      {/* CSS scoped prin keyframes (NU styled-jsx) */}
      <style>{`
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        .sf-ring { animation: sf-rotate 18s linear infinite; opacity: .9; }
        @keyframes sf-rotate { to { --a: 360deg } }
      `}</style>
    </section>
  );
}
