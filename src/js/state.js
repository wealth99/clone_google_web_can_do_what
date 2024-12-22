import * as THREE from 'three';

class State {
    constructor() {
        this._canvas = document.querySelector('#three-canvas'),
        this._scene = null,
        this._camera = null,
        this._mouse = null,
        this._raycaster = null,
        this._renderer = null,
        this._dirLight = null,
        this._currentMeshWidth =  null,
        this._currentMeshHeight = null,
        this._scrollRatio = 0.0038,
        this._clickCount = 0,
        this._mouseMoved = null,
        this._isClicked = false,
        this._isNextClicked = false,
        this._isShowClicked = false,
        this._isSwitchClicked = true,
        this._enabledMesh = null,
        this._prevScrollY = null,
        this._newScrollY = null,
        this._clickStartX = null, 
        this._clickStartY = null, 
        this._clickStartTime = null,
        this._cardType = 'grid',
        this._bodyBgColors = [
            ['blue-mode', '#0073e6'],
            ['yellow-mode', '#ffbb25'],
            ['red-mode', '#e42616'],
            ['blue-mode-2', '#0073e6'],
            ['green-mode', '#1fb254'],
            ['red-mode', '#e42616']
        ],
        this._boxGeometry = null,
        this._cardMeshes = [],
        this._cardShadowMeshes = [],
        this._cardMeshesZindex = [],
        this._cardMeshesInitInfo = {
            'card-0': { 
                name: 'card-0',
                positions: {
                    0: new THREE.Vector3(-1.8, 0.8, 0),
                    1: new THREE.Vector3(-0.9, 0.8, 0),
                    2: new THREE.Vector3(-0.83, 0.8, 0),
                },
                imagePath: '/images/1_titlecard.png', 
                videoPath: null,
                texture: null,
                videoContext: null,
                videoElement: null
            },
            'card-1': { 
                name: 'card-1',
                positions: {
                    0: new THREE.Vector3(0, 0.8, 0),
                    1: new THREE.Vector3(0.9, 0.8, 0),
                    2: new THREE.Vector3(0.83, 0.8, 0),
                },
                imagePath: '/images/2.png',
                videoPath: '/videos/2.mp4',
                texture: null,
                videoContext: null,
                videoElement: null,
                animationFrame: null,
                renderVideoToCanvas() {
                    this.videoContext.drawImage(this.videoElement, 0, 250, 400, 400);
                    this.animationFrame = requestAnimationFrame(() => {
                        return this.renderVideoToCanvas();
                    });
                }
            },
            'card-2': { 
                name: 'card-2',
                positions: {
                    0: new THREE.Vector3(1.8, 0.8, 0),
                    1: new THREE.Vector3(-0.9, -1.87, 0),
                    2: new THREE.Vector3(-0.83, -1.75, 0),
                },
                imagePath: '/images/3.png', 
                videoPath: '/videos/3.mp4',
                texture: null,
                videoContext: null,
                videoElement: null,
                animationFrame: null,
                renderVideoToCanvas() {
                    this.videoContext.drawImage(this.videoElement, 0, 250, 400, 400);
                    this.animationFrame = requestAnimationFrame(() => {
                        return this.renderVideoToCanvas();
                    });
                }
            },
            'card-3': { 
                name: 'card-3',
                positions: {
                    0: new THREE.Vector3(-1.8, -1.9, 0),
                    1: new THREE.Vector3(0.9, -1.87, 0),
                    2: new THREE.Vector3(0.83, -1.75, 0),
                },
                imagePath: '/images/4.png',
                videoPath: '/videos/4.mp4',
                texture: null,
                videoContext: null,
                videoElement: null,
                animationFrame: null,
                renderVideoToCanvas() {
                    this.videoContext.drawImage(this.videoElement, 0, 250, 400, 400);
                    this.animationFrame = requestAnimationFrame(() => {
                        return this.renderVideoToCanvas();
                    });
                }
            },
            'card-4': { 
                name: 'card-4',
                positions: {
                    0: new THREE.Vector3(0, -1.9, 0),
                    1: new THREE.Vector3(-0.9, -4.55, 0),
                    2: new THREE.Vector3(-0.83, -4.3, 0),
                },
                imagePath: '/images/5.png',
                videoPath: '/videos/5.mp4',
                texture: null,
                videoContext: null,
                videoElement: null,
                animationFrame: null,
                renderVideoToCanvas() { 
                    this.videoContext.drawImage(this.videoElement, 0, 250, 400, 400);
                    this.animationFrame = requestAnimationFrame(() => {
                        return this.renderVideoToCanvas();
                    });
                }
            },
            'card-5': { 
                name: 'card-5',
                positions: {
                    0: new THREE.Vector3(1.8, -1.9, 0),
                    1: new THREE.Vector3(0.9, -4.55, 0),
                    2: new THREE.Vector3(0.83, -4.3, 0),
                },
                imagePath: '/images/6.png',
                videoPath: '/videos/6.mp4',
                texture: null,
                videoContext: null,
                videoElement: null,
                animationFrame: null,
                renderVideoToCanvas() {
                    this.videoContext.drawImage(this.videoElement, 0, 250, 400, 400);
                    this.animationFrame = requestAnimationFrame(() => {
                        return this.renderVideoToCanvas();
                    });
                }
            }
        }
    }

    getState(...keys) {
        if (keys.length === 1) {
            return this[keys[0]];
        }
        
        return keys.reduce((acc, key) => {
            const cleanedKey = key.startsWith('_') ? key.slice(1) : key;
            acc[cleanedKey] = this[key];
            return acc;
        }, {});
    }

    setState(key, value) {
        this[key] = value;
    }
}

const appState = new State();
export default appState;