export function synchronized<T> (proc: (...args: any[]) => Promise<T>) {
  let inFlight: Promise<T> | null = null;

  return (...args: any[]) => {
    if (!inFlight) {
      inFlight = (async () => {
        try {
          return await proc(...args);
        } finally {
          inFlight = null;
        }
      })();
    }

    return inFlight;
  };
}

export function synchronizedOn<T>(proc: (...args: any[]) => Promise<T>) {
  let flights: { [k: string]: Promise<T> } = {};

  return (key: string, ...args: any[]) => {
    if (!flights[key]) {
      flights[key] = (async () => {
        try {
          return await proc(...args);
        } finally {
          delete flights[key];
        }
      })();
    }

    return flights[key];
  };
}