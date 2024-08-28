import { TclSession } from './core/bindings';
import { JSCallback, FFIType } from 'bun:ffi';

export class Tk {
  private session: TclSession;

  constructor() {
    this.session = new TclSession();
    try {
      this.session.eval('package require Tk');
    } catch (error) {
      console.warn('Error initializing Tk:', error);
    }
  }

  title(title: string) {
    this.session.eval(`wm title . "${title}"`);
  }

  geometry(geometry: string) {
    this.session.eval(`wm geometry . ${geometry}`);
  }

  mainloop() {
    this.session.eval('tkwait window .');
  }

  destroy() {
    this.session.destroy();
  }

  setIcon(iconPath: string) {
    this.session.eval(`
      set img [image create photo -file "${iconPath}"]
      wm iconphoto . -default $img
    `);
  }

  Label(text: string) {
    return new Label(this.session, text);
  }

  Button(text: string, command?: () => void) {
    return new Button(this.session, text, command);
  }

  Entry() {
    return new Entry(this.session);
  }

  Listbox() {
    return new Listbox(this.session);
  }

  Text() {
    return new Text(this.session);
  }

  Checkbutton(text: string) {
    return new Checkbutton(this.session, text);
  }

  Radiobutton(text: string, variable: string, value: string) {
    return new Radiobutton(this.session, text, variable, value);
  }

  Scale(from: number, to: number, orient: 'horizontal' | 'vertical' = 'horizontal') {
    return new Scale(this.session, from, to, orient);
  }

  getVariable(name: string) {
    return this.session.eval(`set ${name}`);
  }

  Frame() {
    return new Frame(this.session);
  }

  Canvas() {
    return new Canvas(this.session);
  }

  Scrollbar(orient: 'vertical' | 'horizontal') {
    return new Scrollbar(this.session, orient);
  }

  // New method to create an image
  createImage(imagePath: string) {
    return new Image(this.session, imagePath);
  }
}

export class Widget {
  protected session: TclSession;
  protected name: string;
  private static counter: number = 0;
  constructor(session: TclSession) {
    this.session = session;
    this.name = `.w${Math.random().toString(36).substr(2, 9)}`;
    this.session.eval(`set ${this.name} ${this.name}`); // Ensure the widget name is set as a Tcl variable
  }

  getSession(): TclSession {
    return this.session;
  }

  protected createWidget(type: string, options: string = '') {
    try {
      this.session.eval(`${type} ${this.name} ${options}`);
    } catch (error) {
      console.error(`Error creating ${type} widget:`, error);
      throw error;
    }
  }

  pack(options: string = '') {
    try {
      this.session.eval(`pack ${this.name} ${options}`);
    } catch (error) {
      console.error('Error packing widget:', error);
      throw error;
    }
  }

  setVerticalPadding(padding: number) {
    this.pack(`-pady ${padding}`);
  }

  bind(event: string, callback: () => void) {
    const callbackName = `${this.name}_${event}_callback`;
    this.session.createCommand(callbackName, new JSCallback(() => {
      callback();
      return 0;
    }, {
      returns: FFIType.int,
      args: [FFIType.ptr, FFIType.ptr, FFIType.int, FFIType.ptr]
    }));
    this.session.eval(`bind ${this.name} <${event}> ${callbackName}`);
  }

  getName() {
    return this.name;
  }
}

export class Label extends Widget {
  constructor(session: TclSession, text: string) {
    super(session);
    session.eval(`label ${this.name} -text "${text}"`);
  }

  setText(text: string) {
    this.session.eval(`${this.name} configure -text "${text}"`);
  }

  // New method to set an image to the label
  setImage(image: Image) {
    this.session.eval(`${this.name} configure -image ${image.getName()}`);
  }
}

export class Button extends Widget {
  constructor(session: TclSession, text: string, command?: () => void) {
    super(session);
    this.createWidget('button', `-text "${text}"`);
    if (command) {
      this.setCommand(command);
    }
  }

  setCommand(command: () => void) {
    const commandName = `${this.name}_command`;
    try {
      this.session.createCommand(commandName, new JSCallback(() => {
        command();
        return 0;
      }, {
        returns: FFIType.int,
        args: [FFIType.ptr, FFIType.ptr, FFIType.int, FFIType.ptr]
      }));
      this.session.eval(`${this.name} configure -command ${commandName}`);
    } catch (error) {
      console.error('Error setting button command:', error);
      throw error;
    }
  }

  setText(text: string) {
    this.session.eval(`${this.name} configure -text "${text}"`);
  }
}

export class Entry extends Widget {
  constructor(session: TclSession) {
    super(session);
    this.createWidget('entry');
  }

  get() {
    return this.session.eval(`${this.name} get`);
  }

  insert(index: number, string: string) {
    this.session.eval(`${this.name} insert ${index} "${string}"`);
  }

  delete(first: number, last?: number) {
    this.session.eval(`${this.name} delete ${first} ${last ?? ''}`);
  }
}

export class Listbox extends Widget {
  constructor(session: TclSession) {
    super(session);
    this.createWidget('listbox');
  }

  insert(index: number, ...elements: string[]) {
    this.session.eval(`${this.name} insert ${index} ${elements.map(e => `"${e}"`).join(' ')}`);
  }

  delete(first: number, last?: number) {
    this.session.eval(`${this.name} delete ${first} ${last ?? ''}`);
  }

  get(first: number, last?: number) {
    return this.session.eval(`${this.name} get ${first} ${last ?? ''}`);
  }

  getSelection(): string[] {
    try {
      const indices = this.session.eval(`${this.name} curselection`);
      if (!indices) return [];
      
      const items = indices.split(' ').map(index => {
        return this.session.eval(`${this.name} get ${index}`);
      });
      
      return items;
    } catch (error) {
      console.warn('Error getting listbox selection:', error);
      return [];
    }
  }
}

export class Text extends Widget {
  constructor(session: TclSession) {
    super(session);
    this.createWidget('text');
  }

  insert(index: string, chars: string) {
    this.session.eval(`${this.name} insert ${index} "${chars}"`);
  }

  delete(index1: string, index2?: string) {
    this.session.eval(`${this.name} delete ${index1} ${index2 ?? ''}`);
  }

  get(index1: string, index2?: string) {
    return this.session.eval(`${this.name} get ${index1} ${index2 ?? ''}`);
  }
}

export class Checkbutton extends Widget {
  private variable: string;

  constructor(session: TclSession, text: string) {
    super(session);
    this.variable = `${this.name}_var`;
    session.eval(`set ${this.variable} 0`);
    this.createWidget('checkbutton', `-text "${text}" -variable ${this.variable}`);
  }

  get() {
    return parseInt(this.session.eval(`set ${this.variable}`)) === 1;
  }

  select() {
    this.session.eval(`${this.name} select`);
  }

  deselect() {
    this.session.eval(`${this.name} deselect`);
  }
}

export class Radiobutton extends Widget {
  constructor(session: TclSession, text: string, variable: string, value: string) {
    super(session);
    this.createWidget('radiobutton', `-text "${text}" -variable ${variable} -value "${value}"`);
  }

  select() {
    this.session.eval(`${this.name} select`);
  }

  deselect() {
    this.session.eval(`${this.name} deselect`);
  }
}

export class Scale extends Widget {
  constructor(session: TclSession, from: number, to: number, orient: 'horizontal' | 'vertical' = 'horizontal') {
    super(session);
    this.createWidget('scale', `-from ${from} -to ${to} -orient ${orient}`);
  }

  get() {
    return parseFloat(this.session.eval(`${this.name} get`));
  }

  set(value: number) {
    this.session.eval(`${this.name} set ${value}`);
  }
}

export class Frame extends Widget {
  constructor(session: TclSession) {
    super(session);
    this.createWidget('frame');
  }
}

export class Canvas extends Widget {
  constructor(session: TclSession) {
    super(session);
    this.createWidget('canvas');
  }
}

export class Scrollbar extends Widget {
  constructor(session: TclSession, orient: 'vertical' | 'horizontal') {
    super(session);
    this.createWidget('scrollbar', `-orient ${orient}`);
  }

  setCommand(command: string) {
    this.session.eval(`${this.name} configure -command "${command}"`);
  }
}

// New Image class
export class Image extends Widget {
  constructor(session: TclSession, imagePath: string) {
    super(session);
    this.session.eval(`image create photo ${this.name} -file "${imagePath}"`);
  }
}

export function createTkApp(title: string, geometry: string): Tk {
  const root = new Tk();
  root.title(title);
  root.geometry(geometry);
  root.setIcon("./assets/logo.png")
  return root;
}

export function runTkApp(root: Tk) {
  try {
    root.mainloop();
  } finally {
    root.destroy();
  }
}