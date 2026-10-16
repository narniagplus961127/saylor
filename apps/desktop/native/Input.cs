using System;
using System.Runtime.InteropServices;
using System.Threading;

internal static class Input {
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern bool IsWindow(IntPtr h);
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindowAsync(IntPtr h, int mode);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern short GetAsyncKeyState(int key);
  [DllImport("user32.dll", SetLastError=true)] static extern uint SendInput(uint count, INPUT[] inputs, int size);
  [StructLayout(LayoutKind.Sequential)] struct INPUT { public uint type; public UNION data; }
  [StructLayout(LayoutKind.Explicit)] struct UNION {
    [FieldOffset(0)] public KEYBOARD keyboard;
    [FieldOffset(0)] public MOUSE mouse;
  }
  [StructLayout(LayoutKind.Sequential)] struct KEYBOARD { public ushort key, scan; public uint flags, time; public UIntPtr extra; }
  [StructLayout(LayoutKind.Sequential)] struct MOUSE { public int x, y; public uint data, flags, time; public UIntPtr extra; }
  static INPUT Key(ushort key, bool up) { return new INPUT { type=1, data=new UNION { keyboard=new KEYBOARD { key=key, flags=up?2u:0u } } }; }
  static bool Valid(IntPtr target, uint pid) { uint actual; GetWindowThreadProcessId(target, out actual); return target!=IntPtr.Zero && IsWindow(target) && actual==pid; }
  static bool ModifiersReleased() {
    for(int i=0;i<75;i++) {
      if((GetAsyncKeyState(0x10)&0x8000)==0 && (GetAsyncKeyState(0x11)&0x8000)==0 && (GetAsyncKeyState(0x12)&0x8000)==0 && (GetAsyncKeyState(0x5B)&0x8000)==0 && (GetAsyncKeyState(0x5C)&0x8000)==0) return true;
      Thread.Sleep(20);
    }
    return false;
  }
  static int Main(string[] args) {
    try {
      if(args.Length==1 && args[0]=="capture") {
        IntPtr hwnd=GetForegroundWindow(); uint pid; GetWindowThreadProcessId(hwnd,out pid);
        if(!Valid(hwnd,pid)) return 2;
        Console.WriteLine("{\"handle\":\""+hwnd.ToInt64()+"\",\"pid\":"+pid+"}"); return 0;
      }
      long value; uint process;
      if(args.Length<3 || !long.TryParse(args[1],out value) || !uint.TryParse(args[2],out process)) return 2;
      IntPtr target=new IntPtr(value);
      if(!Valid(target,process)) return 3;
      if(args[0]=="focus" && args.Length==4) {
        long self; if(!long.TryParse(args[3],out self)) return 2;
        IntPtr foreground=GetForegroundWindow();
        if(foreground!=target && foreground!=new IntPtr(self)) return 4;
        if(IsIconic(target)) ShowWindowAsync(target,9);
        SetForegroundWindow(target);
        for(int i=0;i<15 && GetForegroundWindow()!=target;i++) Thread.Sleep(20);
        if(GetForegroundWindow()!=target) return 5;
      } else if(args[0]=="paste" && args.Length==3) {
        if(!ModifiersReleased() || !Valid(target,process) || GetForegroundWindow()!=target) return 4;
        INPUT[] keys={Key(0x11,false),Key(0x56,false),Key(0x56,true),Key(0x11,true)};
        if(SendInput(4,keys,Marshal.SizeOf(typeof(INPUT)))!=4) {
          INPUT[] release={Key(0x56,true),Key(0x11,true)};
          SendInput(2,release,Marshal.SizeOf(typeof(INPUT))); return 6;
        }
      } else return 2;
      Console.WriteLine("{\"ok\":true}"); return 0;
    } catch { return 1; }
  }
}
