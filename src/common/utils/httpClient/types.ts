export namespace NResponse {
  export type TMinimalStandart<T> = {
    ok: boolean;
    message?: string;
    targetResponse: T;
  };
}
