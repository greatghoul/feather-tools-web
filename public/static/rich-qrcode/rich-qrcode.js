import { html } from 'htm/preact';
import { render, h } from 'preact';
import { useState } from 'preact/hooks';
import { setup, css } from 'goober';
import { StoreContext } from '~/contexts/StoreContext.js';
import LinkFetchForm from '@/components/LinkFetchForm.js';
import SettingCard from '@/components/SettingCard.js';
import PreviewCard from '@/components/PreviewCard.js';

setup(h);

const appStyle = css`
/* Rich QR Code styles */
/* URL input styling */
.url-input-container {
  margin-bottom: 1.5rem;
}

.input-group-lg .form-control-lg {
  padding: 0.75rem 1rem;
  font-size: 1.1rem;
}

.input-group-lg .btn {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

/* QR code card styling */
.qrcode-card-container {
  display: flex;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  background-color: #f8f9fa;
}

#qrcode-card {
  max-width: 100%;
  height: auto;
  border: 1px solid #e9ecef;
}

/* Make download button more noticeable */
#download-card-btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

#download-card-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

#download-card-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Form input styling */
.form-control:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Card styling */
.card {
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  border-bottom: 1px solid #eaeaea;
}

/* Loading state transitions */
.card {
  transition: opacity 0.3s ease;
}

button {
  position: relative;
  transition: all 0.2s ease;
}

.spinner-border {
  transition: opacity 0.2s ease;
}

/* For mobile devices */
@media (max-width: 767px) {
  #qrcode-card {
    width: 100%;
    height: auto;
    max-width: 430px; /* Half original size for mobile */
    max-height: 60px;
  }
  
  .input-group-lg .btn {
    padding: 0.75rem 1rem;
  }
}

/* For very small devices */
@media (max-width: 480px) {
  .input-group-lg {
    flex-direction: column;
  }
  
  .input-group-lg .form-control,
  .input-group-lg .btn {
    border-radius: 4px;
    width: 100%;
  }
  
  .input-group-lg .btn {
    margin-top: 10px;
  }
}
`;

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

    return html`
        <${StoreContext.Provider} value=${store}>
            <div class=${appStyle}>
                <${LinkFetchForm} onFetched=${setLinkInfo} />
                <div class="row row-gap-4 mb-4">
                    <div class="col-lg-6">
                        <${SettingCard} linkInfo=${linkInfo} onGenerate=${handleGenerate} />
                    </div>
                    <div class="col-lg-6">
                        <${PreviewCard} 
                            linkInfo=${linkInfo} 
                        />
                    </div>
                </div>
            </div>
        <//>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    render(html`<${App} />`, document.getElementById('app'));
});
