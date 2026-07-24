export const parseFlags = (argv: string[]) => {
  const flags: Record<string, string> = {};
  const bools = new Set<string>();
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        bools.add(key);
      } else {
        flags[key] = next;
        i++;
      }
    }
  }
  return { flags, bools };
};

export const parseNumberFlag = (value: string | undefined, flagName: string): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`--${flagName} must be a number, got "${value}"`);
  }
  return parsed;
};

export const parseEnumFlag = <T extends string>(
  value: string | undefined,
  flagName: string,
  allowed: readonly T[],
  fallback: T,
): T => {
  if (value === undefined) return fallback;
  if (!allowed.includes(value as T)) {
    throw new Error(`--${flagName} must be one of ${allowed.join(", ")}, got "${value}"`);
  }
  return value as T;
};

// BYOK model resolution for the media-generation scripts. Precedence:
//   --model <slug>  >  process.env[envVar]  >  built-in default.
// Lets the user bring their own model per media type without editing code.
export const resolveModel = (
  flagValue: string | undefined,
  envVar: string,
  fallback: string,
): string => {
  const fromEnv = process.env[envVar];
  return flagValue || (fromEnv && fromEnv.trim()) || fallback;
};

export const runCli = (main: () => Promise<void>) => {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
};
