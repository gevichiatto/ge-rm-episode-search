import Image from "next/image";

import { messages } from "@/lib/messages";
import type { CharacterSummary } from "@/lib/rickandmorty/service";

interface CharacterListProps {
  characters: readonly CharacterSummary[];
}

export function CharacterList({ characters }: CharacterListProps) {
  if (characters.length === 0) {
    return <p>{messages.emptyEpisode}</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {characters.map(({ name, image }, index) => (
        <li key={`${index}-${name}`} className="flex items-center gap-3">
          <Image
            src={image}
            alt=""
            width={64}
            height={64}
            className="size-16 rounded-full bg-zinc-200 object-cover ring-2 ring-accent dark:bg-zinc-800"
          />
          <span>{name}</span>
        </li>
      ))}
    </ol>
  );
}
