import appState from '../state';

export default function updateFooterLocation(isOpen) {
    const getState = appState.getState.bind(appState);
    const footer = document.querySelector('footer');
    const cardType = getState('_cardType');
    const isGrid = cardType === 'grid';

    if (isOpen) {
        footer.style.opacity = 0;

        setTimeout(() => {
            footer.style.opacity = 1;
            footer.style.position = 'absolute';
            footer.style.top = `${document.body.clientHeight}px`;
        }, 1300);
    } else {
        footer.style.opacity = '';
        footer.style.position = isGrid ? '' : 'fixed';
        footer.style.top = isGrid ? '' : 'auto';
        footer.style.bottom = isGrid ? '' : 0;
        footer.style.left = isGrid ? '' : 0;
    }
}