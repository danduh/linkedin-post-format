(function () {
    const style = document.createElement('style');
    style.innerText = `
    .linked-toolbar-btn {
        background-color: #e6e6e6;
        color: #6f6f6f;
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
      bottom: 0;
      right: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      background: white;
      border: 1px solid #ccc;
      padding: 4px;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    .linked-style-select {
      font-size: 14px;
      padding: 4px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  `;
    document.head.appendChild(style);

    const applyFormatting = (text, variant, combinings = '') => {
        try {
            return toUnicodeVariant(text, variant, combinings);
        } catch (e) {
            console.error('Formatting error:', e);
            return text;
        }
    };

    const injectToolbar = (holder, editor) => {
        if (holder.closest('.linked-toolbar-wrapper')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'linked-toolbar-wrapper';
        wrapper.style.position = 'relative';

        const parent = holder.parentElement;
        parent.insertBefore(wrapper, holder);
        wrapper.appendChild(holder);

        const toolbar = document.createElement('div');
        toolbar.className = 'linked-toolbar';

        const formats = [
            {label: 'B', variant: 'bold'},
            {label: 'I', variant: 'italic'},
            {label: 'U', variant: 'italic', combinings: 'underline'},
            {label: 'S', variant: 'italic', combinings: 'strike'}
        ];

        formats.forEach(({label, variant, combinings}) => {
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

                const styled = applyFormatting(selectedText, variant, combinings);
                range.deleteContents();
                range.insertNode(document.createTextNode(styled));

                selection.removeAllRanges();
                const newRange = document.createRange();
                newRange.setStartAfter(editor.lastChild);
                newRange.collapse(true);
                selection.addRange(newRange);

                editor.dispatchEvent(new Event('input', {bubbles: true}));
            };
            toolbar.appendChild(btn);
        });

        // Add dropdown with variant styles
        const dropdown = document.createElement('select');
        dropdown.className = 'linked-style-select';

        const variantOptions = {
            'Sans': 'sans',
            'Bold Sans': 'bold sans',
            'Italic Sans': 'italic sans',
            'Bold Italic Sans': 'bold italic sans',
            'Fullwidth': 'fullwidth',
            'Monospace': 'monospace',
            'Bold': 'bold',
            'Italic': 'italic',
            'Bold Italic': 'bold italic',
            'Script': 'script',
            'Bold Script': 'bold script',
            'Gothic': 'gothic',
            'Bold Gothic': 'gothic bold',
            'Double Struck': 'double'
        };

        const defaultOption = document.createElement('option');
        defaultOption.innerText = '🎨 Select Style';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dropdown.appendChild(defaultOption);

        for (const [name, value] of Object.entries(variantOptions)) {
            const opt = document.createElement('option');
            opt.value = value;
            opt.innerText = applyFormatting(name, value);
            dropdown.appendChild(opt);
        }

        dropdown.onchange = () => {
            const selection = window.getSelection();
            if (!selection.rangeCount) return;
            const range = selection.getRangeAt(0);
            if (!editor.contains(range.commonAncestorContainer)) return;
            const selectedText = selection.toString();
            if (!selectedText.trim()) return;

            const variant = dropdown.value;
            const cleanText = reverseUnicodeVariant(selectedText)
            const styled = applyFormatting(cleanText, variant);
            range.deleteContents();
            range.insertNode(document.createTextNode(styled));

            selection.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStartAfter(editor.lastChild);
            newRange.collapse(true);
            selection.addRange(newRange);

            editor.dispatchEvent(new Event('input', {bubbles: true}));
            dropdown.selectedIndex = 0;
        };

        toolbar.appendChild(dropdown);
        wrapper.insertBefore(toolbar, holder);
    };

    const observer = new MutationObserver(() => {
        const header = document.getElementById('share-to-linkedin-modal__header');

        const editor = document.querySelector('.ql-editor[contenteditable="true"]');
        if (editor && !editor.closest('.linked-toolbar-wrapper')) {
            injectToolbar(header, editor);
// === KEYBOARD SHORTCUTS ===
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

                let styled = null;

                if (isMod && key === 'b') {
                    e.preventDefault();
                    styled = applyFormatting(reverseUnicodeVariant(selectedText), 'bold');
                } else if (isMod && key === 'i') {
                    e.preventDefault();
                    styled = applyFormatting(reverseUnicodeVariant(selectedText), 'italic');
                } else if (isMod && key === 'u') {
                    e.preventDefault();
                    styled = applyFormatting(reverseUnicodeVariant(selectedText), 'italic', 'underline');
                }

                if (styled) {
                    range.deleteContents();
                    range.insertNode(document.createTextNode(styled));
                    selection.removeAllRanges();
                    const newRange = document.createRange();
                    newRange.setStartAfter(editor.lastChild);
                    newRange.collapse(true);
                    selection.addRange(newRange);
                    editor.dispatchEvent(new Event('input', {bubbles: true}));
                }
            });
        }
    });

    observer.observe(document.body, {childList: true, subtree: true});

    console.log("[Linked Formatter] Toolbar + Dropdown ready 🚀");
})();
