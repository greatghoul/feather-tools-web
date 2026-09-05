import { initMessages } from '~/helpers/i18n';
import { mountApp } from '~/helpers/mount';
import commonMessages from '~/i18n/client/en.json';
import toolMessages from '../i18n/en.json';
import App from '../App';

window.LOCALE = 'en';
initMessages({ ...commonMessages, ...toolMessages });
mountApp(<App />);
