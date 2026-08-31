/* =====================================================================
   Service Pow — 60s intro film. higgsedit cut 01.

   This file IS the edit. Re-running it reproduces the whole timeline.

   Timings are LOCKED to the Rev 4 string table in build/scenes.html
   (TEXTS_R3) because the voiceover was produced against those exact
   in/out points and is already mixed. Move a beat and the audio desyncs.

   Direction proposal, one constant away from reversible: the approved
   palette is inverted onto a dark ground. GROUND/INK below flip it back.
   ===================================================================== */

const W = 1920, H = 1080;

const GROUND    = '#0E0D0C';   // warm near-black
const INK       = '#F7F5F0';   // the approved ground colour, now the type
const INK_DIM   = '#9C978E';
const INK_FAINT = '#3A3733';
const ACCENT    = '#3C86D8';   // approved #1B5FA8, lifted to read on dark
const ACCENT_D  = '#1B5FA8';   // approved value, large fills
const CARD      = '#171614';
const CARD_HI   = '#221F1C';
const RULE      = '#2B2723';

const M    = 120;
const DISP = 'Anton';
const BODY = 'Inter';

/* ---------- helpers ---------- */

/* One track owns entrance AND exit. Two tracks on one property fight. */
function life(tIn, tOut, rise, fall) {
  const r = rise == null ? 0.32 : rise;
  const f = fall == null ? 0.34 : fall;
  const a = Math.max(0.001, tIn);
  const b = a + r;
  const d = Math.max(b + 0.08, tOut);
  const c = Math.max(b + 0.03, d - f);
  return { property: 'opacity', keyframes: [
    { at: 0, value: 0 }, { at: a, value: 0 }, { at: b, value: 1 },
    { at: c, value: 1 }, { at: d, value: 0 },
  ]};
}

/* A burned line, word-staggered in, faded out, wrapped in a scene-sized
   group so the opacity chain never fights the word motion. */
function Line(o) {
  return (
    <group x={0} y={0} width={W} height={H} animate={life(o.in, o.out, o.rise, o.fall)}>
      <text x={o.x} y={o.y} width={o.w}
            fontFamily={o.font || DISP} fontSize={o.size}
            fontWeight={o.weight || 400} color={o.color || INK}
            motion={{ by: 'word', from: { y: 30, opacity: 0 }, overlap: 0.6, easing: 'house' }}>
        {o.text}
      </text>
    </group>
  );
}

/* The accent rule that sits under a display line and wipes open. */
function Rule(o) {
  return (
    <rect x={o.x} y={o.y} width={o.w} height={o.h || 8} fill={o.color || ACCENT}
          animate={[
            { property: 'scaleX', from: 0, to: 1, duration: 0.52, easing: 'house' },
            life(o.in, o.out),
          ]} />
  );
}

/* A quiet backdrop slab so no scene is ever an empty field. */
function Slab(o) {
  return (
    <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={o.fill || CARD} radius={o.r || 0}
          animate={[
            { property: 'scale', from: 0.985, to: 1, duration: 0.9, easing: 'smooth' },
            life(o.in, o.out, 0.5, 0.4),
          ]} />
  );
}

/* One ad card. `state`: 'blank' | 'q' | 'won' | 'lost' | 'live' */
function AdCard(o) {
  const won  = o.state === 'won';
  const lost = o.state === 'lost';
  const kids = [
    <rect x={0} y={0} width={o.w} height={o.h} radius={18}
          fill={won ? CARD_HI : CARD} />,
    <rect x={0} y={0} width={o.w} height={6}
          fill={won ? ACCENT : (lost ? INK_FAINT : ACCENT_D)} />,
  ];
  /* the picture well */
  kids.push(<rect x={16} y={26} width={o.w - 32} height={o.h - 96} radius={10} fill={CARD_HI} />);
  /* three type bars, so the card reads as an ad and not an empty box */
  kids.push(<rect x={16} y={o.h - 58} width={(o.w - 32) * 0.72} height={9} radius={4} fill={INK_FAINT} />);
  kids.push(<rect x={16} y={o.h - 38} width={(o.w - 32) * 0.44} height={9} radius={4} fill={INK_FAINT} />);
  if (o.state === 'q') {
    kids.push(<text x={0} y={o.h * 0.30} width={o.w} align="center"
                    fontFamily={DISP} fontSize={92} color={INK_FAINT}>?</text>);
  }
  if (won) {
    kids.push(icon('check', { x: o.w - 62, y: o.h - 74, size: 42, color: ACCENT }));
  }
  return (
    <group x={o.x} y={o.y} width={o.w} height={o.h} origin="center"
           animate={[
             { property: 'y', from: o.y + 46, to: o.y, duration: 0.62, easing: 'house' },
             { property: 'scale', from: won ? 0.94 : 1, to: won ? 1.06 : 1, duration: 0.5, easing: 'house' },
             life(o.in, o.out, 0.3, 0.34),
           ].concat(lost ? [{ property: 'opacity', keyframes: [
             { at: 0, value: 0 }, { at: Math.max(0.001, o.in), value: 0 },
             { at: o.in + 0.3, value: 1 }, { at: o.in + 1.5, value: 0.26 },
             { at: Math.max(o.in + 1.6, o.out - 0.34), value: 0.26 },
             { at: Math.max(o.in + 1.7, o.out), value: 0 },
           ]}] : [])}>
      {kids}
    </group>
  );
}

/* A row of four ad cards, dealt in with a stagger. */
function AdRow(o) {
  const cw = o.cw || 344, ch = o.ch || 232, gap = o.gap || 28;
  const out = [];
  for (let i = 0; i < 4; i++) {
    out.push(AdCard({
      x: o.x + i * (cw + gap), y: o.y, w: cw, h: ch,
      in: o.in + i * (o.stagger == null ? 0.14 : o.stagger),
      out: o.out,
      state: o.winner === i ? 'won' : (o.winner != null ? 'lost' : (o.q ? 'q' : 'blank')),
    }));
  }
  return out;
}

/* A struck-out chip: the thing you DON'T have to do. */
function KillChip(o) {
  return (
    <group x={o.x} y={o.y} width={o.w} height={72} animate={life(o.in, o.out, 0.26, 0.3)}>
      <rect x={0} y={0} width={o.w} height={72} radius={12} fill={CARD} />
      <text x={28} y={22} width={o.w - 56} fontFamily={BODY} fontSize={30}
            fontWeight={600} color={INK_DIM}>{o.text}</text>
      <rect x={22} y={35} width={o.w - 44} height={4} fill={ACCENT}
            animate={{ property: 'scaleX', from: 0, to: 1, duration: 0.34,
                       easing: 'house', delay: 0.34 }} />
    </group>
  );
}

/* ---------- the film ---------- */

export default async ({ project }) => {
  const p = await project({ size: '1920x1080', fps: 30, background: GROUND });

  /* Audio is the spine: the produced voiceover, picture stripped off. */
  const vo = await p.add('media/narration.m4a');
  p.cut(vo, { at: 0, from: 0, dur: 60 });

  /* ---- S1 · 0.0–9.5 — the pain, then the answer ---------------- */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Slab({ x: 1140, y: 0, w: 780, h: H, fill: '#121110', in: 0.0, out: 9.5 })}

      {/* the phone that never rang */}
      <group x={1264} y={168} width={540} height={720}
             animate={[{ property: 'y', from: 206, to: 168, duration: 0.8, easing: 'smooth' },
                       life(0.25, 4.75, 0.45, 0.4)]}>
        <rect x={0} y={0} width={540} height={720} radius={46} fill={CARD} />
        <rect x={22} y={22} width={496} height={676} radius={34} fill="#0B0A09" />
        {icon('phone-off', { x: 226, y: 176, size: 88, color: INK_FAINT })}
        <text x={22} y={300} width={496} align="center" fontFamily={BODY}
              fontSize={26} fontWeight={600} color={INK_FAINT}>NO MISSED CALLS</text>
        <rect x={70} y={392} width={400} height={12} radius={6} fill="#1A1817" />
        <rect x={70} y={438} width={400} height={12} radius={6} fill="#1A1817" />
        <rect x={70} y={484} width={400} height={12} radius={6} fill="#1A1817" />
        <rect x={70} y={530} width={400} height={12} radius={6} fill="#1A1817" />
      </group>

      {Line({ text: 'You paid.\nIt didn’t ring.', in: 0.5, out: 4.4,
              x: M, y: 322, w: 940, size: 138 })}
      {Rule({ x: M, y: 640, w: 300, in: 0.9, out: 4.4 })}

      {Line({ text: 'Don’t bet your spend\non one ad. We build four.', in: 4.9, out: 9.0,
              x: M, y: 232, w: 960, size: 88 })}
      {AdRow({ x: M, y: 560, in: 5.5, out: 9.4 })}
    </group>,
    { at: 0, dur: 9.5, name: 's1-pain' },
  );

  /* ---- S2 · 9.5–15.2 — and you still don't know why ------------ */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Line({ text: 'And you still\ndon’t know why.', in: 0.5, out: 4.9,
              x: M, y: 300, w: 820, size: 116 })}
      {Rule({ x: M, y: 596, w: 260, in: 0.9, out: 4.9 })}
      {AdRow({ x: 1010, y: 250, cw: 380, ch: 254, gap: 30, in: 0.2, out: 5.5, q: true })}
      <text x={1010} y={790} width={800} fontFamily={BODY} fontSize={30}
            fontWeight={600} color={INK_DIM}
            animate={life(2.4, 5.4, 0.4, 0.4)}>Four guesses. No read on any of them.</text>
    </group>,
    { at: 9.5, dur: 5.7, name: 's2-why' },
  );

  /* ---- S3 · 15.2–23.2 — your part is small --------------------- */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Slab({ x: 1080, y: 0, w: 840, h: H, fill: '#121110', in: 0.0, out: 8.0 })}

      {/* a phone, shooting */}
      <group x={1240} y={130} width={520} height={800} origin="center"
             animate={[{ property: 'scale', from: 0.95, to: 1, duration: 0.7, easing: 'house' },
                       life(0.2, 7.8, 0.4, 0.4)]}>
        <rect x={0} y={0} width={520} height={800} radius={46} fill={CARD} />
        <rect x={22} y={22} width={476} height={756} radius={34} fill="#0B0A09" />
        <rect x={44} y={150} width={432} height={470} radius={14} fill={CARD_HI} />
        <rect x={44} y={150} width={432} height={470} radius={14} fill={ACCENT_D}
              animate={{ property: 'opacity', keyframes: [
                { at: 0, value: 0 }, { at: 0.9, value: 0.22 }, { at: 7.6, value: 0.22 }] }} />
        {icon('video', { x: 214, y: 336, size: 92, color: INK })}
        <rect x={210} y={676} width={100} height={100} radius={50} fill={INK_FAINT} />
        <rect x={228} y={694} width={64} height={64} radius={32} fill="#D8483C"
              animate={{ property: 'scale', from: 1, to: 0.82, duration: 0.7,
                         easing: 'ease-in-out', repeat: 6 }} />
      </group>

      {Line({ text: 'Your part:\nclips off your phone.', in: 0.3, out: 4.3,
              x: M, y: 300, w: 860, size: 96 })}
      {Rule({ x: M, y: 560, w: 280, in: 0.7, out: 4.3 })}

      {Line({ text: 'No film crew.\nNo shoot day.', in: 4.6, out: 7.6,
              x: M, y: 258, w: 860, size: 96 })}
      {KillChip({ x: M, y: 540, w: 400, text: 'FILM CREW', in: 5.1, out: 7.6 })}
      {KillChip({ x: M, y: 632, w: 400, text: 'SHOOT DAY', in: 5.4, out: 7.6 })}
    </group>,
    { at: 15.2, dur: 8.0, name: 's3-your-part' },
  );

  /* ---- S4 · 23.2–30.2 — real footage + AI ---------------------- */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Line({ text: 'Your van. Your street.', in: 0.3, out: 3.7,
              x: M, y: 200, w: 1400, size: 104 })}
      {Line({ text: 'AI builds the rest.', in: 4.0, out: 6.6,
              x: M, y: 200, w: 1400, size: 104 })}
      {Rule({ x: M, y: 336, w: 340, in: 0.7, out: 6.6 })}

      {/* the filmstrip: two frames yours, three built */}
      {[0, 1, 2, 3, 4].map(function (i) {
        const yours = i < 2;
        const cw = 316, gap = 26, x0 = M;
        return (
          <group x={x0 + i * (cw + gap)} y={470} width={cw} height={300}
                 animate={[
                   { property: 'y', from: 512, to: 470, duration: 0.6, easing: 'house' },
                   life(yours ? 0.5 + i * 0.18 : 4.2 + (i - 2) * 0.2, 6.7, 0.3, 0.34),
                 ]}>
            <rect x={0} y={0} width={cw} height={300} radius={16}
                  fill={yours ? CARD_HI : CARD} />
            <rect x={0} y={0} width={cw} height={300} radius={16} fill={ACCENT_D}
                  animate={{ property: 'opacity', keyframes: [
                    { at: 0, value: 0 }, { at: 0.6, value: yours ? 0 : 0.30 }] }} />
            {icon(yours ? 'truck' : 'sparkles',
                  { x: cw / 2 - 34, y: 96, size: 68, color: yours ? INK : ACCENT })}
            <rect x={0} y={264} width={cw} height={36}
                  fill={yours ? ACCENT : INK_FAINT} />
            <text x={0} y={272} width={cw} align="center" fontFamily={BODY}
                  fontSize={20} fontWeight={700}
                  color={yours ? '#0E0D0C' : INK_DIM}>{yours ? 'YOUR FOOTAGE' : 'BUILT'}</text>
          </group>
        );
      })}
    </group>,
    { at: 23.2, dur: 7.0, name: 's4-hybrid' },
  );

  /* ---- S5 · 30.2–38.7 — keep the one that pulls ---------------- */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Line({ text: 'Keep the one\nthat pulls.', in: 0.3, out: 3.6,
              x: M, y: 300, w: 720, size: 118 })}
      {Rule({ x: M, y: 604, w: 260, in: 0.7, out: 3.6 })}
      {AdRow({ x: 940, y: 300, cw: 400, ch: 268, gap: 34, in: 0.2, out: 4.2, winner: 1 })}

      {Line({ text: '5–7 business days\nfrom your footage.', in: 3.9, out: 8.1,
              x: M, y: 300, w: 900, size: 96 })}
      <group x={M} y={604} width={1600} height={80} animate={life(4.3, 8.1, 0.3, 0.4)}>
        <rect x={0} y={0} width={1600} height={10} radius={5} fill={RULE} />
        <rect x={0} y={0} width={1600} height={10} radius={5} fill={ACCENT}
              animate={{ property: 'scaleX', from: 0, to: 1, duration: 2.6, easing: 'ease-in-out' }} />
        <text x={0} y={30} width={400} fontFamily={BODY} fontSize={24}
              fontWeight={600} color={INK_DIM}>YOUR CLIPS IN</text>
        <text x={1200} y={30} width={400} align="right" fontFamily={BODY} fontSize={24}
              fontWeight={600} color={ACCENT}>FOUR ADS OUT</text>
      </group>
    </group>,
    { at: 30.2, dur: 8.5, name: 's5-pick' },
  );

  /* ---- S6 · 38.7–45.6 — the trust stack ------------------------ */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Slab({ x: 0, y: 0, w: 760, h: H, fill: '#121110', in: 0.0, out: 6.9 })}
      <group x={252} y={410} width={260} height={260} origin="center"
             animate={[{ property: 'scale', from: 0.9, to: 1, duration: 0.6, easing: 'house' },
                       life(0.2, 6.6, 0.4, 0.4)]}>
        <rect x={0} y={0} width={260} height={260} radius={130} fill={ACCENT_D} />
        {icon('check', { x: 74, y: 74, size: 112, color: INK })}
      </group>
      <text x={140} y={716} width={480} align="center" fontFamily={BODY} fontSize={26}
            fontWeight={700} color={INK_DIM}
            animate={life(0.9, 6.6, 0.4, 0.4)}>COMPLIANCE IS OUR JOB</text>

      {[['Disclosure handled', 0.3], ['No fake testimonials', 1.8], ['Claims substantiated', 3.2]]
        .map(function (row, i) {
          return (
            <group x={900} y={296 + i * 152} width={900} height={110}
                   animate={[{ property: 'x', from: 946, to: 900, duration: 0.5, easing: 'house' },
                             life(row[1], 6.5, 0.3, 0.36)]}>
              <rect x={0} y={0} width={900} height={110} radius={16} fill={CARD} />
              {icon('check', { x: 34, y: 32, size: 46, color: ACCENT })}
              <text x={110} y={34} width={760} fontFamily={BODY} fontSize={42}
                    fontWeight={600} color={INK}>{row[0]}</text>
            </group>
          );
        })}
    </group>,
    { at: 38.7, dur: 6.9, name: 's6-trust' },
  );

  /* ---- S7 · 45.6–53.7 — we go first, and it starts with the audit */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Slab({ x: 1060, y: 0, w: 860, h: H, fill: '#121110', in: 0.0, out: 8.1 })}
      {AdCard({ x: 1250, y: 288, w: 480, h: 500, in: 0.6, out: 7.9, state: 'won' })}
      <text x={1250} y={824} width={480} align="center" fontFamily={BODY} fontSize={26}
            fontWeight={700} color={ACCENT}
            animate={life(1.4, 7.9, 0.4, 0.4)}>BUILT BEFORE YOU ASK</text>

      {Line({ text: 'We make the first one\nbefore you ask.', in: 0.4, out: 4.6,
              x: M, y: 320, w: 880, size: 94 })}
      {Line({ text: 'It starts with a\nfree growth audit.', in: 5.0, out: 7.8,
              x: M, y: 320, w: 880, size: 94 })}
      {Rule({ x: M, y: 600, w: 300, in: 0.8, out: 7.9 })}
    </group>,
    { at: 45.6, dur: 8.1, name: 's7-first-move' },
  );

  /* ---- S8 · 53.7–60.0 — the single conversion path -------------- */
  p.compose(
    <group x={0} y={0} width={W} height={H}>
      {Slab({ x: 0, y: 300, w: W, h: 480, fill: '#121110', in: 0.0, out: 6.3 })}
      {Line({ text: 'Get your free growth audit.', in: 0.2, out: 5.6,
              x: 160, y: 396, w: 1600, size: 116, color: INK })}
      {Rule({ x: 160, y: 566, w: 1600, h: 10, in: 0.5, out: 5.8 })}
      <group x={860} y={636} width={200} height={120}
             animate={[{ property: 'y', from: 620, to: 652, duration: 0.9,
                         easing: 'ease-in-out', repeat: 5 },
                       life(0.9, 5.8, 0.4, 0.4)]}>
        {icon('arrow-down', { x: 60, y: 0, size: 80, color: ACCENT })}
      </group>
      <text x={160} y={790} width={1600} align="center" fontFamily={BODY} fontSize={28}
            fontWeight={600} color={INK_DIM}
            animate={life(1.4, 5.8, 0.4, 0.4)}>Free · No purchase required · No obligation</text>
    </group>,
    { at: 53.7, dur: 6.3, name: 's8-cta' },
  );

  /* proof frames — one per scene, at a readable hold */
  const PROOF = [[2.2, 's1'], [11.8, 's2'], [17.5, 's3'], [25.0, 's4'],
                 [31.5, 's5'], [43.0, 's6'], [47.5, 's7'], [55.5, 's8']];
  for (const [t, id] of PROOF) {
    await p.frame(t, 'renders/proof-' + id + '.png');
  }
};
