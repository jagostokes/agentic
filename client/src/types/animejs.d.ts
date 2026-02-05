declare module "animejs" {
  export interface AnimeParams {
    targets?: string | HTMLElement | HTMLElement[] | NodeList | object | object[];
    duration?: number;
    delay?: number | ((el: HTMLElement, i: number, l: number) => number);
    endDelay?: number;
    easing?: string;
    round?: number;
    loop?: boolean | number;
    direction?: "normal" | "reverse" | "alternate";
    autoplay?: boolean;

    // Transforms
    translateX?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    translateY?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    translateZ?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    rotate?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    rotateX?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    rotateY?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    rotateZ?: number | string | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number | string);
    scale?: number | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number);
    scaleX?: number | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number);
    scaleY?: number | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number);
    scaleZ?: number | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number);
    skew?: number | string | (number | string)[];
    skewX?: number | string | (number | string)[];
    skewY?: number | string | (number | string)[];
    perspective?: number | string;

    // CSS
    opacity?: number | (number | string)[] | ((el: HTMLElement, i: number, l: number) => number);
    color?: string | string[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderRadius?: string | string[];
    width?: number | string | (number | string)[];
    height?: number | string | (number | string)[];
    boxShadow?: string | string[];
    filter?: string | string[];

    // SVG
    strokeDashoffset?: number | (number | string)[];

    // Callbacks
    begin?: (anim: AnimeInstance) => void;
    update?: (anim: AnimeInstance) => void;
    complete?: (anim: AnimeInstance) => void;
    loopBegin?: (anim: AnimeInstance) => void;
    loopComplete?: (anim: AnimeInstance) => void;
    changeBegin?: (anim: AnimeInstance) => void;
    changeComplete?: (anim: AnimeInstance) => void;

    // Allow any other CSS property
    [key: string]: unknown;
  }

  export interface AnimeInstance {
    play(): void;
    pause(): void;
    restart(): void;
    reverse(): void;
    seek(time: number): void;
    tick(time: number): void;
    finished: Promise<void>;
    began: boolean;
    paused: boolean;
    completed: boolean;
    reversed: boolean;
    currentTime: number;
    duration: number;
    progress: number;
    animations: object[];
    animatables: object[];
  }

  export interface AnimeStaggerOptions {
    start?: number;
    from?: number | string | "first" | "last" | "center";
    direction?: "normal" | "reverse";
    easing?: string;
    grid?: [number, number];
    axis?: "x" | "y";
  }

  function anime(params: AnimeParams): AnimeInstance;

  namespace anime {
    function remove(targets: string | HTMLElement | HTMLElement[] | NodeList | object): void;
    function get(target: HTMLElement, property: string): string;
    function set(targets: string | HTMLElement | HTMLElement[] | NodeList | object, values: { [key: string]: unknown }): void;
    function stagger(value: number | string | (number | string)[], options?: AnimeStaggerOptions): (el: HTMLElement, i: number, l: number) => number;
    function timeline(params?: AnimeParams): AnimeInstance & { add(params: AnimeParams, offset?: string | number): AnimeInstance };
    function random(min: number, max: number): number;
    function setDashoffset(el: SVGPathElement): number;
    const running: AnimeInstance[];
    const easings: { [key: string]: (t: number) => number };
  }

  export default anime;
}
