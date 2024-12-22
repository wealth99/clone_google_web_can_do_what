import appState from '../state';

export default function handleWindowScroll() {
    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const { camera, canvas, scrollRatio } = getState('_camera', '_canvas', '_scrollRatio');
    
    const pageIntroInner = document.querySelector('.page-intro .inner');
    const isPageOpen = document.body.classList.contains('page-open');
    const { y: rectY } = pageIntroInner.getBoundingClientRect();

    if (rectY >= 0) {
        setState('_newScrollY', window.scrollY * scrollRatio);
        camera.position.y =- getState('_newScrollY');
    }

    if (isPageOpen && rectY >= -150) {
        canvas.style.display = 'block';
    } else if (isPageOpen) {
        canvas.style.display = 'none';
    }
}