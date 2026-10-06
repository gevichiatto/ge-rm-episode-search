// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchForm } from "@/components/search-form";
import { messages } from "@/lib/messages";

describe("SearchForm", () => {
  it("é um formulário GET para / com o campo q", () => {
    render(<SearchForm />);

    const form = screen.getByRole("search");
    expect(form).toHaveAttribute("method", "GET");
    expect(form).toHaveAttribute("action", "/");
    expect(screen.getByLabelText(messages.searchLabel)).toHaveAttribute("name", "q");
  });

  it("começa vazio sem valor padrão", () => {
    render(<SearchForm />);
    expect(screen.getByLabelText(messages.searchLabel)).toHaveValue("");
  });

  it("usa o valor padrão recebido", () => {
    render(<SearchForm defaultValue="S01E01" />);
    expect(screen.getByLabelText(messages.searchLabel)).toHaveValue("S01E01");
  });

  it("exige preenchimento e tem botão de envio", () => {
    render(<SearchForm />);
    expect(screen.getByLabelText(messages.searchLabel)).toBeRequired();
    expect(screen.getByRole("button", { name: messages.searchButton })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});
