import { useRef, useEffect } from 'react';
import { t } from '~/helpers/i18n';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, Decoration, placeholder } from '@codemirror/view';
import { EditorState, StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import styles from './TextCard.module.css';

const duplicateLineStyle = Decoration.line({
    attributes: { class: styles.duplicateLine }
});

// Effect to update settings
const setSettings = StateEffect.define<any>();

const duplicateHighlighter = StateField.define({
    create() {
        return Decoration.none;
    },
    update(decorations, tr) {
        // Only update if doc changed or settings changed
        let settingsChanged = tr.effects.some(e => e.is(setSettings));
        if (!tr.docChanged && !settingsChanged) return decorations;

        // Get current settings from effect or previous state (simplified for now by using a shared variable or re-parsing)
        // For simplicity in this component, we'll re-calculate on every change
        const settings = tr.effects.find(e => e.is(setSettings))?.value || tr.startState.field(duplicateHighlighterSettings, false) || {};
        
        const builder = new RangeSetBuilder<Decoration>();
        const lineAndSeen = {};
        const doc = tr.newDoc;

        for (let i = 1; i <= doc.lines; i++) {
            const line = doc.line(i);
            let processedLine = line.text;
            if (settings.ignoreLeading) processedLine = processedLine.trimStart();
            if (settings.ignoreTrailing) processedLine = processedLine.trimEnd();

            if (lineAndSeen[processedLine]) {
                lineAndSeen[processedLine].push(line.from);
            } else {
                lineAndSeen[processedLine] = [line.from];
            }
        }

        const duplicateStarts: number[] = [];
        for (const line in lineAndSeen) {
            if (lineAndSeen[line].length > 1) {
                duplicateStarts.push(...lineAndSeen[line]);
            }
        }
        duplicateStarts.sort((a, b) => a - b);

        for (const from of duplicateStarts) {
            builder.add(from, from, duplicateLineStyle);
        }

        return builder.finish();
    },
    provide: f => EditorView.decorations.from(f)
});

// Helper field to store settings in state
const duplicateHighlighterSettings = StateField.define({
    create() { return {}; },
    update(value, tr) {
        const effect = tr.effects.find(e => e.is(setSettings));
        return effect ? effect.value : value;
    }
});

const TextCard = ({ text, onTextChange, settings }) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);

    // Initial Editor creation
    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            const state = EditorState.create({
                doc: text || '',
                extensions: [
                    lineNumbers(),
                    highlightActiveLine(),
                    drawSelection(),
                    history(),
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    EditorView.lineWrapping,
                    placeholder(t('text-dedup/text/placeholder')),
                    duplicateHighlighterSettings,
                    duplicateHighlighter,
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            const newText = update.state.doc.toString();
                            if (onTextChange && newText !== text) {
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

            // Initial settings
            viewRef.current.dispatch({
                effects: setSettings.of(settings)
            });
        }

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    // Update editor value when text prop changes
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

    // Update settings when they change
    useEffect(() => {
        if (viewRef.current) {
            viewRef.current.dispatch({
                effects: setSettings.of(settings)
            });
        }
    }, [settings]);

    const loadExampleText = () => {
        const exampleText = '  apple\nbanana\napple\n  orange\nbanana  \ngrape\napple';
        if (onTextChange) {
            onTextChange(exampleText);
        }
    };

    return (
<>

        <div className="card">
            <div className="card-header">
                {t('text-dedup/text/title')}
                <button className="btn btn-sm btn-outline-secondary float-end" onClick={loadExampleText}>{t('text-dedup/button/load_example')}</button>
            </div>
            <div className={`card-body ${styles.noPadding}`}>
                <div ref={editorRef}></div>
            </div>
        </div>
    
</>
);
};

export default TextCard;
