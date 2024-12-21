export type TNewsItemDetails = {
  by: string;
  id: number;
  descendants?: number;
  kids?: number[];
  score: number;
  time: number;
  title: string;
  text?: string;
  type: string;
  url: string;
  deleted?: boolean;
  parent?: number;
}
export type TNewsState = {
  items: number[];
  details: {
    [key: string]: TNewsItemDetails;
  };
  errors: {
    [key: string]: string;
  },
  mainRequestResult: {
    ok: boolean;
    message?: string;
  } | undefined;
  pollingCounter: number;
}
