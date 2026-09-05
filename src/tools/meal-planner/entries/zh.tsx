import { initMessages } from '~/helpers/i18n';
import { mountApp } from '~/helpers/mount';
import commonMessages from '~/i18n/client/zh.json';
import toolMessages from '../i18n/zh.json';
import App from '../App';

window.LOCALE = 'zh';
initMessages({ ...commonMessages, ...toolMessages });
mountApp(<App />);
