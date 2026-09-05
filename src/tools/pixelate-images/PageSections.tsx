import { t } from '~/helpers/i18n';
import { T } from '~/helpers/T';

export const SectionsBefore = () => (
    <>

    </>
);

export const SectionsAfter = () => (
    <>


    <div className="row row-gap-4 mb-4">
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='pixelate-images/how_to_use/title' /></h2>
                </div>
                <div className="card-body">
                    <ol>
                        <li><strong><T k='pixelate-images/how_to_use/upload_images' /></strong> <T k='pixelate-images/how_to_use/upload_images_desc' /></li>
                        <li><T k='pixelate-images/how_to_use/select_tool' /> <strong><T k='pixelate-images/how_to_use/select_tool_desc' /></strong>
                            <ul>
                                <li><strong><T k='pixelate-images/how_to_use/tool_square' /></strong> <T k='pixelate-images/how_to_use/tool_square_desc' /></li>
                                <li><strong><T k='pixelate-images/how_to_use/tool_circle' /></strong> <T k='pixelate-images/how_to_use/tool_circle_desc' /></li>
                                <li><strong><T k='pixelate-images/how_to_use/tool_brush' /></strong> <T k='pixelate-images/how_to_use/tool_brush_desc' /></li>
                            </ul>
                        </li>
                        <li><strong><T k='pixelate-images/how_to_use/apply_pixelation' /></strong> <T k='pixelate-images/how_to_use/apply_pixelation_desc' /></li>
                        <li><strong><T k='pixelate-images/how_to_use/clear_pixelations' /></strong> <T k='pixelate-images/how_to_use/clear_pixelations_desc' /></li>
                        <li><strong><T k='pixelate-images/how_to_use/download' /></strong> <T k='pixelate-images/how_to_use/download_desc' /></li>
                    </ol>
                </div>
            </div>
        </div>
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header">
                    <h2 className="h5 mb-0"><T k='pixelate-images/tips/title' /></h2>
                </div>
                <div className="card-body">
                    <ul className="list-unstyled">
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='pixelate-images/tips/undo' /></li>
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='pixelate-images/tips/shift_key' /></li>
                        <li className="mb-2"><i className="bi bi-info-circle text-primary me-1"></i> <T k='pixelate-images/tips/brush_size' /></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    
    </>
);
