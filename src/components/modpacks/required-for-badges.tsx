type RequiredForBadgesProps = {
  names: string[];
};

export function RequiredForBadges({ names }: RequiredForBadgesProps) {
  if (names.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name) => (
        <span
          key={name}
          className="inline-flex max-w-full items-center rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200 ring-1 ring-amber-400/20"
          title={`Required for ${name}`}
        >
          <span className="truncate">Required for {name}</span>
        </span>
      ))}
    </div>
  );
}
