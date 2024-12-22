import appState from '../state';
import getPixelSizeFromMesh from './getPixelSizeFromMesh';

export default function updateScrollSpacer() {
    const getState = appState.getState.bind(appState);
    const scrollSpacer = document.querySelector('.cards-gallery-scroll-spacer');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const headerHeight = parseInt(window.getComputedStyle(header).height, 10);
    const footerHeight = parseInt(window.getComputedStyle(footer).height, 10);
    const { cardMeshes ,camera, renderer } = getState('_cardMeshes', '_camera', '_camera');
    const { pixelSizeWidth, pixelSizeHeight } = getPixelSizeFromMesh(cardMeshes[0], camera, renderer);
    const size = window.innerWidth >= 768 ? 2 : 3;
    const spacer = pixelSizeHeight * size + headerHeight + footerHeight + 50;

    if (window.innerHeight < spacer + headerHeight * 1.1) {
        scrollSpacer.style.height = `${spacer}px`;
    } else {
        scrollSpacer.style.height = `${window.innerHeight - headerHeight}px`;
    }
}