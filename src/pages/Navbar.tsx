import { t } from '~/helpers/i18n';
import type { Locale } from '~/data/site';

const NAV_ITEMS: { anchor: string; key: string }[] = [
    { anchor: 'text-tools', key: 'nav/text' },
    { anchor: 'image-tools', key: 'nav/image' },
    { anchor: 'video-tools', key: 'nav/video' },
    { anchor: 'printable-tools', key: 'nav/printable' },
    { anchor: 'extension-tools', key: 'nav/extension' },
];

interface NavbarProps {
    locale: Locale;
    alternates: Record<Locale, string>;
}

export const Navbar = ({ locale, alternates }: NavbarProps) => (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container">
            <a className="navbar-brand d-flex align-items-center" href={`/${locale}/`}>
                <img src="/static/favicon-32x32.png" alt="Logo" width={24} height={24} className="me-2" />
                {t('site/title')}
            </a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto">
                    {NAV_ITEMS.map(({ anchor, key }) => (
                        <li className="nav-item" key={anchor}>
                            <a className="nav-link" href={`/${locale}/#${anchor}`}>
                                {t(key)}
                            </a>
                        </li>
                    ))}
                </ul>
                <ul className="navbar-nav">
                    <li className="nav-item dropdown">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            id="languageDropdown"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <i className="bi bi-translate" /> {t('site/language')}
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
                            <li><a className="dropdown-item" href={alternates.en}>English</a></li>
                            <li><a className="dropdown-item" href={alternates.zh}>简体中文</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
);
