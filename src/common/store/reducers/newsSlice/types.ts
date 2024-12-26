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
export enum ENewsMode {
  TOP = 'topstories',
  NEW = 'newstories',
  BEST = 'beststories',
  SHOW = 'showstories',
  ASK = 'askstories',
  JOB = 'jobstories',
}
export const uiDict = {
  [ENewsMode.ASK]: 'ask',
  [ENewsMode.BEST]: 'best',
  [ENewsMode.JOB]: 'job',
  [ENewsMode.NEW]: 'new',
  [ENewsMode.SHOW]: 'show',
  [ENewsMode.TOP]: 'top',
}
export type TNewsState = {
  newsMode: ENewsMode;
  loadedItemsCounters: {
    [key in ENewsMode]: number;
  };
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
