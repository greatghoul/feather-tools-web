import { useState } from 'react';
import { StoreContext } from '~/contexts/StoreContext';
import LinkFetchForm from './components/LinkFetchForm';
import SettingCard from './components/SettingCard';
import PreviewCard from './components/PreviewCard';
import styles from './App.module.css';

function App() {
    const [busy, setBusy] = useState(false);
    const [linkInfo, setLinkInfo] = useState({ title: '', url: '' });

    const store = {
        busy,
        setBusy,
    };

    const handleGenerate = (info) => {
        setLinkInfo(info);
    };

    return (
<>

        <StoreContext.Provider value={store}>
            <div className={styles.appStyle}>
                <LinkFetchForm onFetched={setLinkInfo} />
                <div className="row row-gap-4 mb-4">
                    <div className="col-lg-6">
                        <SettingCard linkInfo={linkInfo} onGenerate={handleGenerate} />
                    </div>
                    <div className="col-lg-6">
                        <PreviewCard linkInfo={linkInfo} />
                    </div>
                </div>
            </div>
        </StoreContext.Provider>
    
</>
);
}

export default App;
