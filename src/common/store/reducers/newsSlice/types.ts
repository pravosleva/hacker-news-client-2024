import { TLocalStorageUsageInfo } from "~/common/utils/object-ops";

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
  FAV = 'favorites',
}
export const uiDict: {
  [key in ENewsMode]: string;
} = {
  [ENewsMode.ASK]: 'ask',
  [ENewsMode.BEST]: 'best',
  [ENewsMode.JOB]: 'job',
  [ENewsMode.NEW]: 'new',
  [ENewsMode.SHOW]: 'show',
  [ENewsMode.TOP]: 'top',
  [ENewsMode.FAV]: 'favorites',
}
export type TMetaCacheSample = {
  url?: string;
  image?: string;
  title?: string;
  description?: string;
}
export type TNewsState = {
  newsMode: ENewsMode;
  lastUpdateTs: number;
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
  persistedFavorites: number[];
  metaCache: {
    [key: string]: {
      ts: number;
      meta?: TMetaCacheSample;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error?: string | { [key: string]: any };
    };
  };
  lsUsageInfo: {
    meta: string;
  }
}
