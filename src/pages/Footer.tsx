import { t } from '~/helpers/i18n';
import type { Locale } from '~/data/site';

interface FooterProps {
    locale: Locale;
    alternates: Record<Locale, string>;
}

export const Footer = ({ locale, alternates }: FooterProps) => (
    <footer className="footer mt-auto py-4 bg-light">
        <div className="container">
            <div className="row">
                <div className="col-md-4 mb-3 mb-md-0">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">{t('footer/site')}</h6>
                    <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0 flex-md-column gap-md-1">
                        <li>
                            <a href={`/${locale}/`} className="text-decoration-none text-muted">{t('footer/home')}</a>
                        </li>
                        <li>
                            <a href={`/${locale}/about/`} className="text-decoration-none text-muted">{t('about/name')}</a>
                        </li>
                        <li>
                            <a
                                href="https://blog.feather-tools.com"
                                target="_blank"
                                rel="noopener"
                                className="text-decoration-none text-muted"
                            >
                                {t('footer/blog')}
                            </a>
                        </li>
                        <li>
                            <a href={`/${locale}/privacy/`} className="text-decoration-none text-muted">{t('privacy/name')}</a>
                        </li>
                        <li>
                            <a href={`/${locale}/terms/`} className="text-decoration-none text-muted">{t('terms/name')}</a>
                        </li>
                    </ul>
                </div>
                <div className="col-md-4 mb-3 mb-md-0">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">{t('footer/extensions')}</h6>
                    <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0 flex-md-column gap-md-1">
                        <li>
                            <a
                                href="https://habitica.com"
                                target="_blank"
                                rel="noopener"
                                className="text-decoration-none text-muted d-inline-flex align-items-center"
                            >
                                <img src="/static/extensions/habitica/habitica-icon.svg" alt="Habitica" width={16} height={16} className="me-1" />
                                {' '}Habitica
                            </a>
                        </li>
                        <li>
                            <a
                                href="https://www.minecraft.net"
                                target="_blank"
                                rel="noopener"
                                className="text-decoration-none text-muted d-inline-flex align-items-center"
                            >
                                <img src="/static/extensions/minecraft/minecraft-icon.svg" alt="Minecraft" width={16} height={16} className="me-1" />
                                {' '}Minecraft
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="col-md-4">
                    <h6 className="text-muted text-uppercase small fw-bold mb-2">{t('site/language')}</h6>
                    <ul className="list-unstyled d-flex flex-wrap gap-3 mb-0 flex-md-column gap-md-1">
                        <li>
                            <a href={alternates.en} className="text-decoration-none text-muted">English</a>
                        </li>
                        <li>
                            <a href={alternates.zh} className="text-decoration-none text-muted">简体中文</a>
                        </li>
                    </ul>
                </div>
            </div>
            <hr className="my-3" />
            <div className="text-center">
                <span className="text-muted">© 2025-2026 {t('site/title')}. {t('site/all_rights_reserved')}</span>
            </div>
        </div>
    </footer>
);
