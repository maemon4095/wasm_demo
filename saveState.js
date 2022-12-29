function restoreState(elem, deep) {
    console.log(elem.id);
    const mode = elem.dataset.savestate;
    if ((!deep && !mode) || mode === "none") {
        return;
    }
    if (!!elem.id) {
        const data = localStorage.getItem(elem.id);
        switch (elem.nodeName) {
            case "INPUT": {
                let prop;
                switch (elem.type) {
                    case 'checkbox': {
                        prop = "checked";
                        break;
                    }
                    default: {
                        prop = "value";
                        break;
                    }
                }
                if (!!data) {
                    const val = JSON.parse(data);
                    elem[prop] = val;
                    console.log(`restore ${elem.id}[${prop}] = ${val}`);
                }
                break;
            }
        }
    }

    if (deep || (mode === "deep")) {
        for (const child of elem.children) {
            restoreState(child, true);
        }
    }
}

function saveState(elem, deep) {
    console.log(elem.id);
    const mode = elem.dataset.savestate;
    if ((!deep && !mode) || mode === "none") {
        return;
    }
    if (!!elem.id) {
        switch (elem.nodeName) {
            case "INPUT": {
                let prop;
                switch (elem.type) {
                    case 'checkbox': {
                        prop = "checked";
                        break;
                    }
                    default: {
                        prop = "value";
                        break;
                    }
                }
                const val = JSON.stringify(elem[prop]);
                localStorage.setItem(elem.id, val);
                console.log(`save ${elem.id}[${prop}] = ${val}`);
                break;
            }
        }
    }

    if (deep || (mode === "deep")) {
        for (const child of elem.children) {
            saveState(child, true);
        }
    }
}


function enableAutoSave(elem, deep) {
    console.log(elem.id);
    const mode = elem.dataset.savestate;
    if ((!deep && !mode) || mode === "none") {
        return;
    }
    if (!!elem.id) {
        switch (elem.nodeName) {
            case "INPUT": {
                let prop;
                switch (elem.type) {
                    case 'checkbox': {
                        prop = "checked";
                        break;
                    }
                    default: {
                        prop = "value";
                        break;
                    }
                }

                elem.addEventListener('change', (e) => {
                    console.log(e.target[prop]);
                    const val = JSON.stringify(e.target[prop]);
                    localStorage.setItem(e.target.id, val);
                    console.log(`save ${e.target.id}[${prop}] = ${val}`);
                });
                break;
            }
        }
    }

    if (deep || (mode === "deep")) {
        for (const child of elem.children) {
            enableAutoSave(child, true);
        }
    }
}

function restoreAndEnableAutoSave(elem, deep) {
    console.log(elem.id);
    const mode = elem.dataset.savestate;
    if ((!deep && !mode) || mode === "none") {
        return;
    }
    if (!!elem.id) {
        const data = localStorage.getItem(elem.id);
        switch (elem.nodeName) {
            case "INPUT": {
                let prop;
                switch (elem.type) {
                    case 'checkbox': {
                        prop = "checked";
                        break;
                    }
                    default: {
                        prop = "value";
                        break;
                    }
                }
                if (!!data) {
                    const val = JSON.parse(data);
                    elem[prop] = val;
                }

                elem.addEventListener('change', (e) => {
                    console.log(e.target[prop]);
                    const val = JSON.stringify(e.target[prop]);
                    localStorage.setItem(e.target.id, val);
                    console.log(`save ${e.target.id}[${prop}] = ${val}`);
                });
                break;
            }
        }
    }

    if (deep || (mode === "deep")) {
        for (const child of elem.children) {
            restoreAndEnableAutoSave(child, true);
        }
    }
}