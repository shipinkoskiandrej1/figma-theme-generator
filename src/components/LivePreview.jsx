import { C } from "../utils/theme";

function alpha(hex, a) {
  if (!hex || !hex.startsWith('#')) return `rgba(128,128,128,${a})`;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function LivePreview({ theme }) {
  if (!theme) return null;

  const bg      = theme["color/bg/base"]              || '#FAFAFA';
  const surf    = theme["color/bg/surface"]           || '#F4F4F5';
  const brd     = theme["color/border/default"]       || '#E4E4E7';
  const h       = theme["color/text/primary"]         || '#09090B';
  const body    = theme["color/text/secondary"]       || '#71717A';
  const brand   = theme["color/action/primary/bg"]    || '#5292CE';
  const onBrand = theme["color/action/primary/text"]  || '#FFFFFF';
  const sec     = theme["color/action/secondary/bg"]  || theme["color/palette/brand/secondary"] || brand;
  const link    = theme["color/link/default"]         || brand;

  const display  = theme["font/family/display"] ? `${theme["font/family/display"]}, serif` : C.sans;
  const bodyFont = theme["font/family/body"]    ? `${theme["font/family/body"]}, sans-serif` : C.sans;

  return (
    <div style={{ background: bg, border: `1px solid ${brd}`, borderRadius: 6, padding: 36, transition: 'background .3s' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: display, fontSize: 13, fontWeight: 700, color: h }}>Acme</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Product', 'Pricing', 'Docs'].map(l => (
              <span key={l} style={{ fontSize: 12, color: body, fontFamily: bodyFont }}>{l}</span>
            ))}
          </div>
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: alpha(brand, .1), border: `1px solid ${alpha(brand, .22)}`, borderRadius: 4, marginBottom: 24 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: brand }} />
          <span style={{ fontSize: 10.5, color: brand, fontWeight: 500, letterSpacing: '.03em', fontFamily: bodyFont }}>New · Theme Generator v2</span>
        </div>

        {/* Headline */}
        <h2 style={{ fontSize: 34, fontWeight: 600, color: h, lineHeight: 1.18, marginBottom: 16, letterSpacing: '-.025em', fontFamily: display }}>
          Design systems,<br />built in seconds.
        </h2>
        <p style={{ fontSize: 14, color: body, marginBottom: 28, lineHeight: 1.75, maxWidth: 440, fontFamily: bodyFont }}>
          Generate consistent, accessible color variables for your entire Figma project. Export directly to Variables or Token Studio.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 36 }}>
          <button style={{ padding: '10px 24px', background: brand, color: onBrand, border: 'none', borderRadius: 5, fontSize: 13, fontWeight: 600, letterSpacing: '.01em', fontFamily: bodyFont, cursor: 'default' }}>
            Get Started Free
          </button>
          <button style={{ padding: '10px 24px', background: 'transparent', color: h, border: `1px solid ${brd}`, borderRadius: 5, fontSize: 13, letterSpacing: '.01em', fontFamily: bodyFont, cursor: 'default' }}>
            View Docs →
          </button>
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            [brand,  'Instant Export',  'Generate Figma Variables with one click.'],
            [sec,    'WCAG Ready',       'Every color pair tested for AA and AAA.'],
            [link,   'AI-Powered',       'Smart palette from your brand colors.'],
          ].map(([accent, title, desc]) => (
            <div key={title} style={{ padding: 16, background: surf, border: `1px solid ${brd}`, borderRadius: 5 }}>
              <div style={{ width: 30, height: 30, borderRadius: 6, background: alpha(accent, .14), border: `1px solid ${alpha(accent, .25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: h, marginBottom: 5, fontFamily: display }}>{title}</div>
              <div style={{ fontSize: 11, color: body, lineHeight: 1.65, fontFamily: bodyFont }}>{desc}</div>
            </div>
          ))}
        </div>

        {/* Inverse band */}
        <div style={{ background: theme["color/bg/inverse"] || '#0C1221', borderRadius: 6, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', fontFamily: display }}>Ready to get started?</span>
          <div style={{ background: brand, color: onBrand, padding: '8px 18px', borderRadius: 5, fontSize: 12, fontWeight: 600, fontFamily: bodyFont }}>Sign up</div>
        </div>
      </div>
    </div>
  );
}
