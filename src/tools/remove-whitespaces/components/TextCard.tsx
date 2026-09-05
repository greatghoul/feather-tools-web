import { useRef, useEffect } from 'react';
import { t } from '~/helpers/i18n';
import { EditorView, keymap, highlightActiveLine, drawSelection, Decoration, ViewPlugin, MatchDecorator } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import styles from './TextCard.module.css';

const whitespaceMatcher = new MatchDecorator({
    regexp: /[ \t\u3000]/g,
    decoration: match => Decoration.mark({
        class: match[0] === ' ' ? 'cm-whitespace-space' : 
               match[0] === '\t' ? 'cm-whitespace-tab' : 'cm-whitespace-fullwidth-space'
    })
});

const whitespaceHighlighter = ViewPlugin.fromClass(class {
    decorations: any;

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
    const editorRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

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

    return (
<>

        <div className="card mb-4">
            <div className="card-header bg-light">
                <button className="btn btn-outline-secondary btn-sm float-end ms-2" onClick={handleClearInput}>{t('remove-whitespaces/button/clear')}</button>
                <button className="btn btn-outline-secondary btn-sm float-end me-2" onClick={loadExampleText}>{t('remove-whitespaces/button/load_example_text')}</button>
                <h5 className="mb-0">{t('remove-whitespaces/input/text_input')}</h5>
            </div>
            <div className="card-body">
                <div ref={editorRef} className={styles.codeMirrorContainerStyle}></div>
            </div>
        </div>
    
</>
);
};

export default TextCard;
