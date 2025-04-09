(function () {
    const createMap = (offsetUpper, offsetLower) => {
        const map = {};
        for (let i = 65; i <= 90; i++) map[String.fromCharCode(i)] = String.fromCodePoint(offsetUpper + (i - 65));
        for (let i = 97; i <= 122; i++) map[String.fromCharCode(i)] = String.fromCodePoint(offsetLower + (i - 97));
        return map;
    };

    const invertMap = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

    const BOLD_MAP = createMap(0x1D400, 0x1D41A);
    const BOLD_REVERSE = invertMap(BOLD_MAP);
    const ITALIC_MAP = createMap(0x1D608, 0x1D622);
    const ITALIC_REVERSE = invertMap(ITALIC_MAP);

    const COMBINING_UNDERLINE = '\u035F';
    const COMBINING_STRIKE = '\u0336';

    // const underlineText = (str) =>
    //     str.split('').map(c => c + COMBINING_UNDERLINE).join('');
    // const strikethroughText = (str) =>
    //     str.split('').map(c => c + COMBINING_STRIKE).join('');

    const toggleText = (str, map, reverseMap) => {
        const isFormatted = [...str].every(c => reverseMap[c] || c === ' ');
        return [...str].map(c => (isFormatted ? reverseMap[c] : map[c]) || c).join('');
    };

    const toggleCombining = (str, marker) => {
        const isApplied = str.includes(marker);
        return isApplied
            ? str.replaceAll(marker, '')
            : str.split('').map(c => c + marker).join('');
    };

    const style = document.createElement('style');
    style.innerText = `
    .linked-toolbar-btn {
    background-color: #e6e6e6;
    color: #1b1b1b;
    color: #6f6f6f;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 5px;
    width: 20px;
    height: 20px;
    }
    .linked-toolbar {
      position: absolute;
      top: -10px;
      left: 0;
      z-index: 9999;
      display: flex;
      background: white;
      border: 1px solid #ccc;
      padding: 4px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
  `;
    document.head.appendChild(style);

    const waitForEditor = setInterval(() => {
        const editor = document.querySelector('.ql-editor[contenteditable="true"]');
        if (!editor) return;

        clearInterval(waitForEditor);

        const holder = document.querySelector('.share-creation-state');
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.paddingTop = '30px';
        editor.parentElement.insertBefore(wrapper, editor);
        wrapper.appendChild(editor);

        const toolbar = document.createElement('div');
        toolbar.className = 'linked-toolbar';

        const createBtn = (label, type) => {
            const btn = document.createElement('button');
            btn.className = 'linked-toolbar-btn';
            btn.innerText = label;
            btn.onclick = () => {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                if (!editor.contains(range.commonAncestorContainer)) return;
                const selectedText = selection.toString();
                if (!selectedText.trim()) return;

                let result = selectedText;
                switch (type) {
                    case 'bold':
                        result = toggleText(selectedText, BOLD_MAP, BOLD_REVERSE);
                        break;
                    case 'italic':
                        result = toggleText(selectedText, ITALIC_MAP, ITALIC_REVERSE);
                        break;
                    case 'underline':
                        result = toggleCombining(selectedText, COMBINING_UNDERLINE);
                        break;
                    case 'strike':
                        result = toggleCombining(selectedText, COMBINING_STRIKE);
                        break;
                }

                range.deleteContents();
                range.insertNode(document.createTextNode(result));

                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStartAfter(editor.lastChild);
                newRange.collapse(true);
                selection.addRange(newRange);

                editor.dispatchEvent(new Event('input', {bubbles: true}));
            };
            return btn;
        };

        toolbar.appendChild(createBtn(toggleText('B', BOLD_MAP, BOLD_REVERSE), 'bold'));
        toolbar.appendChild(createBtn(toggleText('I', ITALIC_MAP, ITALIC_REVERSE), 'italic'));
        toolbar.appendChild(createBtn(toggleCombining('U', COMBINING_UNDERLINE), 'underline'));
        toolbar.appendChild(createBtn(toggleCombining('S', COMBINING_STRIKE), 'strike'));

        wrapper.insertBefore(toolbar, editor);

        // Keyboard shortcuts
        editor.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().includes('MAC');
            const isMod = isMac ? e.metaKey : e.ctrlKey;
            const key = e.key.toLowerCase();

            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            if (!editor.contains(range.commonAncestorContainer)) return;

            const selectedText = selection.toString();
            if (!selectedText.trim()) return;

            let result = null;

            if (isMod && key === 'b') {
                e.preventDefault();
                result = toggleText(selectedText, BOLD_MAP, BOLD_REVERSE);
            } else if (isMod && key === 'i') {
                e.preventDefault();
                result = toggleText(selectedText, ITALIC_MAP, ITALIC_REVERSE);
            } else if (isMod && key === 'u') {
                e.preventDefault();
                result = toggleCombining(selectedText, COMBINING_UNDERLINE);
            } else if (isMod && e.shiftKey && key === 'x') {
                e.preventDefault();
                result = toggleCombining(selectedText, COMBINING_STRIKE);
            }

            if (result !== null) {
                range.deleteContents();
                range.insertNode(document.createTextNode(result));
                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStartAfter(editor.lastChild);
                newRange.collapse(true);
                selection.addRange(newRange);
                editor.dispatchEvent(new Event('input', {bubbles: true}));
            }
        });
    }, 500);
})();

