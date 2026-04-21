import { C } from "../utils/theme";

function alpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function LivePreview({ theme, companyName, companyLogo, pageStyle }) {
  if (!theme) return null;

  const dark = pageStyle === 'dark';
  const bg      = theme["color/bg/base"]          || (dark ? '#0C1221' : '#FAFAFA');
  const surf    = theme["color/bg/surface"]        || (dark ? '#101829' : '#F4F4F5');
  const brd     = theme["color/border/default"]    || (dark ? '#1C2C46' : '#E4E4E7');
  const h       = theme["color/text/primary"]      || (dark ? '#FAFAFA' : '#09090B');
  const body    = theme["color/text/secondary"]    || '#71717A';
  const brand   = theme["color/brand/primary"]     || '#5292CE';
  const onBrand = theme["color/text/on-brand"]     || '#FFFFFF';
  const subtle  = theme["color/brand/primary-subtle"] || alpha(brand, .12);

  const display = theme["font/family/display"] ? `${theme["font/family/display"]}, serif` : C.sans;
  const bodyFont = theme["font/family/body"] ? `${theme["font/family/body"]}, sans-serif` : C.sans;

  return (
    <div style={{ background: bg, border: `1px solid ${brd}`, borderRadius: 4, padding: 32, transition: 'background .3s' }}>
      <div style={{ maxWidth: 580, margin: '0 auto' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {companyLogo && <img src={companyLogo} alt="" style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover' }} />}
            <span style={{ fontFamily: display, fontSize: 13, fontWeight: 700, color: h }}>{companyName || 'Acme'}</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Product', 'Pricing', 'Docs'].map(l => (
              <span key={l} style={{ fontSize: 12, color: body, fontFamily: bodyFont }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', background: alpha(brand, .12), border: `1px solid ${alpha(brand, .25)}`, borderRadius: 3, marginBottom: 20 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: brand }} />
          <span style={{ fontSize: 10.5, color: brand, fontWeight: 500, letterSpacing: '.03em', fontFamily: bodyFont }}>New · Theme Generator v1</span>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: 32, fontWeight: 600, color: h, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-.025em', fontFamily: display }}>
          Design systems,<br />built in seconds.
        </h2>
        <p style={{ fontSize: 14, color: body, marginBottom: 24, lineHeight: 1.7, maxWidth: 420, fontFamily: bodyFont }}>
          Generate consistent, accessible color variables for your entire Figma project. Export directly to Variables or Token Studio.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <button style={{ padding: '9px 22px', background: brand, color: onBrand, border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 500, letterSpacing: '.01em', fontFamily: bodyFont }}>
            Get Started Free
          </button>
          <button style={{ padding: '9px 22px', background: 'transparent', color: h, border: `1px solid ${brd}`, borderRadius: 4, fontSize: 13, letterSpacing: '.01em', fontFamily: bodyFont }}>
            View Docs →
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            [brand,   'Instant Export', 'Generate Figma Variables with one click. No plugins required.'],
            [theme["color/brand/primary-hover"] || brand, 'WCAG Ready', 'Every color pair tested for AA and AAA compliance.'],
            [theme["color/brand/secondary"] || subtle, 'AI-Powered', 'Smart palette generation from your primary brand color.'],
          ].map(([accent, title, desc]) => (
            <div key={title} style={{ padding: 14, background: surf, border: `1px solid ${brd}`, borderRadius: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: alpha(accent, .14), border: `1px solid ${alpha(accent, .25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: h, marginBottom: 4, fontFamily: display }}>{title}</div>
              <div style={{ fontSize: 11, color: body, lineHeight: 1.6, fontFamily: bodyFont }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Inverse band */}
        <div style={{ background: theme["color/bg/overlay"] || '#0C1221', borderRadius: 6, padding: '14px 20px', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: dark ? '#0C1221' : '#FAFAFA', fontFamily: display }}>Ready to get started?</span>
          <div style={{ background: brand, color: onBrand, padding: '7px 16px', borderRadius: 4, fontSize: 12, fontWeight: 600, fontFamily: bodyFont }}>Sign up</div>
        </div>
      </div>
    </div>
  );
}
