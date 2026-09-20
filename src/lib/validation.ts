import { z } from "zod";
import {
  HANDWRITING_STYLES,
  LANGUAGES,
  NOTE_LENGTHS,
  SOURCE_TYPES,
  SUBJECTS,
} from "./types";

export const emailSchema = z.string().trim().email("Enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required.").max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export const generationOptionsSchema = z.object({
  handwritingStyle: z.enum(HANDWRITING_STYLES),
  noteLength: z.enum(NOTE_LENGTHS),
  language: z.enum(LANGUAGES),
  subject: z.enum(SUBJECTS),
  smartHighlighting: z.boolean(),
  importantPoints: z.boolean(),
  formulas: z.boolean(),
  examples: z.boolean(),
  diagrams: z.boolean(),
  chapterDetection: z.boolean(),
  diagramTemplate: z
    .enum([
      "flowchart",
      "process-arrows",
      "cell-simple",
      "atom-simple",
      "circuit-simple",
      "force-diagram",
      "timeline",
      "algorithm-box",
      "water-cycle",
      "blank-labeled",
    ])
    .optional(),
  diagramStyle: z
    .enum(["clean-study", "handwritten", "exam-diagram", "detailed", "minimal"])
    .optional(),
  diagramPrompt: z.string().max(4000).optional(),
});

export const createJobSchema = z.object({
  sourceType: z.enum(SOURCE_TYPES),
  title: z.string().trim().max(160).optional(),
  text: z.string().max(200000).optional(),
  youtubeUrl: z.string().optional(),
  fileId: z.string().optional(),
  folderId: z.string().optional(),
  options: generationOptionsSchema,
});
