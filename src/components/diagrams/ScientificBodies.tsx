import type { ScientificPalette } from "@/lib/diagrams/types";
import type { DiagramTemplateId } from "@/lib/types";

/** Deterministic SVG bodies for educational templates — no AI. */
export function ScientificBody({
  id,
  p,
}: {
  id: DiagramTemplateId;
  p: ScientificPalette;
}) {
  switch (id) {
    case "sci-kidney":
      return <KidneyBody p={p} />;
    case "sci-heart":
      return <HeartBody p={p} />;
    case "sci-liver":
      return <LiverBody p={p} />;
    case "sci-eye":
      return <EyeBody p={p} />;
    case "sci-brain":
      return <BrainBody p={p} />;
    case "sci-neuron":
      return <NeuronBody p={p} />;
    case "sci-plant-cell":
      return <PlantCellBody p={p} />;
    case "sci-animal-cell":
      return <AnimalCellBody p={p} />;
    case "sci-leaf":
      return <LeafBody p={p} />;
    case "sci-flower":
      return <FlowerBody p={p} />;
    case "sci-digestive":
      return <DigestiveBody p={p} />;
    case "sci-respiratory":
      return <RespiratoryBody p={p} />;
    case "sci-ear":
      return <EarBody p={p} />;
    case "sci-tooth":
      return <ToothBody p={p} />;
    case "sci-dna":
      return <DnaBody p={p} />;
    case "sci-lungs":
      return <LungsBody p={p} />;
    case "sci-stomach":
      return <StomachBody p={p} />;
    case "sci-mitochondria":
      return <MitochondriaBody p={p} />;
    default:
      return null;
  }
}

function KidneyBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Capsule / outer kidney bean */}
      <path
        d="M170 70 C120 90 105 160 115 230 C125 300 165 350 220 360 C275 350 315 300 325 230 C335 160 320 90 270 70 C240 58 200 58 170 70 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Cortex band */}
      <path
        d="M185 95 C145 115 135 170 145 230 C155 285 185 320 220 330 C255 320 285 285 295 230 C305 170 295 115 255 95 C235 85 205 85 185 95 Z"
        fill={p.organDeep}
        stroke={p.outline}
        strokeWidth={1.25}
        opacity={0.85}
      />
      {/* Medullary pyramids */}
      {[0, 1, 2, 3].map((i) => {
        const x = 175 + i * 28;
        return (
          <polygon
            key={i}
            points={`${x},140 ${x + 22},140 ${x + 11},220`}
            fill={p.fillAlt}
            stroke={p.outline}
            strokeWidth={1}
          />
        );
      })}
      {/* Renal pelvis */}
      <path
        d="M230 220 C250 230 275 245 295 255 C285 270 265 285 250 295 C235 280 225 250 230 220 Z"
        fill={p.fillSoft}
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Ureter */}
      <path
        d="M285 270 C300 300 305 340 310 380"
        fill="none"
        stroke={p.outline}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <path
        d="M285 270 C300 300 305 340 310 380"
        fill="none"
        stroke={p.vessel}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Hilum notch hint */}
      <ellipse cx={300} cy={240} rx={14} ry={22} fill={p.fat} stroke={p.outline} strokeWidth={1} />
    </g>
  );
}

function HeartBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Aorta */}
      <path
        d="M230 40 C230 20 250 15 265 25 C280 35 275 55 260 60 L250 70"
        fill="none"
        stroke={p.accent}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d="M230 40 C230 20 250 15 265 25 C280 35 275 55 260 60 L250 70"
        fill="none"
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Main heart outline */}
      <path
        d="M240 90 C200 60 140 80 130 140 C120 200 150 260 190 300 C210 320 230 340 240 350 C250 340 270 320 290 300 C330 260 360 200 350 140 C340 80 280 60 240 90 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Septum */}
      <path d="M240 130 L240 320" stroke={p.outline} strokeWidth={2} strokeDasharray="4 3" />
      {/* Chambers shading */}
      <path
        d="M150 140 C150 180 170 220 200 250 L200 150 C180 130 160 130 150 140 Z"
        fill={p.fillSoft}
        opacity={0.7}
      />
      <path
        d="M280 140 C290 130 310 130 330 140 C330 180 310 220 280 250 Z"
        fill={p.organDeep}
        opacity={0.55}
      />
      {/* Valves hints */}
      <ellipse cx={190} cy={160} rx={18} ry={8} fill="none" stroke={p.outline} strokeWidth={1.25} />
      <ellipse cx={290} cy={160} rx={18} ry={8} fill="none" stroke={p.outline} strokeWidth={1.25} />
    </g>
  );
}

function LiverBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <path
        d="M80 120 C100 70 180 60 240 80 C300 60 380 70 410 120 C430 170 420 230 380 260 C340 290 280 280 240 270 C200 280 140 290 100 260 C70 230 60 170 80 120 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Falciform / lobe divide */}
      <path d="M220 90 C230 150 230 210 225 260" stroke={p.outline} strokeWidth={1.5} fill="none" />
      {/* Gallbladder */}
      <path
        d="M270 230 C280 250 285 270 275 285 C260 275 255 250 270 230 Z"
        fill={p.fat}
        stroke={p.outline}
        strokeWidth={1.5}
      />
    </g>
  );
}

function EyeBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Eyeball */}
      <ellipse cx={250} cy={180} rx={160} ry={110} fill={p.fillSoft} stroke={p.outline} strokeWidth={2} />
      {/* Sclera / cornea front */}
      <path
        d="M100 180 C110 120 140 100 160 120 C150 160 150 200 160 240 C140 260 110 240 100 180 Z"
        fill={p.fill}
        stroke={p.outline}
        strokeWidth={1.5}
        opacity={0.9}
      />
      {/* Iris */}
      <circle cx={170} cy={180} r={28} fill="#86efac" stroke={p.outline} strokeWidth={1.5} />
      {/* Pupil */}
      <circle cx={170} cy={180} r={12} fill={p.outline} />
      {/* Lens */}
      <ellipse cx={195} cy={180} rx={14} ry={22} fill="#e0f2fe" stroke={p.outline} strokeWidth={1.25} />
      {/* Retina arc */}
      <path
        d="M320 100 C380 140 390 220 320 260"
        fill="none"
        stroke={p.accent}
        strokeWidth={3}
      />
      {/* Optic nerve */}
      <path
        d="M390 200 C430 210 450 230 460 250"
        fill="none"
        stroke={p.outline}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d="M390 200 C430 210 450 230 460 250"
        fill="none"
        stroke={p.vessel}
        strokeWidth={5}
        strokeLinecap="round"
      />
    </g>
  );
}

function BrainBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <path
        d="M120 160 C110 100 160 50 240 55 C320 50 370 100 360 160 C370 200 350 240 320 250 C300 280 260 300 240 300 C220 300 180 280 160 250 C130 240 110 200 120 160 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Folds */}
      <path d="M140 140 C180 120 220 130 260 120 C300 130 340 140 350 160" fill="none" stroke={p.outline} strokeWidth={1.25} />
      <path d="M150 180 C190 170 230 185 270 175 C310 185 340 190 350 200" fill="none" stroke={p.outline} strokeWidth={1.25} />
      {/* Cerebellum */}
      <path
        d="M250 260 C270 250 310 255 320 280 C300 300 260 305 240 290 C245 275 250 260 250 260 Z"
        fill={p.organDeep}
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Brainstem */}
      <path
        d="M230 280 C235 300 240 320 245 340"
        fill="none"
        stroke={p.outline}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <path
        d="M230 280 C235 300 240 320 245 340"
        fill="none"
        stroke={p.fillAlt}
        strokeWidth={6}
        strokeLinecap="round"
      />
    </g>
  );
}

function NeuronBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Dendrites */}
      {[
        "M160 140 L60 40",
        "M160 140 L40 100",
        "M160 140 L70 180",
        "M160 140 L50 220",
      ].map((d) => (
        <path key={d} d={d} stroke={p.outline} strokeWidth={2} fill="none" strokeLinecap="round" />
      ))}
      {[60, 40, 40, 70, 50].map((x, i) => (
        <circle key={i} cx={[60, 40, 70, 50, 55][i]} cy={[40, 100, 180, 220, 70][i]} r={4} fill={p.vessel} stroke={p.outline} />
      ))}
      {/* Soma */}
      <circle cx={160} cy={140} r={36} fill={p.fill} stroke={p.outline} strokeWidth={2} />
      <circle cx={160} cy={140} r={10} fill={p.organDeep} stroke={p.outline} />
      {/* Axon */}
      <path d="M196 140 H400" stroke={p.outline} strokeWidth={4} fill="none" />
      {/* Myelin segments */}
      {[220, 260, 300, 340].map((x) => (
        <rect key={x} x={x} y={132} width={24} height={16} rx={4} fill={p.fat} stroke={p.outline} />
      ))}
      {/* Terminals */}
      {[
        [430, 100],
        [450, 140],
        [430, 180],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M400 140 L${x} ${y}`} stroke={p.outline} strokeWidth={2} fill="none" />
          <circle cx={x} cy={y} r={6} fill={p.accent} stroke={p.outline} />
        </g>
      ))}
    </g>
  );
}

function PlantCellBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <rect x={60} y={50} width={360} height={260} rx={8} fill="#bbf7d0" stroke={p.outline} strokeWidth={3} />
      <rect x={75} y={65} width={330} height={230} rx={6} fill="#ecfccb" stroke={p.outline} strokeWidth={1.5} />
      {/* Vacuole */}
      <ellipse cx={280} cy={180} rx={90} ry={70} fill="#a5f3fc" stroke={p.outline} strokeWidth={1.5} opacity={0.85} />
      {/* Nucleus */}
      <circle cx={180} cy={220} r={32} fill={p.fill} stroke={p.outline} strokeWidth={1.5} />
      <circle cx={180} cy={220} r={12} fill={p.organDeep} stroke={p.outline} />
      {/* Chloroplasts */}
      {[
        [120, 120],
        [150, 160],
        [110, 200],
        [200, 120],
      ].map(([x, y]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={22} ry={12} fill="#4ade80" stroke={p.outline} strokeWidth={1} />
      ))}
    </g>
  );
}

function AnimalCellBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <ellipse cx={240} cy={180} rx={160} ry={120} fill="#fce7f3" stroke={p.outline} strokeWidth={2.5} />
      <circle cx={250} cy={170} r={40} fill={p.fill} stroke={p.outline} strokeWidth={1.5} />
      <circle cx={250} cy={170} r={14} fill={p.organDeep} stroke={p.outline} />
      {/* Mitochondrion */}
      <ellipse cx={160} cy={230} rx={36} ry={16} fill={p.fillAlt} stroke={p.outline} strokeWidth={1.25} />
      <path d="M135 230 Q145 220 155 230 Q165 240 175 230 Q185 220 190 230" fill="none" stroke={p.outline} strokeWidth={1} />
      {/* Lysosome */}
      <circle cx={320} cy={220} r={14} fill="#fda4af" stroke={p.outline} />
      {/* Membrane label anchor region */}
      <ellipse cx={100} cy={100} rx={8} ry={8} fill="none" stroke={p.outline} strokeWidth={1} />
    </g>
  );
}

function LeafBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <path
        d="M120 260 C160 80 320 60 360 160 C320 260 200 300 120 260 Z"
        fill="#86efac"
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Midrib */}
      <path d="M130 255 C200 200 260 160 350 155" fill="none" stroke={p.outline} strokeWidth={2} />
      {/* Veins */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M${180 + i * 40} ${230 - i * 18} L${200 + i * 35} ${180 - i * 10}`}
          fill="none"
          stroke={p.outline}
          strokeWidth={1}
        />
      ))}
      {/* Petiole */}
      <path d="M120 260 L70 300" stroke={p.outline} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

function FlowerBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Petals */}
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx={200}
          cy={160}
          rx={36}
          ry={70}
          fill="#f9a8d4"
          stroke={p.outline}
          strokeWidth={1.25}
          transform={`rotate(${deg} 200 200)`}
        />
      ))}
      {/* Center / pistil */}
      <circle cx={200} cy={200} r={28} fill={p.fat} stroke={p.outline} strokeWidth={1.5} />
      <line x1={200} y1={200} x2={200} y2={170} stroke={p.outline} strokeWidth={2} />
      {/* Stamens */}
      {[ -20, 0, 20 ].map((dx) => (
        <g key={dx}>
          <line x1={200} y1={200} x2={200 + dx} y2={155} stroke={p.outline} strokeWidth={1.5} />
          <circle cx={200 + dx} cy={150} r={5} fill={p.accent} stroke={p.outline} />
        </g>
      ))}
      {/* Sepals */}
      <path d="M170 250 L200 230 L230 250 L200 280 Z" fill="#86efac" stroke={p.outline} />
      {/* Stem */}
      <path d="M200 280 L200 380" stroke="#15803d" strokeWidth={6} />
    </g>
  );
}

function DigestiveBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Head / mouth */}
      <circle cx={160} cy={40} r={22} fill={p.fillAlt} stroke={p.outline} strokeWidth={1.5} />
      {/* Esophagus */}
      <rect x={152} y={62} width={16} height={70} rx={4} fill={p.vessel} stroke={p.outline} />
      {/* Stomach */}
      <path
        d="M120 140 C100 160 100 200 130 210 C160 220 190 200 185 170 C180 145 150 130 120 140 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Small intestine coils */}
      <path
        d="M150 220 C100 240 100 280 150 300 C200 320 200 280 150 260 C100 240 120 320 170 340 C220 360 200 380 160 400"
        fill="none"
        stroke={p.organDeep}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d="M150 220 C100 240 100 280 150 300 C200 320 200 280 150 260 C100 240 120 320 170 340 C220 360 200 380 160 400"
        fill="none"
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Large intestine frame */}
      <path
        d="M100 360 H220 V440 H100 V400"
        fill="none"
        stroke={p.fillAlt}
        strokeWidth={14}
        strokeLinejoin="round"
      />
      <path
        d="M100 360 H220 V440 H100 V400"
        fill="none"
        stroke={p.outline}
        strokeWidth={1.5}
      />
    </g>
  );
}

function RespiratoryBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Nasal */}
      <ellipse cx={200} cy={40} rx={28} ry={18} fill={p.fillSoft} stroke={p.outline} strokeWidth={1.5} />
      {/* Trachea */}
      <rect x={190} y={60} width={20} height={90} rx={4} fill={p.fillAlt} stroke={p.outline} />
      {[75, 95, 115, 135].map((y) => (
        <line key={y} x1={190} y1={y} x2={210} y2={y} stroke={p.outline} strokeWidth={1} />
      ))}
      {/* Bronchi */}
      <path d="M200 150 L140 200" stroke={p.outline} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M200 150 L260 200" stroke={p.outline} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* Lungs */}
      <path
        d="M80 200 C70 260 90 340 140 350 C170 320 170 240 150 200 C130 180 100 180 80 200 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={1.5}
      />
      <path
        d="M320 200 C330 260 310 340 260 350 C230 320 230 240 250 200 C270 180 300 180 320 200 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={1.5}
      />
    </g>
  );
}

function EarBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Outer ear */}
      <path
        d="M40 80 C20 120 30 200 70 240 C100 210 90 140 100 100 C90 70 60 60 40 80 Z"
        fill={p.fillAlt}
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Canal */}
      <path d="M90 160 H180" stroke={p.outline} strokeWidth={14} strokeLinecap="round" />
      <path d="M90 160 H180" stroke={p.fillSoft} strokeWidth={8} strokeLinecap="round" />
      {/* Middle ear cavity */}
      <rect x={180} y={120} width={70} height={80} rx={8} fill={p.fat} stroke={p.outline} strokeWidth={1.5} />
      {/* Ossicles */}
      <circle cx={200} cy={150} r={6} fill={p.outline} />
      <circle cx={220} cy={160} r={5} fill={p.outline} />
      <circle cx={235} cy={175} r={5} fill={p.outline} />
      {/* Cochlea */}
      <path
        d="M280 160 C300 140 340 150 340 180 C340 210 300 220 290 200 C285 190 295 180 310 185"
        fill="none"
        stroke={p.accent}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <ellipse cx={320} cy={190} rx={40} ry={35} fill={p.fill} stroke={p.outline} strokeWidth={1.5} opacity={0.5} />
    </g>
  );
}

function ToothBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Crown enamel */}
      <path
        d="M100 40 C90 80 90 120 110 140 H210 C230 120 230 80 220 40 C180 20 140 20 100 40 Z"
        fill="#f8fafc"
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Dentin */}
      <path
        d="M120 70 C115 100 115 130 130 150 H190 C205 130 205 100 200 70 C170 55 150 55 120 70 Z"
        fill="#fde68a"
        stroke={p.outline}
        strokeWidth={1.25}
      />
      {/* Pulp */}
      <path
        d="M145 120 C145 150 150 180 160 210 C170 180 175 150 175 120 C165 110 155 110 145 120 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={1}
      />
      {/* Root */}
      <path
        d="M130 150 L145 340 L160 210 L175 340 L190 150"
        fill="#fed7aa"
        stroke={p.outline}
        strokeWidth={1.5}
      />
      {/* Gum line */}
      <path d="M80 150 H240" stroke="#86efac" strokeWidth={8} strokeLinecap="round" />
    </g>
  );
}

function DnaBody({ p }: { p: ScientificPalette }) {
  const pairs = Array.from({ length: 10 }, (_, i) => i);
  return (
    <g>
      {pairs.map((i) => {
        const y = 40 + i * 36;
        const offset = (i % 2) * 30;
        const x1 = 110 + offset;
        const x2 = 210 - offset;
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={p.vessel} strokeWidth={3} />
            <circle cx={x1} cy={y} r={8} fill={i % 2 ? p.accent : "#2563eb"} stroke={p.outline} />
            <circle cx={x2} cy={y} r={8} fill={i % 2 ? "#2563eb" : p.accent} stroke={p.outline} />
          </g>
        );
      })}
      {/* Backbone curves */}
      <path
        d="M110 40 C160 100 60 180 110 250 C160 320 60 380 110 400"
        fill="none"
        stroke={p.outline}
        strokeWidth={3}
      />
      <path
        d="M210 40 C160 100 260 180 210 250 C160 320 260 380 210 400"
        fill="none"
        stroke={p.outline}
        strokeWidth={3}
      />
    </g>
  );
}

function LungsBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <rect x={200} y={40} width={20} height={70} rx={4} fill={p.fillAlt} stroke={p.outline} />
      <path d="M210 110 L150 150" stroke={p.outline} strokeWidth={5} fill="none" />
      <path d="M210 110 L270 150" stroke={p.outline} strokeWidth={5} fill="none" />
      <path
        d="M70 150 C50 220 70 310 130 320 C170 280 170 200 150 150 C130 130 90 130 70 150 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      <path
        d="M350 150 C370 220 350 310 290 320 C250 280 250 200 270 150 C290 130 330 130 350 150 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Bronchiole hints */}
      <path d="M130 200 L110 240 M130 200 L150 250" stroke={p.outline} strokeWidth={1.25} fill="none" />
      <path d="M290 200 L270 250 M290 200 L310 240" stroke={p.outline} strokeWidth={1.25} fill="none" />
    </g>
  );
}

function StomachBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      {/* Esophagus in */}
      <path d="M160 40 L170 90" stroke={p.outline} strokeWidth={10} strokeLinecap="round" />
      <path d="M160 40 L170 90" stroke={p.vessel} strokeWidth={5} strokeLinecap="round" />
      <path
        d="M140 90 C100 110 90 180 120 230 C150 280 230 290 280 250 C310 220 300 150 260 120 C220 90 180 80 140 90 Z"
        fill={p.organ}
        stroke={p.outline}
        strokeWidth={2}
      />
      {/* Rugae */}
      <path d="M160 140 C180 160 200 150 220 170" fill="none" stroke={p.outline} strokeWidth={1.25} />
      <path d="M150 180 C175 200 205 190 230 210" fill="none" stroke={p.outline} strokeWidth={1.25} />
      {/* Pylorus out */}
      <path d="M270 250 L320 290" stroke={p.outline} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
}

function MitochondriaBody({ p }: { p: ScientificPalette }) {
  return (
    <g>
      <ellipse cx={210} cy={140} rx={160} ry={80} fill={p.fillAlt} stroke={p.outline} strokeWidth={2.5} />
      <ellipse cx={210} cy={140} rx={130} ry={55} fill={p.fillSoft} stroke={p.outline} strokeWidth={1.5} />
      {/* Cristae */}
      {[
        "M100 140 Q130 100 160 140 Q190 180 220 140",
        "M160 140 Q190 100 220 140 Q250 180 280 140",
        "M220 140 Q250 100 280 140 Q310 180 340 140",
      ].map((d) => (
        <path key={d} d={d} fill="none" stroke={p.accent} strokeWidth={3} />
      ))}
    </g>
  );
}
