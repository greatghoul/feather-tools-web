import styles from './CanvasPrintable.module.css';

const CanvasPrintable = ({ canvasRef, layout = 'portrait', className = '', ...props }) => {
    return (
<>

        <div className={styles.containerStyle}>
            <canvas ref={canvasRef} className={`${styles.canvasStyle} ${layout} ${className}`} {...props}></canvas>
        </div>
    
</>
);
};

export default CanvasPrintable;
