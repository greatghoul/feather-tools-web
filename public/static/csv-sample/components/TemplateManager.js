import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { getText } from '~/helpers/utils.js';
import { notify } from '~/helpers/messages.js';
import { listTemplates, addTemplate, deleteTemplate, updateTemplate } from '@/services/TemplateStorage.js';

const LAST_TEMPLATE_KEY = 'csv-sample:lastTemplateId';

const TemplateManager = ({ config, onApplyTemplate, onActiveTemplateChange }) => {
    const [templates, setTemplates] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [open, setOpen] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isBusy, setIsBusy] = useState(false);
    const rootRef = useRef(null);
    const newNameRef = useRef(null);
    const configRef = useRef(config);
    configRef.current = config;

    const activeTemplate = templates.find((t) => t.id === activeId) || null;

    const refresh = async () => {
        try {
            const list = await listTemplates();
            setTemplates(list);
            setActiveId((prev) => (list.some((t) => t.id === prev) ? prev : null));
        } catch (err) {
            console.error('Failed to list templates:', err);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const list = await listTemplates();
                setTemplates(list);
                const lastId = localStorage.getItem(LAST_TEMPLATE_KEY);
                const lastIdNum = lastId ? Number(lastId) : null;
                const target = list.find((t) => t.id === lastIdNum) || null;
                if (target) {
                    setActiveId(target.id);
                    onApplyTemplate(target.config);
                } else {
                    setActiveId(null);
                }
            } catch (err) {
                console.error('Failed to list templates:', err);
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (showNewForm && newNameRef.current) {
            newNameRef.current.focus();
        }
    }, [showNewForm]);

    useEffect(() => {
        if (onActiveTemplateChange) {
            onActiveTemplateChange(activeTemplate ? activeTemplate.name : '');
        }
    }, [activeTemplate]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false);
                setConfirmDeleteId(null);
                cancelNewForm();
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!activeId) return;
        const timer = setTimeout(async () => {
            try {
                await updateTemplate(activeId, configRef.current);
            } catch (err) {
                console.error('Failed to auto-save template:', err);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [config, activeId]);

    const cancelNewForm = () => {
        setNewName('');
        setShowNewForm(false);
    };

    const handleLoad = (template) => {
        onApplyTemplate(template.config);
        setActiveId(template.id);
        localStorage.setItem(LAST_TEMPLATE_KEY, String(template.id));
        cancelNewForm();
        setOpen(false);
        notify(getText('csv-sample/message/loaded'), '', 'success');
    };

    const handleCreate = async () => {
        const trimmed = newName.trim();
        if (!trimmed) {
            notify(getText('csv-sample/message/save_name_required'), '', 'warning');
            return;
        }
        setIsBusy(true);
        try {
            const id = await addTemplate(trimmed, configRef.current);
            await refresh();
            setActiveId(id);
            localStorage.setItem(LAST_TEMPLATE_KEY, String(id));
            cancelNewForm();
            setOpen(false);
            notify(getText('csv-sample/message/saved'), '', 'success');
        } catch (err) {
            console.error('Failed to create template:', err);
            notify(getText('csv-sample/message/save_failed'), '', 'error');
        } finally {
            setIsBusy(false);
        }
    };

    const handleDelete = async (id) => {
        setIsBusy(true);
        try {
            await deleteTemplate(id);
            if (localStorage.getItem(LAST_TEMPLATE_KEY) === String(id)) {
                localStorage.removeItem(LAST_TEMPLATE_KEY);
            }
            await refresh();
            setConfirmDeleteId(null);
            notify(getText('csv-sample/message/deleted'), '', 'success');
        } catch (err) {
            console.error('Failed to delete template:', err);
        } finally {
            setIsBusy(false);
        }
    };

    return html`
        <div class="csv-sample-templates" ref=${rootRef}>
            <button
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick=${() => {
                    setOpen(!open);
                    setConfirmDeleteId(null);
                }}
            >
                <i class="bi bi-collection me-1"></i>
                <span>${activeTemplate ? activeTemplate.name : getText('csv-sample/templates/no_active')}</span>
                <i class="bi bi-chevron-up small"></i>
            </button>
            ${open ? html`
                <div class="csv-sample-templates-popover">
                    <div class="csv-sample-templates-popover-header">
                        <span class="small fw-bold">${getText('csv-sample/templates/title')}</span>
                    </div>
                    <ul class="csv-sample-templates-list">
                        ${templates.length === 0
                            ? html`
                                <li class="text-muted small p-2">${getText('csv-sample/templates/no_templates')}</li>
                            `
                            : templates.map((t) => html`
                                <li class="d-flex align-items-center csv-sample-templates-item-row">
                                    <button
                                        class="csv-sample-templates-item ${t.id === activeId ? 'active' : ''}"
                                        onClick=${() => handleLoad(t)}
                                    >
                                        <i class="bi bi-file-earmark-text me-1"></i>
                                        ${t.name}
                                    </button>
                                    ${confirmDeleteId === t.id ? html`
                                        <div class="d-flex align-items-center csv-sample-templates-confirm">
                                            <button
                                                class="btn btn-sm btn-link text-danger csv-sample-templates-delete"
                                                title=${getText('csv-sample/templates/confirm')}
                                                onClick=${() => handleDelete(t.id)}
                                                disabled=${isBusy}
                                            >
                                                <i class="bi bi-check-lg"></i>
                                            </button>
                                            <button
                                                class="btn btn-sm btn-link text-secondary csv-sample-templates-delete"
                                                title=${getText('csv-sample/templates/cancel')}
                                                onClick=${() => setConfirmDeleteId(null)}
                                            >
                                                <i class="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    ` : html`
                                        <button
                                            class="btn btn-sm btn-link text-danger csv-sample-templates-delete"
                                            title=${getText('csv-sample/templates/delete')}
                                            onClick=${(e) => {
                                                e.stopPropagation();
                                                cancelNewForm();
                                                setConfirmDeleteId(t.id);
                                            }}
                                        >
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    `}
                                </li>
                            `)
                        }
                    </ul>
                    <div class="csv-sample-templates-actions">
                        ${showNewForm ? html`
                            <div class="d-flex gap-2 mb-2">
                                <input
                                    ref=${newNameRef}
                                    type="text"
                                    class="form-control form-control-sm"
                                    placeholder=${getText('csv-sample/templates/name_placeholder')}
                                    value=${newName}
                                    onInput=${(e) => setNewName(e.target.value)}
                                    onKeyDown=${(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                    }}
                                />
                                <button
                                    class="btn btn-sm btn-link text-success csv-sample-templates-delete"
                                    title=${getText('csv-sample/templates/save')}
                                    onClick=${handleCreate}
                                    disabled=${isBusy}
                                >
                                    <i class="bi bi-check-lg"></i>
                                </button>
                                <button
                                    class="btn btn-sm btn-link text-secondary csv-sample-templates-delete"
                                    title=${getText('csv-sample/templates/cancel')}
                                    onClick=${cancelNewForm}
                                >
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        ` : html`
                            <button
                                class="btn btn-sm btn-outline-primary w-100"
                                onClick=${() => setShowNewForm(true)}
                            >
                                <i class="bi bi-plus-lg me-1"></i>${getText('csv-sample/templates/new')}
                            </button>
                        `}
                    </div>
                </div>
            ` : null}
        </div>
    `;
};

export default TemplateManager;
