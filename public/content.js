(function () {
    const createMap = (offsetUpper, offsetLower) => {
        const map = {};
        for (let i = 65; i <= 90; i++) map[String.fromCharCode(i)] = String.fromCodePoint(offsetUpper + (i - 65));
        for (let i = 97; i <= 122; i++) map[String.fromCharCode(i)] = String.fromCodePoint(offsetLower + (i - 97));
        return map;
    };

    const invertMap = (map) =>
        Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));

    const BOLD_MAP = createMap(0x1D400, 0x1D41A);
    const BOLD_REVERSE = invertMap(BOLD_MAP);
    const ITALIC_MAP = createMap(0x1D608, 0x1D622);
    const ITALIC_REVERSE = invertMap(ITALIC_MAP);

    const COMBINING_UNDERLINE = '\u0332';
    const COMBINING_STRIKE = '\u0336';

    const underlineText = (text) =>
        text.split('').map(c => c + COMBINING_UNDERLINE).join('');

    const strikethroughText = (text) =>
        text.split('').map(c => c + COMBINING_STRIKE).join('');

    const formatText = (str, map) =>
        str.split('').map(c => map[c] || c).join('');

    const toggleText = (str, map, reverseMap) => {
        const isAlreadyFormatted = [...str].every(c => {
            return reverseMap[c] || c === ' '
        });

        let result
        if (isAlreadyFormatted) {
            result = [...str].map(c => reverseMap[c] || c).join('')
        } else {
            result = [...str].map(c => map[c] || c).join('');
        }
        return result
    };

    const style = document.createElement('style');
    style.innerText = `
    .linked-toolbar-btn {
      background-color: #0a66c2;
      color: white;
      font-weight: bold;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      padding: 4px 10px;
      font-size: 14px;
      margin-right: 5px;
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

        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        editor.parentElement.insertBefore(wrapper, editor);
        wrapper.appendChild(editor);

        const toolbar = document.createElement('div');
        toolbar.className = 'linked-toolbar';

        const createBtn = (label, map, reverseMap) => {
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

                const toggled = toggleText(selectedText, map, reverseMap);
                range.deleteContents();
                range.insertNode(document.createTextNode(toggled));

                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStartAfter(editor.lastChild);
                newRange.collapse(true);
                selection.addRange(newRange);

                editor.dispatchEvent(new Event('input', {bubbles: true}));
            };
            return btn;
        };

        toolbar.appendChild(createBtn('B', BOLD_MAP, BOLD_REVERSE));
        toolbar.appendChild(createBtn('I', ITALIC_MAP, ITALIC_REVERSE));

        wrapper.insertBefore(toolbar, editor);
    }, 500);
})();
