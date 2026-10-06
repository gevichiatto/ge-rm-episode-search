// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorMessage } from "@/components/error-message";
import { messages } from "@/lib/messages";
import type { EpisodeSearchErrorCode } from "@/lib/rickandmorty/errors";

const retriable: EpisodeSearchErrorCode[] = ["network", "timeout", "upstream"];
const final: EpisodeSearchErrorCode[] = ["validation", "episode-not-found"];

describe("ErrorMessage", () => {
  it.each([...retriable, ...final])("mostra a mensagem de %s", (code) => {
    render(<ErrorMessage code={code} query="1" />);
    expect(screen.getByRole("alert")).toHaveTextContent(messages.errors[code]);
  });

  it.each(retriable)("oferece tentar novamente em %s, preservando a busca", (code) => {
    render(<ErrorMessage code={code} query="S01E01&x=1" />);
    const link = screen.getByRole("link", { name: messages.retry });
    expect(link).toHaveAttribute("href", "/?q=S01E01%26x%3D1");
  });

  it.each(final)("não oferece tentar novamente em %s", (code) => {
    render(<ErrorMessage code={code} query="1" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("não oferece tentar novamente sem a busca original", () => {
    render(<ErrorMessage code="network" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
