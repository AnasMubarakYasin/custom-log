enum STATUS {
  DEFAULT = 'background: #607d8b;',
  SUCCESS = 'background: #2e7d32;',
  ERROR = 'background: #b71c1c;',
  WARN = 'background: #ff6f00;',
  INFO = 'background: #1976d2;',
}

enum TYPE {
  DEFAULT = 'color: #ffffff;',
  STRING = 'color: #ff9800;',
  INTEGER = 'color: #b38ddb;',
  BOOLEAN = 'color: #b9f6ca;',
}

enum STYLE {
  BOLD = 'font-weight: 900;',
  UNDERLINE = 'text-decoration-line: underline;',
  TAG = `color: white; border-radius: 6px; padding: 4px 8px;`,
  RED = 'color: #ff5252;',
  GREEN = 'color: #69f0ae;',
  BLUE = 'color: #ff8a80;',
  YELLOW = 'color: #ffff00;',
}

// eslint-disable-next-line max-len
const font = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;`;

interface PrintSpec {
  message(template: string, ...args: any[]): void
}

const tagList = {
  '#s': {
    exec: (tag: string, arg: any):string => {
      return '%c"%s"';
    },
  },
  '#n': {
    exec: (tag: string, arg: any):string => {
      return '%c%s';
    },
  },
  '#b': {
    exec: (tag: string, arg: any):string => {
      return '%c%s';
    },
  },
  '#o': {
    exec: (tag: string, arg: any):string => {
      return '%c%o';
    },
  },
  '#O': {
    exec: (tag: string, arg: any):string => {
      return '%c%O';
    },
  },
  '#m': {
    exec: (tag: string, arg: any):string => {
      return '%c%s';
    },
  },
};

type TagList = keyof typeof tagList;

function parse(template: string, ...args: any[]) {
  const parsed = template.split(' ');
  const styleList: any[] = [];

  let result = '';

  for (let index = 0; index < parsed.length; index++) {
    const styles: string = style(parsed[index]);
    result += tag(parsed[index], args[index]);

    push(styles);
    push(args[index]);
  }

  return [result, ...flush()];

  function push(arg: any) {
    styleList.push(arg);
  }

  function flush(): any[] {
    return styleList;
  }
}

function tag(template: string, arg: any): string {
  const matcher = /\#\w+/.exec(template);

  if (matcher) {
    const matchTag: TagList = matcher[0] as TagList;

    if (matchTag in tagList) {
      template = tagList[matchTag].exec(template, arg);
    }
  }
  return template;
}

function style(template: string): string {
  const list = {
    '.tag': STYLE.TAG,
    '.underline': STYLE.UNDERLINE,
    '.bold': STYLE.BOLD,
    '.num': TYPE.INTEGER,
    '.str': TYPE.STRING,
    '.bool': TYPE.BOOLEAN,
    '.any': TYPE.DEFAULT,
    '.warn': STATUS.WARN,
    '.info': STATUS.INFO,
    '.success': STATUS.SUCCESS,
    '.message': STATUS.DEFAULT,
    '.error': STATUS.ERROR,
    '.green': STYLE.YELLOW,
    '.blue': STYLE.BLUE,
    '.red': STYLE.RED,
    '.yellow': STYLE.YELLOW,
  };
  type tag = keyof typeof list;

  // eslint-disable-next-line max-len
  let result = 'margin: 4px; font-size: 12px; font-weight: 400;' + font;

  const matcher = /\.\w+/.exec(template);

  if (matcher) {
    const prop: tag = matcher[0] as tag;

    if (prop in list) {
      result += list[prop];

      if (template[matcher.index + matcher[0].length] === '.') {
        result += style(template.replace(prop, ''));
      }
    }
  }

  return result;
}

export class Print implements PrintSpec {
  static parser = parse;

  message(template: string, ...args: any[]):void {
    const message = Print.parser(template, ...args);

    console.log(...message);
  }
  info(template: string, ...args: any[]):void {
    console.debug(...Print.parser(template, ...args));
  }
  warn(template: string, ...args: any[]):void {
    console.warn(...Print.parser(template, ...args));
  }
  error(template: string, ...args: any[]):void {
    console.error(...Print.parser(template, ...args));
  }
}

interface Profile {
  label: string
  time: number
  size: number
  count: number
}

export class Log {
  static profile: Map<string, Profile> = new Map();

  constructor(contex: string) {
    console.log(...parse('#m.info.tag', contex));
  }

  public start(label: string) {
    const profile = Log.profile.get(label);
    let count = 1;
    if (profile) {
      count += Log.profile.has(label) ? profile.count : 0;
    }
    Log.profile.set(label, {
      label: label,
      time: new Date().getTime(),
      count: count,
      size: performance.memory.usedJSHeapSize || 0,
    });

    console.group(...Print.parser(
        '#m.tag.info #m.any #n.num #b.bool', label,
        'count', count,
        'starting...',
    ));
  }
  public info(name: string, message: any, ...args: any[]) {
    const template = '#m.tag.info #m.blue #m.any #o.blue.bold';
    const messages = [name, 'message', message, ...args];

    console.log(...Print.parser(template, ...messages));
  }
  public warn(name: string, message: any, ...args: any[]) {
    const template = '#m.tag.warn #m.yellow #m.any #o.yellow.bold';
    const messages = [name, 'message', message, ...args];

    console.log(...Print.parser(template, ...messages));
  }
  public error(name: string, message: any, ...args: any[]) {
    const template = '#m.tag.error #m.red #m.any #o.red.bold';
    const messages = [name, 'message', message, ...args];

    console.log(...Print.parser(template, ...messages));
  }
  public finish(label: string): void {
    const profile = Log.profile.get(label);

    console.groupEnd();

    if (profile) {
      const memory = performance.memory.usedJSHeapSize || 0;

      console.log(...Print.parser(
          '#m.tag.success #m.any #n.num #m.any #m.any #n.num #m.any', label,
          'time', (new Date().getTime() - profile?.time) / 1000, 'second',
          'size', (memory - profile?.size) / 1000000, 'mega bytes',
      ));
      Log.profile.delete(label);
    }
  }
}
