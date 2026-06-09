declare module "culori" {
  export function formatHex(color: string): string | undefined;
  export function formatCss(color: string, mode?: string): string | undefined;
}
