const targets = document.getElementsByClassName('tabbed-menu');

for (const target of targets) {
    initialize(target);
}

function initialize(rootElement) {
    const common_style_element_id = 'tabbed-menu-common-style';
    const tab_focused_attribute = 'data-tab-focus';
    const tabbar_class = 'tabbed-menu-tabbar';
    const tabbar_tab_class = 'tabbed-menu-tabbar-tab';

    if (!document.getElementById(common_style_element_id)) {
        const style = document.createElement('style');
        style.id = common_style_element_id;
        style.innerHTML = `
        .tabbed-menu > :not(.${tabbar_class}) {
            display: none;
            grid-area: main;
        }
        .tabbed-menu > :not(.${tabbar_class})[${tab_focused_attribute}="focused"] {
            display: block;
        }
        `;

        document.head.append(style);
    }

    rootElement.style.display = "grid";
    rootElement.style["grid-template"] = `"tabbar" auto\n"main" 1fr / 1fr`;

    const tabbar = document.createElement('div');
    tabbar.style['grid-area'] = "tabbar";
    tabbar.style['display'] = "flex";
    tabbar.classList.add(tabbar_class);

    const initializeTabbar = () => {
        tabbar.replaceChildren();
        const tabs = [...rootElement.children].filter(elem => !elem.classList.contains(tabbar_class));
        for (const tab of tabs) {
            const button = createTabButton(tab, tabs);
            tabbar.append(button);
        }
    };

    const onRootElementChanged = mutations => {
        for (const mutation of mutations) {
            if (mutation.type !== 'childList') {
                continue;
            }
            initializeTabbar();
        }
    };

    initializeTabbar();
    rootElement.append(tabbar);
    const rootElementObserver = new MutationObserver(onRootElementChanged);
    rootElementObserver.observe(rootElement, { childList: true });


    function createTabButton(tab, tabs) {
        const name = tab.getAttribute('data-tabname');
        const tabButton = document.createElement('button');
        const syncFocus = () => {
            const focus = tab.getAttribute(tab_focused_attribute);
            tabButton.setAttribute(tab_focused_attribute, focus);
            if (focus === 'focused') {
                for (const t of tabs) {
                    if (t === tab) {
                        continue;
                    }
                    t.setAttribute(tab_focused_attribute, 'none');
                }
            }
        };
        tabButton.className = tabbar_tab_class;
        tabButton.append(name);
        syncFocus();
        tabButton.addEventListener('click', (e) => {
            tab.setAttribute(tab_focused_attribute, 'focused');
        });

        const onTabAttributeChanged = (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== "attributes") {
                    continue;
                }
                syncFocus();
            }
        };
        const observer = new MutationObserver(onTabAttributeChanged);
        observer.observe(tab, { attributes: true });

        return tabButton;
    }
}

