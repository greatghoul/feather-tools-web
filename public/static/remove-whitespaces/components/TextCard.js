import { html } from 'htm/preact';
import { useRef, useEffect } from 'preact/hooks';
import { css } from 'goober';
import { getText } from '~/helpers/utils.js';
import { EditorView, keymap, highlightActiveLine, drawSelection, Decoration, ViewPlugin, MatchDecorator } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

const codeMirrorContainerStyle = css`
    min-height: 200px;

    .cm-editor {
        border: 1px solid #dee2e6;
        border-radius: 0.375rem;
        font-family: monospace;
        min-height: 200px;
    }

    .cm-editor.cm-focused {
        border-color: #86b7fe;
        outline: 0;
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }

    .cm-scroller {
        font-family: inherit;
    }

    /* Whitespace highlighting styles */
    .cm-whitespace-space, .cm-whitespace-tab, .cm-whitespace-fullwidth-space {
        position: relative;
    }

    .cm-whitespace-space::after {
        content: '·';
        color: #cfcfcf;
        font-weight: bold;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        pointer-events: none;
    }

    .cm-whitespace-tab::after {
        content: '→';
        color: #0d6efd;
        font-weight: bold;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        pointer-events: none;
    }

    .cm-whitespace-fullwidth-space::after {
        content: 'ㅇ';
        color: #cfcfcf;
        font-weight: bold;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        display: flex;
        justify-content: center;
        pointer-events: none;
    }
`;

const whitespaceMatcher = new MatchDecorator({
    regexp: /[ \t\u3000]/g,
    decoration: match => Decoration.mark({
        class: match[0] === ' ' ? 'cm-whitespace-space' : 
               match[0] === '\t' ? 'cm-whitespace-tab' : 'cm-whitespace-fullwidth-space'
    })
});

const whitespaceHighlighter = ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = whitespaceMatcher.createDeco(view);
    }
    update(update) {
        this.decorations = whitespaceMatcher.updateDeco(update, this.decorations);
    }
}, {
    decorations: instance => instance.decorations
});

const TextCard = ({ text, onTextChange }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);

    // Update editor when text prop changes
    useEffect(() => {
        if (viewRef.current && text !== undefined) {
            const currentValue = viewRef.current.state.doc.toString();
            if (currentValue !== text) {
                viewRef.current.dispatch({
                    changes: { from: 0, to: currentValue.length, insert: text }
                });
            }
        }
    }, [text]);

    const loadExampleText = () => {
        const exampleText = `
        It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.    
        


        		However little known the feelings or views of such a man may be on his first entering a neighbourhood,     
        this truth is so well fixed in the minds of the surrounding families,    
        that he is considered the rightful property of some one or other of their daughters.    
        		
        The 		End.    
        
        这是一个测试：　　中文全角空格　和　普通空格 混合的例子。
        `;
        if (onTextChange) {
            onTextChange(exampleText);
        }
    };

    const handleClearInput = () => {
        if (onTextChange) {
            onTextChange('');
        }
    };

    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            const state = EditorState.create({
                doc: text || '',
                extensions: [
                    highlightActiveLine(),
                    drawSelection(),
                    history(),
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    EditorView.lineWrapping,
                    whitespaceHighlighter,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            const newText = update.state.doc.toString();
                            if (onTextChange) {
                                onTextChange(newText);
                            }
                        }
                    })
                ]
            });

            viewRef.current = new EditorView({
                state,
                parent: editorRef.current
            });
        }

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    return html`
        <div class="card mb-4">
            <div class="card-header bg-light">
                <button class="btn btn-outline-secondary btn-sm float-end ms-2" onClick=${handleClearInput}>${getText('remove-whitespaces/button/clear')}</button>
                <button class="btn btn-outline-secondary btn-sm float-end me-2" onClick=${loadExampleText}>${getText('remove-whitespaces/button/load_example_text')}</button>
                <h5 class="mb-0">${getText('remove-whitespaces/input/text_input')}</h5>
            </div>
            <div class="card-body">
                <div 
                    ref=${editorRef}
                    class=${codeMirrorContainerStyle}
                ></div>
            </div>
        </div>
    `;
};

export default TextCard;
