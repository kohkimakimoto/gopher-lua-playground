package main

import (
	"github.com/yuin/gopher-lua"
	"syscall/js"
)

func main() {
	js.Global().Set("GopherLuaPlayground", js.ValueOf(map[string]any{
		"run": js.FuncOf(Run),
	}))
	// Go wasm module must not return.
	select {}
}

func Run(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return js.Global().Get("Error").New("run requires one argument")
	}
	luaCode := args[0].String()
	// handler for Promise
	var handler js.Func
	handler = js.FuncOf(func(this js.Value, args []js.Value) any {
		resolve := args[0]
		reject := args[1]
		go func() {
			L := lua.NewState()
			defer L.Close()
			if err := L.DoString(luaCode); err != nil {
				errorObject := js.Global().Get("Error").New(err.Error())
				reject.Invoke(errorObject)
			} else {
				resolve.Invoke(nil)
			}
			return
		}()
		handler.Release()
		return nil
	})
	return js.Global().Get("Promise").New(handler)
}
