export default function LivePreview({ theme, companyName, companyLogo }) {
  const display = `${theme["font/family/display"]}, serif`;
  const body    = `${theme["font/family/body"]}, sans-serif`;

  const t = key => theme[key] || "transparent";

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Live Preview — click swatches above to edit
        </p>
      </div>

      <div style={{ background: t("color/bg/page"), padding: "24px 24px 20px" }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {companyLogo && (
              <img src={companyLogo} alt="" style={{ width: 22, height: 22, borderRadius: 5, objectFit: "cover" }} />
            )}
            <span style={{ fontFamily: display, fontSize: 14, fontWeight: 700, color: t("color/text/primary") }}>
              {companyName || "Acme"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            {["Product", "Pricing", "Docs"].map(l => (
              <span key={l} style={{ fontSize: 12, color: t("color/text/secondary"), fontFamily: body }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div
          style={{ fontFamily: display, fontSize: 26, fontWeight: 700, color: t("color/text/primary"), marginBottom: 10, lineHeight: 1.2 }}
        >
          Build beautiful products{" "}
          <span style={{ color: t("color/brand/default") }}>faster.</span>
        </div>
        <div
          style={{ fontFamily: body, fontSize: 13, color: t("color/text/secondary"), marginBottom: 20, lineHeight: 1.65, maxWidth: 420 }}
        >
          Your complete design system, ready to ship. Consistent tokens, accessible by default.
        </div>

        {/* CTA row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <div
            style={{ background: t("color/brand/default"), color: t("color/text/on-brand"), padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: body }}
          >
            Get started free
          </div>
          <div
            style={{ background: t("color/bg/surface"), color: t("color/text/primary"), padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, border: `1px solid ${t("color/border/default")}`, fontFamily: body }}
          >
            See the docs
          </div>
        </div>

        {/* Feature cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
          {["Design tokens", "Auto theming", "Figma sync"].map((title, i) => (
            <div
              key={i}
              style={{ background: t("color/bg/surface"), border: `0.5px solid ${t("color/border/default")}`, borderRadius: 10, padding: "12px 14px" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 8, background: t("color/brand/subtle"), marginBottom: 8 }} />
              <div style={{ fontSize: 12, fontWeight: 600, color: t("color/text/primary"), marginBottom: 3, fontFamily: display }}>{title}</div>
              <div style={{ fontSize: 11, color: t("color/text/secondary"), lineHeight: 1.5, fontFamily: body }}>
                Short description for this feature.
              </div>
            </div>
          ))}
        </div>

        {/* Inverse CTA band */}
        <div
          style={{ background: t("color/bg/inverse"), borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: t("color/bg/page"), fontFamily: display }}>
            Ready to get started?
          </span>
          <div
            style={{ background: t("color/brand/default"), color: t("color/text/on-brand"), padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: body }}
          >
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
}
