/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ScientificDiagram } from "@/components/diagrams/ScientificDiagram";
import { FlowchartDiagram } from "@/components/diagrams/FlowchartDiagram";
import { matchScientificTopic } from "@/lib/diagrams/matcher";

describe("diagram rendering", () => {
  it("renders kidney color labelled with leader lines", () => {
    const { container } = render(
      <ScientificDiagram templateId="sci-kidney" colorMode="color" labelled />,
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(container.textContent).toMatch(/Cortex/);
    expect(container.textContent).toMatch(/Ureter/);
    expect(container.querySelectorAll(".diagram-labels line").length).toBeGreaterThan(0);
  });

  it("renders kidney bw unlabelled without labels", () => {
    const { container } = render(
      <ScientificDiagram templateId="sci-kidney" colorMode="bw" labelled={false} />,
    );
    expect(container.textContent).not.toMatch(/Cortex/);
    expect(container.querySelectorAll(".diagram-labels line").length).toBe(0);
  });

  it("renders heart, eye, plant cell, neuron", () => {
    for (const id of ["sci-heart", "sci-eye", "sci-plant-cell", "sci-neuron"] as const) {
      const { container, unmount } = render(
        <ScientificDiagram templateId={id} colorMode="color" labelled />,
      );
      expect(container.querySelector("svg")).toBeTruthy();
      unmount();
    }
  });

  it("renders flowchart with start and end", () => {
    const { container } = render(
      <FlowchartDiagram topic="software development process" orientation="vertical" />,
    );
    expect(container.textContent).toMatch(/Start/);
    expect(container.textContent).toMatch(/End/);
    expect(container.textContent).toMatch(/Build/);
  });

  it("matcher rejects empty and unsupported", () => {
    expect(matchScientificTopic("").ok).toBe(false);
    expect(matchScientificTopic("quantum flux capacitor").ok).toBe(false);
  });
});
