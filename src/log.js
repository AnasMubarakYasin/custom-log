var STATUS;
(function (STATUS) {
    STATUS["DEFAULT"] = "background: #607d8b;";
    STATUS["SUCCESS"] = "background: #2e7d32;";
    STATUS["ERROR"] = "background: #b71c1c;";
    STATUS["WARN"] = "background: #ff6f00;";
    STATUS["INFO"] = "background: #1976d2;";
})(STATUS || (STATUS = {}));
var TYPE;
(function (TYPE) {
    TYPE["DEFAULT"] = "color: #ffffff;";
    TYPE["STRING"] = "color: #ff9800;";
    TYPE["INTEGER"] = "color: #b38ddb;";
    TYPE["BOOLEAN"] = "color: #b9f6ca;";
})(TYPE || (TYPE = {}));
var STYLE;
(function (STYLE) {
    STYLE["BOLD"] = "font-weight: 900;";
    STYLE["UNDERLINE"] = "text-decoration-line: underline;";
    STYLE["TAG"] = "color: white; border-radius: 6px; padding: 4px 8px;";
    STYLE["RED"] = "color: #ff5252;";
    STYLE["GREEN"] = "color: #69f0ae;";
    STYLE["BLUE"] = "color: #ff8a80;";
    STYLE["YELLOW"] = "color: #ffff00;";
})(STYLE || (STYLE = {}));
// eslint-disable-next-line max-len
const font = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;`;
const tagList = {
    '#s': {
        exec: (tag, arg) => {
            return '%c"%s"';
        },
    },
    '#n': {
        exec: (tag, arg) => {
            return '%c%s';
        },
    },
    '#b': {
        exec: (tag, arg) => {
            return '%c%s';
        },
    },
    '#o': {
        exec: (tag, arg) => {
            return '%c%o';
        },
    },
    '#O': {
        exec: (tag, arg) => {
            return '%c%O';
        },
    },
    '#m': {
        exec: (tag, arg) => {
            return '%c%s';
        },
    },
};
function parse(template, ...args) {
    const parsed = template.split(' ');
    const styleList = [];
    let result = '';
    for (let index = 0; index < parsed.length; index++) {
        const styles = style(parsed[index]);
        result += tag(parsed[index], args[index]);
        push(styles);
        push(args[index]);
    }
    return [result, ...flush()];
    function push(arg) {
        styleList.push(arg);
    }
    function flush() {
        return styleList;
    }
}
function tag(template, arg) {
    const matcher = /\#\w+/.exec(template);
    if (matcher) {
        const matchTag = matcher[0];
        if (matchTag in tagList) {
            template = tagList[matchTag].exec(template, arg);
        }
    }
    return template;
}
function style(template) {
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
    // eslint-disable-next-line max-len
    let result = 'margin: 4px; font-size: 12px; font-weight: 400;' + font;
    const matcher = /\.\w+/.exec(template);
    if (matcher) {
        const prop = matcher[0];
        if (prop in list) {
            result += list[prop];
            if (template[matcher.index + matcher[0].length] === '.') {
                result += style(template.replace(prop, ''));
            }
        }
    }
    return result;
}
export class Print {
    message(template, ...args) {
        const message = Print.parser(template, ...args);
        console.log(...message);
    }
    info(template, ...args) {
        console.debug(...Print.parser(template, ...args));
    }
    warn(template, ...args) {
        console.warn(...Print.parser(template, ...args));
    }
    error(template, ...args) {
        console.error(...Print.parser(template, ...args));
    }
}
Print.parser = parse;
export class Log {
    constructor(contex) {
        console.log(...parse('#m.info.tag', contex));
    }
    start(label) {
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
        console.group(...Print.parser('#m.tag.info #m.any #n.num #b.bool', label, 'count', count, 'starting...'));
    }
    info(name, message, ...args) {
        const template = '#m.tag.info #m.blue #m.any #o.blue.bold';
        const messages = [name, 'message', message, ...args];
        console.log(...Print.parser(template, ...messages));
    }
    warn(name, message, ...args) {
        const template = '#m.tag.warn #m.yellow #m.any #o.yellow.bold';
        const messages = [name, 'message', message, ...args];
        console.log(...Print.parser(template, ...messages));
    }
    error(name, message, ...args) {
        const template = '#m.tag.error #m.red #m.any #o.red.bold';
        const messages = [name, 'message', message, ...args];
        console.log(...Print.parser(template, ...messages));
    }
    finish(label) {
        const profile = Log.profile.get(label);
        console.groupEnd();
        if (profile) {
            const memory = performance.memory.usedJSHeapSize || 0;
            console.log(...Print.parser('#m.tag.success #m.any #n.num #m.any #m.any #n.num #m.any', label, 'time', (new Date().getTime() - profile?.time) / 1000, 'second', 'size', (memory - profile?.size) / 1000000, 'mega bytes'));
            Log.profile.delete(label);
        }
    }
}
Log.profile = new Map();
