// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterList } from "@/components/character-list";
import { messages } from "@/lib/messages";

const API = "https://rickandmortyapi.com/api/character/avatar";

describe("CharacterList", () => {
  it("mostra a mensagem quando a lista está vazia", () => {
    render(<CharacterList characters={[]} />);
    expect(screen.getByText(messages.emptyEpisode)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renderiza os personagens na ordem recebida, com imagem decorativa", () => {
    render(
      <CharacterList
        characters={[
          { id: 4, name: "Beth Smith", image: `${API}/4.jpeg` },
          { id: 2, name: "Morty Smith", image: `${API}/2.jpeg` },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["Beth Smith", "Morty Smith"]);
    // alt="" torna a imagem decorativa: o nome ao lado já a descreve.
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(items[0]?.querySelector("img")).toHaveAttribute("alt", "");
  });

  it("aceita nomes repetidos sem colidir as chaves", () => {
    render(
      <CharacterList
        characters={[
          { id: 1, name: "Rick", image: `${API}/1.jpeg` },
          { id: 2, name: "Rick", image: `${API}/1.jpeg` },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
