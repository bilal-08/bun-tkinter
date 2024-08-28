import { dlopen, FFIType, ptr, CString, JSCallback, type Pointer, suffix } from "bun:ffi";
import { resolve } from "path";
import { Buffer } from "buffer";
import path from "path";

const tclLibPath = resolve(path.join(__dirname,'..', 'lib', `tcl86t.${suffix}`));
const tkLibPath = resolve(path.join(__dirname,'..', 'lib', `tk86t.${suffix}`));
const tclLib = dlopen(tclLibPath, {
    Tcl_CreateInterp: { args: [], returns: FFIType.ptr },
    Tcl_DeleteInterp: { args: [FFIType.ptr], returns: FFIType.void },
    Tcl_Init: { args: [FFIType.ptr], returns: FFIType.int },
    Tcl_Eval: { args: [FFIType.ptr, FFIType.cstring, FFIType.int, FFIType.int], returns: FFIType.int },
    Tcl_GetStringResult: { args: [FFIType.ptr], returns: FFIType.cstring },
    Tcl_CreateCommand: {
      args: [FFIType.ptr, FFIType.cstring, FFIType.ptr, FFIType.ptr, FFIType.ptr],
      returns: FFIType.int
    },
    Tcl_GetVar: { args: [FFIType.ptr, FFIType.cstring, FFIType.int], returns: FFIType.cstring },
  });

  const tkLib = dlopen(tkLibPath, {
    Tk_Init: { args: [FFIType.pointer], returns: FFIType.int }
  });

const TCL_OK = 0;

export class TclSession {
    private interp: Pointer;

    constructor() {
      const interpPtr = tclLib.symbols.Tcl_CreateInterp();
      if (interpPtr === null) {
        throw new Error('Failed to create Tcl interpreter');
      }
      this.interp = interpPtr;
      if (tclLib.symbols.Tcl_Init(this.interp) !== TCL_OK) {
        throw new Error('Failed to initialize Tcl interpreter');
      }
      if (tkLib.symbols.Tk_Init(this.interp) !== TCL_OK) {
        throw new Error('Failed to initialize Tk');
      }
    }
  
    eval(command: string): string {
      const commandBuffer = Buffer.from(command + '\0');
      const result = tclLib.symbols.Tcl_Eval(this.interp, commandBuffer as unknown as CString, commandBuffer.length - 1, 0);
      if (result !== TCL_OK) {
        const error = tclLib.symbols.Tcl_GetStringResult(this.interp);
        const errorInfo = this.getVar("errorInfo");
        throw new Error(`Tcl evaluation error: ${error}\nError Info: ${errorInfo}\nCommand: ${command}`);
      }
      return String(tclLib.symbols.Tcl_GetStringResult(this.interp));
    }
    
    getVar(varName: string): string {
      const result = tclLib.symbols.Tcl_GetVar(this.interp, Buffer.from(varName + '\0') as unknown as CString, 0);
      return result ? Buffer.from(result as unknown as ArrayBuffer).toString() : '';
    }
  

    createCommand(name: string, callback: JSCallback): void {
      const nameCs = Buffer.from(name + '\0', 'utf8') as unknown as CString;
      tclLib.symbols.Tcl_CreateCommand(this.interp, nameCs, callback.ptr, null, null);
    }
  
    destroy(): void {
      tclLib.symbols.Tcl_DeleteInterp(this.interp);
    }
  }
