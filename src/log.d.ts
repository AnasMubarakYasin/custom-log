interface PrintSpec {
    message(template: string, ...args: any[]): void;
}
declare function parse(template: string, ...args: any[]): any[];
export declare class Print implements PrintSpec {
    static parser: typeof parse;
    message(template: string, ...args: any[]): void;
    info(template: string, ...args: any[]): void;
    warn(template: string, ...args: any[]): void;
    error(template: string, ...args: any[]): void;
}
interface Profile {
    label: string;
    time: number;
    size: number;
    count: number;
}
export declare class Log {
    static profile: Map<string, Profile>;
    constructor(contex: string);
    start(label: string): void;
    info(name: string, message: any, ...args: any[]): void;
    warn(name: string, message: any, ...args: any[]): void;
    error(name: string, message: any, ...args: any[]): void;
    finish(label: string): void;
}
export {};
