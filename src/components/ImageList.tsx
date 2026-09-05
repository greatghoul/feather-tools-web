import { useState, useEffect, useRef } from 'react';
import { t } from '~/helpers/i18n';
import styles from './ImageList.module.css';

const ImageListItem = ({ 
    image, 
    index,
    draggedIndex,
    disabled,
    sortable,
    onDragStart, 
    onRemove,
    resizedImages = [],
    badgeText
}) => {
    const listItemRef = useRef<HTMLDivElement | null>(null);

    const renderFileSize = (size) => {
        if (size < 1024) {
            return '1KB';
        } else if (size < 1024 * 1024) {
            return `${Math.round(size / 1024)}KB`;
        } else {
            return `${Math.round(size / 1024 / 1024)}MB`;
        }
    }

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(image.id);
    };

    const handleDragStart = (e) => {
        e.preventDefault();
        // Prevent default touch behavior to avoid scrolling on mobile
        if (e.type === 'touchstart') {
            e.preventDefault();
        }
        onDragStart(e, index, listItemRef.current);
    };

    const className = [
        'list-group-item',
        'list-group-item-action',
        styles.imageListItemStyle,
        disabled || draggedIndex == index ? 'opacity-50 pe-none' : '',
    ].join(' ');

    return (
<>

        <div key={image.id} className={className} draggable={sortable} onPointerDown={sortable ? handleDragStart : undefined} onTouchStart={e => e.preventDefault()} onDragStart={e => e.preventDefault()} style={{ cursor: sortable ? 'move' : 'default' }} ref={listItemRef}>
            <div className="d-flex align-items-center">
                {/* Left: Thumbnail */}
                <div className="flex-shrink-0 me-3">
                    <img src={image.url} alt={image.name} className={styles.uploadThumbnailStyle} />
                </div>
                
                {/* Middle: File Name */}
                    <div className={`flex-grow-1 ${styles.minWidth0Style} me-2`}>
                    <p className="mb-0 text-truncate" title={image.name}>{image.name}</p>
                    <div>
                        <small className="text-info-emphasis d-inline-block" style={{ width: '45px' }}>
                            {renderFileSize(image.file.size)}
                        </small>
                        {badgeText
                            ? (
<>
<small className="badge bg-success-subtle text-info-emphasis">{badgeText}</small>
</>
)
                            : (
<>
<small className="text-muted">{image.file.type.replace('image/', '').toUpperCase()}</small>
</>
)
                        }
                    </div>
                </div>
                
                {/* Right: Delete Button */}
                <div className="flex-shrink-0">
                    <button className={`btn btn-sm btn-outline-danger ${styles.imageRemoveStyle}`} onPointerDown={handleRemove} title={t('common/image_list/remove_image')} style={{ minWidth: '32px' }} disabled={disabled}>
                        <i className="bi bi-x"></i>
                    </button>
                </div>
            </div>
        </div>
    
</>
);
};

const ImageList = ({ images, disabled, sortable = true, onChange, resizedImages = [] as any[], itemBadge }) => {
    const [draggedIndex, setDraggedIndex] = useState<any>(null);
    const [draggedItem, setDraggedItem] = useState<any>(null);
    const [sortedImages, setSortedImages] = useState<any[]>([]);
    const listRef = useRef<HTMLDivElement | null>(null);
    
    useEffect(() => {
        setSortedImages(images);
    }, [images]);

    const handleClearAll = () => {
        if (disabled) return;
        onChange([]);
    };

    useEffect(() => {
        if (!draggedItem) return;
        
        const handlePointerUp = (e) => handleDragEnd(e);
        const handlePointerMove = (e) => handleDragMove(e);
        const handleTouchEnd = (e) => handleDragEnd(e);
        const handleTouchMove = (e) => handleDragMove(e);

        document.addEventListener('pointerup', handlePointerUp);
        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        
        return () => {
            document.removeEventListener('pointerup', handlePointerUp);
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchmove', handleTouchMove);
        };
    }, [draggedItem]);

    const handleRemove = (id) => {
        if (disabled) return;

        const newImages = sortedImages.filter(img => img.id !== id);
        setSortedImages(newImages);
        onChange(newImages);
    };

    const handleDragMove = (e) => {
        if (disabled || draggedIndex === null) return;

        const clientY = getEventClientY(e);
        const bodyTop = getBodyTop();
        
        let itemTop = clientY - bodyTop - draggedItem.clickYOffset;
        const listRect = listRef.current!.getBoundingClientRect();
        const listTop = listRect.top - getBodyTop();
        const listBottom = listTop + listRect.height - draggedItem.offsetHeight;
    
        // Ensure itemTop is within the list's range
        if (itemTop <= listTop) {
            itemTop = listTop;
        } else if (itemTop >= listBottom) {
            itemTop = listBottom;
        }
        draggedItem.style.top = `${itemTop}px`;

        const list = listRef.current;
        if (!list) return;

        const items = list.querySelectorAll('.list-group-item');
        if (!items) return;

        // calculate index using clientY to match items' position
        const index = Array.from(items).findIndex(item => {
            const rect = item.getBoundingClientRect();
            return clientY >= rect.top && clientY <= rect.bottom;
        });

        if (index === -1) return;

        handleMove(index);
    }

    const createDragProxy = (draggedItem, clientY) => {
       // clone the list item
        const clone = draggedItem.cloneNode(true);
        clone.classList.add('dragging');
        clone.classList.add('bg-info-subtle');
        clone.style.transition = 'top 0.05s ease';

        // copy the size
        const rect = draggedItem.getBoundingClientRect();
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;

        // copy the position
        const bodyTop = getBodyTop();
        const clickYOffset = clientY - rect.top;
        clone.clickYOffset = clickYOffset;
        clone.style.top = `${clientY - bodyTop - clickYOffset}px`;
        clone.style.left = `${rect.left}px`;
        clone.style.position = 'absolute';
        clone.style.zIndex = '1000';

        // copy padding
        const computedStyle = window.getComputedStyle(draggedItem);
        clone.style.paddingTop = computedStyle.paddingTop;
        clone.style.paddingRight = computedStyle.paddingRight;
        clone.style.paddingBottom = computedStyle.paddingBottom;
        clone.style.paddingLeft = computedStyle.paddingLeft;

        document.body.appendChild(clone);

        return clone;
    }

    const getEventClientY = (e) => e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;
    const getBodyTop = () => document.body.getBoundingClientRect().top;

    const handleDragStart = (e, index, draggedItem) => {
        if (disabled) return;

        setDraggedIndex(index);

        const clientY = getEventClientY(e);
        const dragProxy = createDragProxy(draggedItem, clientY);
        setDraggedItem(dragProxy);
    };

    const handleMove = (index) => {
        if (draggedIndex !== index) {
            const newImages = [...sortedImages];
            const draggedImage = newImages[draggedIndex];
            newImages.splice(draggedIndex, 1);
            newImages.splice(index, 0, draggedImage);
            setSortedImages(newImages);
            setDraggedIndex(index);
        }
    };

    const handleDragEnd = (_e?: any) => {
        setTimeout(() => {
            setDraggedIndex(null);
            setDraggedItem(null);
        }, 100);

        setSortedImages(data => {
            onChange(data);
            return data;
        });

        const draggedItems = document.querySelectorAll('.dragging');
        draggedItems.forEach(item => {
            document.body.removeChild(item);
        });
    };

    const renderImageListItem = (image, index) => {
        const badgeText = itemBadge ? itemBadge(image, index) : undefined;
        return (
            <ImageListItem key={index} image={image} index={index} draggedIndex={draggedIndex} disabled={disabled} sortable={sortable} onRemove={handleRemove} onDragStart={handleDragStart} resizedImages={resizedImages.find(r => r.original.id === image.id)?.resized || []} badgeText={badgeText} />
        );
    }

    const renderListFooter = (showNoImages = false) => (
<>

        <div className="card-footer d-flex justify-content-between align-items-center">
            <span className="text-primary-emphasis">
                {showNoImages ? t('common/image_list/no_images') : `${t('common/image_list/images_count')} (${sortedImages.length})`}
            </span>
            <button className="btn btn-sm btn-outline-danger ms-3" onClick={handleClearAll} title={t('common/image_list/clear_all')} disabled={disabled || sortedImages.length === 0}>
                {t('common/image_list/clear_all')}
            </button>
        </div>
    
</>
);

    return (
<>

        {renderListFooter(sortedImages.length === 0)}
        {sortedImages.length > 0 && (
<>

            <div className="list-group list-group-flush" ref={listRef}>
                {sortedImages.map(renderImageListItem)}
            </div>
            {sortedImages.length > 5 && renderListFooter()}
        
</>
)}
    
</>
);
};

export default ImageList;
