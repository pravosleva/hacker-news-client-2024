import { groupLog } from '~/common/utils/groupLog'

// NOTE: Code was refactored to ts,
// original js vanilla code taken from here: https://stackoverflow.com/questions/65719387/browser-tab-badge-notification/65720799#65720799

type TOptions = {
  backgroundColor: string;
  color: string;
  scale: number;
  position: 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  radius: number;
  src: string;
  onChange?: () => void;
}
type TProps = {
  options: TOptions;
  isDebugEnadled: boolean;
}

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL

class Badger {
  private static instance: Badger
  public static getInstance(ps: TProps): Badger {
    if (!Badger.instance) Badger.instance = new Badger(ps)

    return Badger.instance
  }
  private isDebugEnadled: boolean;
  private settings: TOptions;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private img: HTMLImageElement; // CanvasImageSource;
  private _value: number | string;
  private computeds: {
    favicon: {
      src: string;
      size: {
        w: number;
        h: number;
      };
    };
    badge:{
      value: string;
      size: {
        w: number;
        h: number;
      };
      offset: {
        x: number;
        y: number;
      };
    };
  };

  constructor({ options, isDebugEnadled }: TProps) {
    this.isDebugEnadled = isDebugEnadled
    this.settings = options
    this.canvas = document.createElement('canvas')
    this.img = new Image(16, 16)
    this.img.src = this.faviconEL?.getAttribute('href') || options.src
    this.ctx = this.canvas.getContext('2d')
    this._value = 'init' // Draft
    this.computeds = {
      favicon: {
        src: options.src || '',
        size: {
          w: 16,
          h: 16,
        },
      },
      badge: {
        value: '',
        size: {
          w: 16,
          h: 16,
        },
        offset: {
          x: 0,
          y: 0,
        },
      },
    }
  }

  get faviconEL (): HTMLLinkElement | null {
    return document.querySelector('link[rel$=icon]')
  }

  private _drawIcon() {
    if (!!this.ctx) {
      this.ctx.clearRect(0, 0, this.computeds.favicon.size.w, this.computeds.favicon.size.h);
      this.ctx.drawImage(this.img, 0, 0, this.computeds.favicon.size.w, this.computeds.favicon.size.h);
    } else throw new Error('_drawIcon: No ctx #1')
  }

  private _drawShape() {
    try {
      if (!!this.ctx) {
        const r = this.settings.radius
        const xa = this.computeds.badge.offset.x
        const ya = this.computeds.badge.offset.y
        const xb = this.computeds.badge.offset.x + this.computeds.badge.size.w
        const yb = this.computeds.badge.offset.y + this.computeds.badge.size.h
        this.ctx.beginPath()
        this.ctx.moveTo(xb - r, ya)
        this.ctx.quadraticCurveTo(xb, ya, xb, ya + r)
        this.ctx.lineTo(xb, yb - r)
        this.ctx.quadraticCurveTo(xb, yb, xb - r, yb)
        this.ctx.lineTo(xa + r, yb)
        this.ctx.quadraticCurveTo(xa, yb, xa, yb - r)
        this.ctx.lineTo(xa, ya + r)
        this.ctx.quadraticCurveTo(xa, ya, xa + r, ya)
        this.ctx.fillStyle = this.settings.backgroundColor
        this.ctx.fill()
        this.ctx.closePath()
      }
      else throw new Error('No ctx')
    } catch (err: unknown) {
      if (this.isDebugEnadled)
        groupLog({ namespace: `_drawShape: ${(err as Error).message || 'No message'}`, items: [err] })
    }
  }

  private _drawVal() {
    try {
      if (!!this.ctx) {
        const margin = (this.computeds.badge.size.w * 0.18) / 2
        this.ctx.beginPath()
        this.ctx.textBaseline = 'middle'
        this.ctx.textAlign = 'center'
        this.ctx.font = `bold ${this.computeds.badge.size.w * 0.82}px Arial`
        this.ctx.fillStyle = this.settings.color
        this.ctx.fillText(String(this.computeds.badge.value), this.computeds.badge.size.w / 2 + this.computeds.badge.offset.x, this.computeds.badge.size.w / 2 + this.computeds.badge.offset.y + margin)
        this.ctx.closePath()
      }
      else throw new Error('No ctx')
    } catch (err) {
      groupLog({ namespace: `_drawVal: ${(err as Error).message || 'No message'}`, items: [err] })
    }
  }

  private _drawFavicon() {
    this.faviconEL?.setAttribute('href', this.dataURL)
  }

  _draw() {
    if (!!this.computeds.badge.value) {
      this._drawIcon()
      this._drawShape()
      this._drawVal()
      this._drawFavicon()
    } else {
      this._drawIcon()
      this._drawFavicon()
      if (this.isDebugEnadled)
        groupLog({ namespace: '_draw: Clean favicon required', items: [this.dataURL] })
    }
  }

  _setup() {
    this.computeds.favicon.size.w = this.img.naturalWidth
    this.computeds.favicon.size.h = this.img.naturalHeight
    this.computeds.badge.size.w = this.computeds.favicon.size.w * this.settings.scale
    this.computeds.badge.size.h = this.computeds.favicon.size.h * this.settings.scale
    this.canvas.width = this.computeds.favicon.size.w
    this.canvas.height = this.computeds.favicon.size.h
    const sd = this.computeds.favicon.size.w - this.computeds.badge.size.w
    const sd2 = sd / 2;
    this.computeds.badge.offset = {
      n:  {x: sd2, y: 0 },
      e:  {x: sd, y: sd2},
      s:  {x: sd2, y: sd},
      w:  {x: 0, y: sd2},
      nw: {x: 0, y: 0},
      ne: {x: sd, y: 0},
      sw: {x: 0, y: sd},
      se: {x: sd, y: sd},
    }[this.settings.position]
  }

  // Public functions / methods:
  public update() {
    switch (typeof this._value) {
      case 'number':
        this.computeds.badge.value = !!this._value
          // NOTE: Sorry for that:
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          ? String(Math.min(99, parseInt(this._value, 10)))
          : ''
        break
      case 'string':
        this.computeds.badge.value = !!this._value
          ? this.computeds.badge.value = this._value
            // TODO: Symbols length limit
          : this.computeds.badge.value = ''
        break
      default:
        break
    }

    this._setup()
    this._draw()
    if (this.settings.onChange) this.settings.onChange.call(this)
  }

  get dataURL() {
    return this.canvas.toDataURL()
  }

  get value() {
    return this.computeds.badge.value
  }

  set value(val: string | number) {
    this._value = val
    this.update()
  }
}

export const documentTitleBadger = Badger.getInstance({
  isDebugEnadled: false,
  options: {
    backgroundColor: "#f00",
    color: '#fff',
    scale: 0.7, // 0..1 (Scale in respect to the favicon image size)
    position: 'ne', // Position inside favicon
    radius: 8, // Border radius
    src: `${PUBLIC_URL}/vite.svg`, // Favicon source (dafaults to the <link> icon href)
    onChange() {},
  },
})
