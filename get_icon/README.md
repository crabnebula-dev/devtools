# `get_icon`

This is essentially a fancy lookup-table to match file names to icons IDs. 
These icon IDs correspond to an SVG icon in the `web-client/public/icons` folder.

The reason this is written in Rust is A: it's fast, and B: we prebuilt a very fast lookup table (in `build.rs`) 
that's essentially one big regex. This table is then inlined into a wasm binary and exposed through a simple `get_icon`
function to JavaScript.

> Note:
> 
> I really haven't measured any of this, it might be horrifically over-engineered (it most likely is). 
> But it works and is reasonably fast and small. So ¯\\\_(ツ)\_/¯.

## Building

With Rust installed run:

```
wasm-pack build .
```

or 

```
wasm-pack build . --release -- -Z build-std=core,std,alloc,panic_abort -Z build-std-features=panic_immediate_abort
 ```

if you want to build an optimized release binary