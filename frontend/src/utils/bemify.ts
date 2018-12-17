export type BEMUtil = (element?: string, modifier?: string) => string;

export default function bemify (block: string): BEMUtil {
  return (element?: string, modifier?: string): string => {
    if (element && modifier) {
      return `${block}__${element}--${modifier}`;
    }

    if (element) {
      return `${block}__${element}`;
    }

    if (modifier) {
      return `${block}--${modifier}`;
    }

    return block;
  };
}