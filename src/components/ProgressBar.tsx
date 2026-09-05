import styles from './ProgressBar.module.css';

const ProgressBar = ({ value = 0 }) => {
    return (
<>

        <div className={`progress ${styles.progressFtStyle}`}>
            <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${value}%` }} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} />
        </div>
    
</>
);
};

export default ProgressBar;
