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
    <ol className="flex flex-col gap-2">
      {characters.map(({ name, image }, index) => (
        <li key={`${index}-${name}`} className="flex items-center gap-3">
          <Image
            src={image}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full bg-zinc-200 object-cover dark:bg-zinc-800"
          />
          <span>{name}</span>
        </li>
      ))}
    </ol>
  );
}
