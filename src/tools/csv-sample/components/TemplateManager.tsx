import { useState, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import { notify } from '~/helpers/messages';
import { listTemplates, addTemplate, deleteTemplate, updateTemplate } from '../services/TemplateStorage';

const LAST_TEMPLATE_KEY = 'csv-sample:lastTemplateId';

const TemplateManager = ({ config, onApplyTemplate, onActiveTemplateChange }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeId, setActiveId] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newName, setNewName] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [isBusy, setIsBusy] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const newNameRef = useRef<HTMLInputElement | null>(null);
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
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
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
        notify(t('csv-sample/message/loaded'), '', 'success');
    };

    const handleCreate = async () => {
        const trimmed = newName.trim();
        if (!trimmed) {
            notify(t('csv-sample/message/save_name_required'), '', 'warning');
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
            notify(t('csv-sample/message/saved'), '', 'success');
        } catch (err) {
            console.error('Failed to create template:', err);
            notify(t('csv-sample/message/save_failed'), '', 'error');
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
            notify(t('csv-sample/message/deleted'), '', 'success');
        } catch (err) {
            console.error('Failed to delete template:', err);
        } finally {
            setIsBusy(false);
        }
    };

    return (
<>

        <div className="csv-sample-templates" ref={rootRef}>
            <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={() => {
                    setOpen(!open);
                    setConfirmDeleteId(null);
                }}>
                <i className="bi bi-collection me-1"></i>
                <span>{activeTemplate ? activeTemplate.name : t('csv-sample/templates/no_active')}</span>
                <i className="bi bi-chevron-up small"></i>
            </button>
            {open ? (
<>

                <div className="csv-sample-templates-popover">
                    <div className="csv-sample-templates-popover-header">
                        <span className="small fw-bold">{t('csv-sample/templates/title')}</span>
                    </div>
                    <ul className="csv-sample-templates-list">
                        {templates.length === 0
                            ? (
<>

                                <li className="text-muted small p-2">{t('csv-sample/templates/no_templates')}</li>
                            
</>
)
                            : templates.map((tpl) => (
<>

                                <li className="d-flex align-items-center csv-sample-templates-item-row">
                                    <button className={`csv-sample-templates-item ${tpl.id === activeId ? 'active' : ''}`} onClick={() => handleLoad(tpl)}>
                                        <i className="bi bi-file-earmark-text me-1"></i>
                                        {tpl.name}
                                    </button>
                                    {confirmDeleteId === tpl.id ? (
<>

                                        <div className="d-flex align-items-center csv-sample-templates-confirm">
                                            <button className="btn btn-sm btn-link text-danger csv-sample-templates-delete" title={t('csv-sample/templates/confirm')} onClick={() => handleDelete(tpl.id)} disabled={isBusy}>
                                                <i className="bi bi-check-lg"></i>
                                            </button>
                                            <button className="btn btn-sm btn-link text-secondary csv-sample-templates-delete" title={t('csv-sample/templates/cancel')} onClick={() => setConfirmDeleteId(null)}>
                                                <i className="bi bi-x-lg"></i>
                                            </button>
                                        </div>
                                    
</>
) : (
<>

                                        <button className="btn btn-sm btn-link text-danger csv-sample-templates-delete" title={t('csv-sample/templates/delete')} onClick={(e) => {
                                                e.stopPropagation();
                                                cancelNewForm();
                                                setConfirmDeleteId(tpl.id);
                                            }}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    
</>
)}
                                </li>
                            
</>
))
                        }
                    </ul>
                    <div className="csv-sample-templates-actions">
                        {showNewForm ? (
<>

                            <div className="d-flex gap-2 mb-2">
                                <input ref={newNameRef} type="text" className="form-control form-control-sm" placeholder={t('csv-sample/templates/name_placeholder')} value={newName} onInput={(e) => setNewName((e.target as HTMLInputElement).value)} onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreate();
                                    }} />
                                <button className="btn btn-sm btn-link text-success csv-sample-templates-delete" title={t('csv-sample/templates/save')} onClick={handleCreate} disabled={isBusy}>
                                    <i className="bi bi-check-lg"></i>
                                </button>
                                <button className="btn btn-sm btn-link text-secondary csv-sample-templates-delete" title={t('csv-sample/templates/cancel')} onClick={cancelNewForm}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        
</>
) : (
<>

                            <button className="btn btn-sm btn-outline-primary w-100" onClick={() => setShowNewForm(true)}>
                                <i className="bi bi-plus-lg me-1"></i>{t('csv-sample/templates/new')}
                            </button>
                        
</>
)}
                    </div>
                </div>
            
</>
) : null}
        </div>
    
</>
);
};

export default TemplateManager;
