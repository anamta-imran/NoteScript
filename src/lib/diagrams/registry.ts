import type { DiagramTemplateId } from "@/lib/types";
import type { ScientificTemplateDef } from "./types";

export const SCIENTIFIC_TEMPLATES: ScientificTemplateDef[] = [
  {
    id: "sci-heart",
    title: "Human Heart",
    category: "anatomy",
    aliases: ["heart", "human heart", "cardiac", "heart anatomy"],
    viewBox: "0 0 480 420",
    labels: [
      { id: "ra", text: "Right atrium", x: 160, y: 130, lx: 125, ly: 90 },
      { id: "la", text: "Left atrium", x: 300, y: 130, lx: 360, ly: 90 },
      { id: "rv", text: "Right ventricle", x: 170, y: 250, lx: 125, ly: 270 },
      { id: "lv", text: "Left ventricle", x: 290, y: 250, lx: 360, ly: 270 },
      { id: "aorta", text: "Aorta", x: 240, y: 70, lx: 300, ly: 40 },
    ],
  },
  {
    id: "sci-kidney",
    title: "Human Kidney",
    category: "anatomy",
    aliases: ["kidney", "human kidney", "kidney anatomy", "renal", "renal system kidney"],
    viewBox: "0 0 480 420",
    labels: [
      { id: "cortex", text: "Cortex", x: 200, y: 110, lx: 110, ly: 80 },
      { id: "medulla", text: "Medulla", x: 240, y: 200, lx: 110, ly: 200 },
      { id: "pelvis", text: "Renal pelvis", x: 300, y: 230, lx: 360, ly: 220 },
      { id: "ureter", text: "Ureter", x: 310, y: 320, lx: 360, ly: 340 },
      { id: "capsule", text: "Capsule", x: 180, y: 160, lx: 110, ly: 160 },
    ],
  },
  {
    id: "sci-liver",
    title: "Human Liver",
    category: "anatomy",
    aliases: ["liver", "human liver", "hepatic"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "rl", text: "Right lobe", x: 300, y: 160, lx: 380, ly: 120 },
      { id: "ll", text: "Left lobe", x: 170, y: 150, lx: 40, ly: 120 },
      { id: "gb", text: "Gallbladder", x: 280, y: 240, lx: 380, ly: 260 },
    ],
  },
  {
    id: "sci-eye",
    title: "Human Eye",
    category: "anatomy",
    aliases: ["eye", "human eye", "eyeball", "ocular"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "cornea", text: "Cornea", x: 120, y: 180, lx: 40, ly: 140 },
      { id: "lens", text: "Lens", x: 190, y: 180, lx: 40, ly: 200 },
      { id: "iris", text: "Iris", x: 160, y: 160, lx: 40, ly: 100 },
      { id: "retina", text: "Retina", x: 340, y: 180, lx: 380, ly: 160 },
      { id: "optic", text: "Optic nerve", x: 400, y: 200, lx: 380, ly: 260 },
    ],
  },
  {
    id: "sci-brain",
    title: "Human Brain",
    category: "anatomy",
    aliases: ["brain", "human brain", "cerebrum", "brain anatomy"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "cerebrum", text: "Cerebrum", x: 240, y: 120, lx: 380, ly: 80 },
      { id: "cerebellum", text: "Cerebellum", x: 280, y: 250, lx: 380, ly: 260 },
      { id: "brainstem", text: "Brainstem", x: 250, y: 280, lx: 40, ly: 300 },
    ],
  },
  {
    id: "sci-neuron",
    title: "Neuron",
    category: "cell",
    aliases: ["neuron", "nerve cell", "neurone"],
    viewBox: "0 0 520 280",
    labels: [
      { id: "dendrite", text: "Dendrites", x: 80, y: 80, lx: 40, ly: 40 },
      { id: "soma", text: "Cell body", x: 160, y: 140, lx: 40, ly: 160 },
      { id: "axon", text: "Axon", x: 300, y: 140, lx: 280, ly: 60 },
      { id: "terminal", text: "Axon terminal", x: 450, y: 140, lx: 380, ly: 220 },
    ],
  },
  {
    id: "sci-plant-cell",
    title: "Plant Cell",
    category: "cell",
    aliases: ["plant cell", "plantcell"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "wall", text: "Cell wall", x: 80, y: 80, lx: 40, ly: 50 },
      { id: "chloro", text: "Chloroplast", x: 140, y: 160, lx: 40, ly: 180 },
      { id: "vacuole", text: "Vacuole", x: 280, y: 180, lx: 380, ly: 160 },
      { id: "nucleus", text: "Nucleus", x: 220, y: 220, lx: 380, ly: 260 },
    ],
  },
  {
    id: "sci-animal-cell",
    title: "Animal Cell",
    category: "cell",
    aliases: ["animal cell", "animalcell"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "membrane", text: "Membrane", x: 100, y: 100, lx: 40, ly: 70 },
      { id: "nucleus", text: "Nucleus", x: 240, y: 180, lx: 380, ly: 160 },
      { id: "mito", text: "Mitochondrion", x: 160, y: 220, lx: 40, ly: 260 },
    ],
  },
  {
    id: "sci-leaf",
    title: "Leaf",
    category: "plant",
    aliases: ["leaf", "plant leaf", "leaf structure"],
    viewBox: "0 0 480 360",
    labels: [
      { id: "blade", text: "Blade", x: 240, y: 140, lx: 380, ly: 100 },
      { id: "vein", text: "Vein", x: 240, y: 200, lx: 380, ly: 200 },
      { id: "petiole", text: "Petiole", x: 120, y: 260, lx: 40, ly: 280 },
    ],
  },
  {
    id: "sci-flower",
    title: "Flower",
    category: "plant",
    aliases: ["flower", "floral", "flower anatomy"],
    viewBox: "0 0 400 400",
    labels: [
      { id: "petal", text: "Petal", x: 260, y: 140, lx: 320, ly: 80 },
      { id: "stamen", text: "Stamen", x: 200, y: 180, lx: 320, ly: 180 },
      { id: "pistil", text: "Pistil", x: 200, y: 220, lx: 40, ly: 220 },
      { id: "sepal", text: "Sepal", x: 160, y: 280, lx: 40, ly: 300 },
    ],
  },
  {
    id: "sci-digestive",
    title: "Digestive System",
    category: "system",
    aliases: ["digestive system", "digestion", "digestive"],
    viewBox: "0 0 320 520",
    labels: [
      { id: "mouth", text: "Mouth", x: 160, y: 40, lx: 240, ly: 30 },
      { id: "eso", text: "Esophagus", x: 160, y: 100, lx: 240, ly: 100 },
      { id: "stomach", text: "Stomach", x: 140, y: 180, lx: 40, ly: 180 },
      { id: "si", text: "Small intestine", x: 160, y: 300, lx: 240, ly: 300 },
      { id: "li", text: "Large intestine", x: 160, y: 400, lx: 40, ly: 420 },
    ],
  },
  {
    id: "sci-respiratory",
    title: "Respiratory System",
    category: "system",
    aliases: ["respiratory system", "respiration", "breathing system"],
    viewBox: "0 0 400 460",
    labels: [
      { id: "nose", text: "Nasal cavity", x: 200, y: 40, lx: 280, ly: 30 },
      { id: "trachea", text: "Trachea", x: 200, y: 140, lx: 280, ly: 140 },
      { id: "bronchi", text: "Bronchi", x: 200, y: 200, lx: 280, ly: 200 },
      { id: "lungs", text: "Lungs", x: 140, y: 280, lx: 40, ly: 280 },
    ],
  },
  {
    id: "sci-ear",
    title: "Human Ear",
    category: "anatomy",
    aliases: ["ear", "human ear", "ear anatomy"],
    viewBox: "0 0 480 320",
    labels: [
      { id: "outer", text: "Outer ear", x: 80, y: 160, lx: 40, ly: 80 },
      { id: "middle", text: "Middle ear", x: 200, y: 160, lx: 180, ly: 60 },
      { id: "inner", text: "Inner ear", x: 320, y: 160, lx: 360, ly: 60 },
      { id: "canal", text: "Ear canal", x: 140, y: 180, lx: 40, ly: 240 },
    ],
  },
  {
    id: "sci-tooth",
    title: "Tooth",
    category: "anatomy",
    aliases: ["tooth", "teeth", "tooth anatomy"],
    viewBox: "0 0 320 420",
    labels: [
      { id: "enamel", text: "Enamel", x: 160, y: 80, lx: 240, ly: 50 },
      { id: "dentin", text: "Dentin", x: 160, y: 160, lx: 240, ly: 160 },
      { id: "pulp", text: "Pulp", x: 160, y: 220, lx: 40, ly: 220 },
      { id: "root", text: "Root", x: 160, y: 320, lx: 240, ly: 340 },
    ],
  },
  {
    id: "sci-dna",
    title: "DNA",
    category: "molecular",
    aliases: ["dna", "deoxyribonucleic acid", "double helix"],
    viewBox: "0 0 320 420",
    labels: [
      { id: "backbone", text: "Sugar-phosphate backbone", x: 120, y: 100, lx: 200, ly: 60 },
      { id: "base", text: "Base pair", x: 160, y: 200, lx: 200, ly: 200 },
      { id: "helix", text: "Double helix", x: 160, y: 320, lx: 200, ly: 340 },
    ],
  },
  {
    id: "sci-lungs",
    title: "Lungs",
    category: "anatomy",
    aliases: ["lungs", "human lungs", "lung"],
    viewBox: "0 0 420 360",
    labels: [
      { id: "rl", text: "Right lung", x: 130, y: 200, lx: 40, ly: 160 },
      { id: "ll", text: "Left lung", x: 290, y: 200, lx: 340, ly: 160 },
      { id: "trachea", text: "Trachea", x: 210, y: 60, lx: 280, ly: 40 },
    ],
  },
  {
    id: "sci-stomach",
    title: "Stomach",
    category: "anatomy",
    aliases: ["stomach", "gastric"],
    viewBox: "0 0 420 360",
    labels: [
      { id: "cardia", text: "Cardia", x: 180, y: 80, lx: 40, ly: 60 },
      { id: "body", text: "Body", x: 220, y: 180, lx: 340, ly: 160 },
      { id: "pylorus", text: "Pylorus", x: 260, y: 260, lx: 340, ly: 280 },
    ],
  },
  {
    id: "sci-mitochondria",
    title: "Mitochondria",
    category: "cell",
    aliases: ["mitochondria", "mitochondrion", "powerhouse of the cell"],
    viewBox: "0 0 420 280",
    labels: [
      { id: "om", text: "Outer membrane", x: 80, y: 80, lx: 40, ly: 40 },
      { id: "im", text: "Inner membrane", x: 140, y: 140, lx: 40, ly: 160 },
      { id: "cristae", text: "Cristae", x: 240, y: 140, lx: 320, ly: 80 },
      { id: "matrix", text: "Matrix", x: 220, y: 180, lx: 320, ly: 220 },
    ],
  },
];

export function getScientificTemplate(id: DiagramTemplateId): ScientificTemplateDef | undefined {
  return SCIENTIFIC_TEMPLATES.find((t) => t.id === id);
}

export function listScientificTitles(): string[] {
  return SCIENTIFIC_TEMPLATES.map((t) => t.title);
}

export const SCIENTIFIC_IDS = SCIENTIFIC_TEMPLATES.map((t) => t.id);
