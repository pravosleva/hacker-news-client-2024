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
  TOPSTORIES = 'topstories',
  NEWSTORIES = 'newstories',
  BESTSTORIES = 'beststories',
  SHOWSTORIES = 'showstories',
  ASKSTORIES = 'askstories',
  JOBSTORIES = 'jobstories',
}
export const uiDict = {
  [ENewsMode.ASKSTORIES]: 'ask',
  [ENewsMode.BESTSTORIES]: 'best',
  [ENewsMode.JOBSTORIES]: 'job',
  [ENewsMode.NEWSTORIES]: 'new',
  [ENewsMode.SHOWSTORIES]: 'show',
  [ENewsMode.TOPSTORIES]: 'top',
}
export type TNewsState = {
  newsMode: ENewsMode;
  targetItemsCounters: {
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
