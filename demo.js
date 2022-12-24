const FEATURES = [
    'exceptions',
    'mutable_globals',
    'sat_float_to_int',
    'sign_extension',
    'simd',
    'threads',
    'multi_value',
    'tail_call',
    'bulk_memory',
    'reference_types',
];
const resultContainer = document.getElementById("result");
let binaryBuffer = null;

(async () => {
    const wabt = await WabtModule();
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs' } })

    window.MonacoEnvironment = {
        getWorkerUrl: function (workerId, label) {
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/'
        };
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs/base/worker/workerMain.js');`
            )}`
        }
    }

    const localStorage = window.localStorage;
    const jsKey = "js";
    const watKey = "wat";
    let jsEditor, watEditor, resultEditor;
    require(['vs/editor/editor.main'], () => {
        const options = {
            automaticLayout: true,
            theme: "vs-dark",
        };

        jsEditor = monaco.editor.create(document.getElementById('jscode'), {
            value: localStorage.getItem(jsKey),
            language: 'javascript',
            ...options,
        });

        watEditor = monaco.editor.create(document.getElementById('watcode'), {
            value: localStorage.getItem(watKey),
            language: 'wat',
            ...options,
        });

        resultEditor = monaco.editor.create(resultContainer, {
            language: 'plaintext',
            readOnly: true,
            ...options,
        });

        jsEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            jsEditor.getAction('editor.action.formatDocument').run();
            const value = jsEditor.getValue();
            localStorage.setItem(jsKey, value);
            console.log('js saved');
            update();
        });

        watEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            watEditor.getAction('editor.action.formatDocument').run();
            const value = watEditor.getValue();
            localStorage.setItem(watKey, value);
            console.log('wat saved');
            update();
        });
    });


    const wrappedConsole = Object.create(console);
    wrappedConsole.log = (...args) => {
        const line = args.map(String).join('') + '\n';
        resultEditor.setValue(resultEditor.getValue() + line);
    };



    function update() {
        resultEditor.setValue('');
        try {
            evalWat(watEditor.getValue());
            evalJs(jsEditor.getValue());
        } catch (e) {
            resultEditor.setValue(e.toString());
            throw e;
        }
    }

    function evalWat(source) {
        const features = {};
        for (const feature of FEATURES) {
            features[feature] = localStorage.getItem(`wasm-feature-${feature}`);
        }
        let module;
        try {
            module = wabt.parseWat('test.wast', source, features);
            module.resolveNames();
            module.validate(features);
            const binaryOutput = module.toBinary({ log: true, write_debug_names: true });
            binaryBuffer = binaryOutput.buffer;
        } finally {
            if (module) module.destroy();
        }
    }

    function evalJs(source) {
        if (binaryBuffer === null) return;
        let wasm = new WebAssembly.Module(binaryBuffer);
        const moduleName = tryParse(localStorage.getItem("wasm-module-name")) ?? "wasmModule";
        console.log(moduleName);
        const fn = new Function(moduleName, 'console', source);
        fn(wasm, wrappedConsole);
    }

    function tryParse(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return undefined;
        }
    }
})();