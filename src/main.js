import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap, ScrollToPlugin } from 'gsap/all';
import * as utils from './js/utils';
import appState from './js/state';

gsap.registerPlugin(ScrollToPlugin);

window.info = null;

export default function main() {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    const scrollSpacer = document.querySelector('.cards-gallery-scroll-spacer');
    const closeButton = document.querySelector('.close-button');
    const votingButtons = document.querySelector('.voting-buttons');
    const switchModeButton = document.querySelector('.switch-mode-button');
    const nextButton = document.querySelector('.next-button');
    const showButton = document.querySelector('.show-button');
    const pageSplash = document.querySelector('.page-splash');
    const splashInner = document.querySelector('.page-splash .inner');
    const cardsGallery = document.querySelector('.cards-gallery');
    const pageIntro = document.querySelector('.page-intro');
    const pageIntroInner = document.querySelector('.page-intro .inner');
    const switchCircles = document.querySelectorAll('.switch-circle');
    const hoverBg = document.querySelectorAll('.hover-wraaper .hover-bg');
    const hoverBg2 = document.querySelectorAll('.hover-wraaper .hover-bg-2');

    const getState = appState.getState.bind(appState);
    const setState = appState.setState.bind(appState);
    const bodyBgColors = getState('_bodyBgColors');
    const {
        calcPixelSizeFromMesh,
        calculateMeshScaleByPixels,
        roundedBoxGeometry,
        getMeshScreenPosition,
        getMeshWorldYAtClientY,
    } = utils;
    const cardMeshes = [];
    const cardMeshesZindex = [];
    const cardMeshesInitInfo = {
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
    const cardShadowMeshes = [];
    const initMeshWidth = 283.7477061776989; // 1920xx958 기준 mesh width p
    const initMeshHeight = 453.99634792451155; // 1920xx958 기준 mesh height px
    const initScreenY = 327.6678900385606; // 1920xx958 기준 ndc 좌표계
    const initPositinY = -1.062; // 1920xx958 기준 mesh position y
    const initScale = 1.4; // 1920xx958 기준 mesh scale
    const devicePixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    let clickStartX, clickStartY, clickStartTime;
    let currentScreenY = null;

    const canvas = document.querySelector('#three-canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // 씬
    const scene = new THREE.Scene();

    // 카메라
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight, 
        0.1,
        1000
    );
    camera.position.z = 3.3;
    scene.add(camera);

    // 레이캐스터
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 빛
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('white', 2);
    dirLight.position.set(-1, 3, 3);
    dirLight.target.position.set(0, 0, 0);
    dirLight.target.updateMatrixWorld();
    scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 75;
    dirLight.shadow.radius = 8;
    dirLight.shadow.top = 5;
    dirLight.shadow.right = 5;
    dirLight.shadow.bottom = -5;
    dirLight.shadow.left = -5;
    dirLight.shadow.bias = -0.001; // 그림자 경계의 어긋남 방지
    dirLight.shadow.normalBias = 0.001; // 표면의 미세한 디테일 고려

    // 바닥 메쉬
    const floorShadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10), 
        new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    floorShadowMesh.position.z = -0.05;
    floorShadowMesh.receiveShadow = true;
    scene.add(floorShadowMesh);

    const getCardMeshPosition = info => {
        const wW = window.innerWidth;

        // 769 ~ 1380
        if (wW >= 769) {
            return info.positions[0];
        }

        // 640 ~ 768
        if (640 <= wW && 768 >= wW) {
            return info.positions[1];
        }

        // 0 ~ 640
        if (wW <= 640) {
            return info.positions[2];
        }
    }

    // 이미지 로딩 
    const loadImage = (context, path) => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = path;
            img.onload = () => {
                const height = (400 / img.width) * img.height;
                context.drawImage(img, 0, 0, 400, height);
                
                resolve();
            };
        });
    }

    // 비디오 로딩
    const loadVideo = (context, path) => {
        return new Promise(resolve => {
            const video = document.createElement('video');
            const handleCanPlayThrough = () => {
                video.play();

                context.drawImage(video, 0, 250, 400, 400);
                
                video.removeEventListener('canplaythrough', handleCanPlayThrough);
                resolve({ context, video });
            }

            video.src = path;
            video.loop = true;
            video.muted = true;
            video.autoplay = true;
            video.crossOrigin = 'anonymous';

            // 비디오가 준비되면 캔버스에 비디오 그리기 시작
            video.addEventListener('canplaythrough', handleCanPlayThrough);
        });
    }

    // 캔버스 텍스쳐 만들기
    const createCanvasTexture = async (imagePath, videoPath) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { alpha: false });
        let videoContext;
        let videoElement;

        canvas.width = 400;
        canvas.height = 650;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await loadImage(context, imagePath);

        if (videoPath) {
            await loadVideo(context, videoPath).then(result => {
                videoContext = result.context;
                videoElement = result.video;
            });
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        return { texture, videoContext, videoElement }
    }

    const boxGeometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.15, 15);
    boxGeometry.center();
    boxGeometry.computeVertexNormals();
    const boxMaterial = new THREE.MeshBasicMaterial( { color: '#ebebeb', side: THREE.DoubleSide } );

    // 카드 메쉬 픽셀 사이즈 업데이트
    const updateStyleVariablesCardSize = cardMesh => {
        const { pixelSizeWidth, pixelSizeHeight } = calcPixelSizeFromMesh(cardMesh, camera, renderer);
        const currentMeshWidth = getState('_currentMeshWidth');
        const currentMeshHeight = getState('_currentMeshHeight');

        if (!currentMeshWidth && !currentMeshHeight) {
            setState('_currentMeshWidth', pixelSizeWidth);
            setState('_currentMeshHeight', pixelSizeHeight);
        }

        document.documentElement.style.setProperty('--cardPixelWidth', `${pixelSizeWidth}px`);
        document.documentElement.style.setProperty('--cardPixelHeight', `${pixelSizeHeight}px`);
    }

    // 카드 메쉬 만들기
    const createCardMesh = async (meshInfo, index) => {
        const { name, imagePath, videoPath } = meshInfo;
        const position = getCardMeshPosition(meshInfo);
        const { texture, videoContext, videoElement } = await createCanvasTexture(imagePath, videoPath);
        const cardMesh = new THREE.Mesh(
            boxGeometry, [
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }), 
                boxMaterial,
                boxMaterial,
            ]
        );

        cardMesh.position.copy(position);
        cardMesh.name = name;
        cardMesh.rotation.reorder('YXZ');
        cardMesh.scale.z = 0.1;
        cardMesh.castShadow = true;
        cardMesh.receiveShadow = true;
        cardMeshes.push(cardMesh);
        scene.add(cardMesh);
 
        if (videoPath) {
            cardMeshesInitInfo[`card-${index}`].texture = texture;
            cardMeshesInitInfo[`card-${index}`].videoContext = videoContext;
            cardMeshesInitInfo[`card-${index}`].videoElement = videoElement;
        }

        if (cardMesh.name === 'card-0' && currentScreenY === null) {
            updateStyleVariablesCardSize(cardMesh);
            updateScrollSpacer();   
            currentScreenY = getMeshScreenPosition(cardMesh, camera, renderer).y;

            console.log('currentScreenY: ', currentScreenY);
        }
    }

    // 카드 그림자 메쉬 만들기
    const createShadowCardMesh = (mesh, rotationZ) => {
        const position = mesh.position.clone();
        const rotation = mesh.rotation.clone();
        const scale = mesh.scale.clone();
        const shadowMaterial = new THREE.ShadowMaterial({ 
            opacity: 0.15, 
            transparent: true, 
            side: THREE.DoubleSide 
        });
    
        const shadowMesh = new THREE.Mesh(boxGeometry, shadowMaterial);
        shadowMesh.position.copy(position);
        shadowMesh.rotation.set(rotation.x, rotation.y, rotationZ);
        shadowMesh.scale.copy(scale);
        shadowMesh.receiveShadow = true;
        shadowMesh.castShadow = true;
    
        scene.add(shadowMesh);
        cardShadowMeshes.push(shadowMesh);
    }

    Object.values(cardMeshesInitInfo).forEach(createCardMesh);

    const animate = () => {
        const isShowClicked = getState('_isShowClicked');
        const cardType = getState('_cardType');

        requestAnimationFrame(animate);

        if (
            cardType === 'stack' 
            && !isShowClicked 
            && document.querySelector('.cards-gallery').classList.contains('stack-mode')
        ) {
            const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

            sortedCardMeshes.forEach((v, i) => {
                const name = v.name;
                const info = cardMeshesInitInfo[name];

                if (i > 2 && info.texture !== null) {
                    info.texture.needsUpdate = false;
                } else if (info.texture !== null) {
                    info.texture.needsUpdate = true;
                }
            });
        }

        renderer.render(scene, camera);
    }

    window.setInfo = function() {
        const enabledMesh = getState('enabledMesh');

        window.firstObject = enabledMesh;

        const { scaleX, scaleY } = calculateMeshScaleByPixels(enabledMesh, 1190, 1904, camera); // 오차범위 10픽셀?... 1200x1920
        enabledMesh.scale.set(scaleX, scaleY);
        
        const moveY = getMeshWorldYAtClientY(enabledMesh, camera, renderer);
        enabledMesh.position.y = moveY;

        setTimeout(() => {
            console.log('calcPixelSizeFromMesh: ', calcPixelSizeFromMesh(enabledMesh, camera, renderer))
            console.log('getMeshScreenPosition: ', getMeshScreenPosition(enabledMesh, camera, renderer));
        }, 500)
    }

    const updateMeshSize = () => {
        // const isPageOpen = document.body.classList.contains('page-open');
        const wW = window.innerWidth;
        const maxWidth = (() => {
            let result;

            // 769 ~
            if (wW >= 769) {
                result = 1380;
            }
    
            // 640 ~ 768
            if (640 <= wW && 768 >= wW) {
                result = 940;
            }

            // 0 ~ 639
            if (wW <= 639) {
                result = 840;
            }

            return result;
        })();

        // if(isPageOpen) return;

        // if (window.innerWidth < maxWidth) {
        //     const scaleFactor = window.innerWidth / maxWidth;
        //     const yAxis = 1 - 1 * scaleFactor;
            
        //     console.log('yAxis: ', yAxis);
        //     console.log('scaleFactor:' ,scaleFactor);

        //     cardMeshes.forEach(v => {
        //         const initPosition = getCardMeshPosition(cardMeshesInitInfo[v.name]);

        //         v.scale.set(scaleFactor, scaleFactor);
        //         v.position.set(initPosition.x * scaleFactor, yAxis + initPosition.y * scaleFactor);
        //     });
        // } else {
        //     cardMeshes.forEach(v => {
        //         const initPosition = getCardMeshPosition(cardMeshesInitInfo[v.name]);

        //         v.scale.set(1, 1);
        //         v.position.set(initPosition.x, initPosition.y);
        //     });
        // }
    }

    // 윈도우 리사이즈 핸들러
    const handleWindowResize = () => {
        updateMeshSize();
        updateScrollSpacer();
        updateStyleVariablesCardSize(cardMeshes[0]);

        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

    // 윈도우 스크롤 핸들러
    // 스크롤 위치값에 맞춰 camera 위치 값 업데이트
    const handleWindowScroll = () => {
        const isPageOpen = document.body.classList.contains('page-open');
        const { y: rectY } = pageIntroInner.getBoundingClientRect();
        const scrollRatio = getState('_scrollRatio');

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

    // document 클릭 핸들러
    const handleDocumentClick = event => {
        event.preventDefault();
        event.stopPropagation();

        const mouseMoved = getState('_mouseMoved');
        const isClicked = getState('_isClicked');
        const isSwitchClicked = getState('_isSwitchClicked');
        const cardType = getState('_cardType');

        if (mouseMoved || isClicked || cardType === 'stack' || isSwitchClicked) return;

        mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;

        if (isIntersect) {
            const object = intersects[0].object;

            setState('_isClicked', true);
            setState('_prevScrollY', window.scrollY);

            if (window.scrollY > 0 && cardType === 'grid') {
                gsap.to(window, { 
                    duration: 0.4,
                    scrollTo: { y: 0 },
                    ease: 'power2.out', 
                    onComplete() {
                        animateCardMesh(object);
                    }
                });
            } else {
                animateCardMesh(object);
            }
        }
    }

    // 카드 메쉬 애니메이션
    const animateCardMesh = object =>  {
        const { x, y, z } = object.position;
        const { scaleX, scaleY } = calculateMeshScaleByPixels(object, 1190, 1904, camera); // 오차범위 10픽셀?... 1200x1920
        const newPositionY = getMeshWorldYAtClientY(object, camera, renderer);
        const cardType = getState('_cardType');

        document.body.classList.add('page-open');
        document.body.style.cursor = '';
        document.body.style.overflow = 'hidden';
        updateFooterStyle(true);
        animateShowBg();
        setState('enabledMesh', object);

        if (cardType === 'stack') {
            const excludeFirstMeshes = cardMeshes
                .sort((a, b) => b.position.z - a.position.z)
                .filter((v, i) => i !== 0);

            excludeFirstMeshes.forEach(v => {
                gsap.to(v.rotation, {
                    duration: 0.5,
                    x: 0,
                    y: 0,
                    z: 0,
                    delay: .1,
                    ease: 'power1.out',
                });
            });

            gsap.to(object.position, {
                duration: 0.8,
                x: 0,
                y: newPositionY,
                z: 3,
                ease: 'sine.out',
            });
        }
        
        if (cardType === 'grid') {
            if (object.name === 'card-2' || object.name === 'card-5') {
                gsap.to(object.position, {
                    duration: 0.8,
                    x: 0,
                    y: newPositionY,
                    z: 3,
                    ease: 'sine.out'
                });
            } else {
                gsap.to(object.position, {
                    duration: 1,
                    keyframes: {
                        '0%':   { x, y, z, },
                        '50%':  { x: 1, y: 0, z: 1.5 },
                        '100%': { x: 0, y: newPositionY, z: 3 },
                        easeEach: 'sine.out' 
                    },
                    ease: 'sine.out',
                });
            }
        }

        gsap.to(object.scale, { 
            duration: 1, 
            x: scaleX,
            y: scaleY,
            ease: 'power1.out',
        });

        gsap.to(object.rotation, {
            duration: 0.2,
            z: 0,
            ease: 'power1.out',
            overwrite: true,
        })

        gsap.to(object.rotation, { 
            duration: 1, 
            y: Math.PI,
            ease: 'power1.out',
            onUpdate() {
                const progress = this.progress();
                if (progress > 0.3 && !this.called) {
                    this.called = true;
                
                    object.geometry.dispose();
                    object.geometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.1, 9);
                    object.geometry.computeVertexNormals();
                } 
            }
        });

        gsap.to(camera.position, { 
            duration: 1, 
            y: 0, 
            z: 4.1,
            ease: 'power1.out', 
            onComplete() {
                window.scrollTo(0, 0);
                document.body.style.overflow = '';

                gsap.to(pageIntro, {
                    duration: 0,
                    opacity: 0.5,
                    display: 'block'
                });

                // gsap.to(canvas, {
                //     duration: 0,
                //     opacity: 0,
                //     display: 'none'
                // });
            }
        });
    }

    // 카드 메쉬 호버 애니메이션
    const animateCardMeshHover = (object = null) => {
        const cardType = getState('_cardType');

        document.body.style.cursor = object ? 'pointer' : '';

        if (cardType === 'grid') {
            cardMeshes.forEach(v => {
                const position = object === v ? 0.1 : 0;
    
                gsap.to(v.position, { 
                    duration: 0.5,
                    z: position, 
                    ease: 'power1.out'
                });
            });
        }
    }

    // document 마우스무브 핸들러
    const handleDocumentMousemove = e => {
        const isClicked = getState('_isClicked');
        const cardType = getState('_cardType');

        if (isClicked || cardType === 'stack') return;

        mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;    

        if (isIntersect) {
            animateCardMeshHover(intersects[0].object);
        } else {
            animateCardMeshHover();
        }
    }

    // document 마우스다운 핸들러
    const handleDocumentMousedown = event => {
        clickStartX = event.clientX;
        clickStartY = event.clientY;
        clickStartTime = Date.now();
    }

    // documnet 마우스업 핸들러
    const handleDocumentMouseup = event => {
        const xDiff = Math.abs(event.clientX - clickStartX);
        const yDiff = Math.abs(event.clientY - clickStartY);
        const timeDiff = Date.now() - clickStartTime;

        if (xDiff > 5 || yDiff > 5 || timeDiff > 500) {
            setState('_mouseMoved', true);
        } else {
            setState('_mouseMoved', false);
        }
    }

    // 메쉬 리셋 애니메이션
    const animateResetMesh = (mesh, position) => {
        const { x, y, z } = position;
        const cardType = getState('_cardType');
        const prevScrollY = getState('_prevScrollY')
        
        gsap.to(pageIntro, { duration: 0, opacity: 0, display: 'none' });
        gsap.to(canvas, { duration: 0, opacity: 1, display: 'block' });
        
        if (cardType === 'stack') {
            const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

            dirLight.position.set(-1, 3, 3);
            dirLight.updateMatrixWorld();

            gsap.to(mesh.scale, { 
                duration: 1, 
                x: 1.3,
                y: 1.3,
                ease: 'power1.out'
            });

            for (let i = 0; i < sortedCardMeshes.length; i++) {
                const cardMesh = sortedCardMeshes[i];
                const angle = - Math.PI / 25 * i;

                gsap.to(cardMesh.rotation, {
                    duration: 0.3,
                    z: angle,
                    delay: 0.3,
                    ease: 'power1.out'
                });

                if (i === 2) break;
            }
        } 

        if (cardType === 'grid') {
            gsap.to(mesh.scale, {
                duration: 1, 
                x: 1,
                y: 1, 
                ease: 'power1.out' 
            });
        }
 
        gsap.to(hoverBg2, {
            duration: .8,
            scaleX: 0,
            scaleY: 1.15,
            ease: 'power1.out'
        });

        gsap.to(mesh.rotation, {
            duration: 1, 
            y: 0, 
            ease: 'power1.out' 
        });

        gsap.to(mesh.position, { 
            duration: 1,
            x, y, z, 
            ease: 'power1.out',
            onUpdate() {
                const progress = this.progress();
                if (progress > 0.3 && !this.called) {
                    this.called = true;
                
                    mesh.geometry.dispose();
                    mesh.geometry = roundedBoxGeometry(1.5, 2.4, 0.2, 0.15, 15)
                    mesh.geometry.computeVertexNormals();
                } 
            }
        });

        gsap.to(window, {
            duration: 1,
            scrollTo: { y: prevScrollY },
            delay: 0.3, 
            ease: 'power2.out'
        })

        gsap.to(camera.position, { 
            duration: 1, 
            z: 3.3, 
            delay: 0.3, 
            ease: 'power2.out', 
            onComplete() {
                document.body.classList.remove('page-open');
                setState('_isClicked', false);
                setState('_isShowClicked', false);
                updateFooterStyle(false);
            }
        });
    }

    // 닫기 버튼 클릭 핸들러
    const handleCloseButton = () => {
        const enabledMesh = getState('enabledMesh');
        const meshName = enabledMesh.name;
        const cardType = getState('_cardType');
        let position;
        
        if (cardType === 'grid') {
            position = getCardMeshPosition(cardMeshesInitInfo[meshName]);
        } else {
            position = new THREE.Vector3(0, 0, 0);
        }

        if (window.scrollY > 0) {
            gsap.to(window, { 
                duration: 0.5,
                scrollTo: { y: 0 },
                ease: 'sine.out', 
                onComplete() {
                    animateResetMesh(enabledMesh, position);
                }
            });
        } else {
            animateResetMesh(enabledMesh, position);
        }
    }

    // voting 버튼 클릭 핸들러
    const handleVotingButton = event => {
        const target = event.target;
        const parent = target.closest('button');
        const classList = parent?.classList;
        const container = parent?.closest('.voting');
        
        container?.classList.remove('voted-up', 'voted-down');
        
        if (classList.contains('button-vote-up')) {
            container.classList.add('voted-up');
        }

        if (classList.contains('button-vote-down')) {
            container.classList.add('voted-down');
        }
    }

    // 로딩 스플래쉬 애니메이션
    const animateSplash = () => {
        const tl = gsap.timeline();

        tl.to(splashInner, { 
                duration: 0.5,
                rotation: -45,
                delay: .6,
                ease: 'power3.out' 
            })
        .to(splashInner, { 
                duration: 0.5,
                rotation: 90,
                opacity: 0,
                scale: 0.5, 
                ease: 'power3.out', 
                onComplete() {
                    animateCircle(true);
                    animateCardMeshSort('grid', true);

                    gsap.to(pageSplash, {
                        duration: 0,
                        display: 'none' 
                    });
                }
            }
        );
    }

    // 스위치 버튼 애니메이션
    const animateCircle = isActive => {
        if (isActive) {
            cardsGallery.classList.remove('stack-mode', 'grid-mode');
            cardsGallery.classList.add('grid-mode');
            
            gsap.fromTo(switchCircles,
                { scale: 0.12 },
                {
                    duration: 0.8,
                    scale: 14,
                    ease: 'cubic-bezier(0.475, 0.175, 0.515, 0.805)', 
                    stagger: { each: 0.08, from: 'start' },
                }
            );
        } else {
            gsap.fromTo(switchCircles,
                { scale: 14 },
                {
                    duration: 0.5,
                    scale: 0.12,
                    ease: 'cubic-bezier(0.185, 0.390, 0.745, 0.535)', 
                    stagger: { each: 0.08, from: 'end' },
                });
        }
    }

    // 카드 메쉬 그리드 / 스택 정렬 애니메이션
    const animateCardMeshSort = (type, isLoading = false) => {
        const sortedCardMeshes = cardMeshes.sort((a, b) => a.name.localeCompare(b.name));
        const effect = {
            position(target, x, y, z, duration = 0.5) {
                gsap.fromTo(target, 
                    { x: 0, y: 0, z: 0 }, 
                    { duration, x, y, z, ease: 'power1.out', overwrite: true }
                )
            },
            position2(taregt, x, y, z, ease, overwrite = false, duration = 0.5) {
                return gsap.to(taregt, { duration, x, y, z, ease, overwrite });
            },
            rotate(target, z, duration = 0.3) {
                gsap.to(target, { duration, z, ease: 'power3.out' });
            },
            scale(target, x, y, delay, ease, overwrite = false, duration = 0.6) {
                return gsap.to(target, { duration, x, y, delay, ease, overwrite });
            }
        }
        dirLight.position.set(-1, 3, 3);
        dirLight.updateMatrixWorld();

        const gridEffect = (cardMesh, { x, y, z }, index) => {
            if (isLoading) {
                effect.position(cardMesh.position, x, y, z);
            }

            if (!isLoading) {
                updateFooterStyle(true);
            }

            if (cardShadowMeshes.length > 0) {
                cardShadowMeshes.forEach(v => {
                    gsap.to(v.material, {
                        duration: 0,
                        opacity: 0
                    });
                });
            }

            effect.rotate(cardMesh.rotation, 0);
            effect.scale(cardMesh.scale, 1, 1, 0.1, 'back.in(2)', true)
                .eventCallback('onUpdate', function() {
                    const progress = this.progress();
                    
                    if (progress > 0.9 && !this.called) {
                        this.called = true;

                        if (!isLoading) animateCircle(true);

                        effect.position2(cardMesh.position, x, y, z, 'sine.out', true)
                            .eventCallback('onComplete', function() {
                                if (index === 5) {
                                    setState('_isSwitchClicked', false);
                                    updateScrollSpacer();
                                    updateFooterStyle(false);
                                }
                            });
                    }
                });

            sortedCardMeshes.forEach(v => {
                const name = v.name;
                const info = cardMeshesInitInfo[name];

                if (info.texture !== null) {
                    cancelAnimationFrame(info.animationFrame);
                    info.texture.needsUpdate = false;
                }
            });
        }

        const stackEffect = (cardMesh, index) => {
            const zIndex = -index / 40;

            if (cardMeshesZindex.length <= 5) {
                cardMeshesZindex.push(zIndex);
            }

            if (cardShadowMeshes.length > 0) {
                cardShadowMeshes.forEach(v => {
                    gsap.to(v.material, {
                        duration: 0,
                        opacity: 0.15,
                    });
                });
            }

            animateCircle(false);
            effect.position2(cardMesh.position, 0, 0, zIndex, 'power2.inOut')
                .eventCallback('onUpdate', function() {
                    const progress = this.progress();

                    if (progress > 0.7 && !this.called) {
                        this.called = true;
                        
                        effect.scale(cardMesh.scale, '+=0.3', '+=0.3', 0, 'back.out(3)')
                            .eventCallback('onComplete', function() {
                                if (index === 5) {
                                    sortedCardMeshes.forEach((v, i) => {
                                        const z = -Math.PI / 25 * i;

                                        if (i < 3) {
                                            effect.rotate(v.rotation, z);
                                        }

                                        if (i !== 0 && cardShadowMeshes.length < 2) {
                                            createShadowCardMesh(v, z);
                                        }
                                    });
                                    
                                    setState('_isSwitchClicked', false);
                                    scrollSpacer.style.height = '';
                                    cardsGallery.classList.remove('stack-mode', 'grid-mode');
                                    cardsGallery.classList.add('stack-mode');
                                    updateFooterStyle(false);
                                    Object.values(cardMeshesInitInfo)[1].renderVideoToCanvas();
                                }
                            });
                    }
                })
                .eventCallback('onComplete', function() {
                    setTimeout(() => {
                        updateStyleVariablesCardSize(cardMeshes[0]);
                    }, 500);
                });
        }

        sortedCardMeshes.forEach((v ,i) => {
            const { x, y, z } = getCardMeshPosition(cardMeshesInitInfo[v.name]);

            if (type === 'grid') {
                gridEffect(v, { x, y, z }, i);
            }

            if (type === 'stack') {
                stackEffect(v, i);
            }
        });
    }

    // 스위치 버튼 클릭 핸들러
    const handleSwitchButton = event => {
        event.preventDefault();
        event.stopPropagation();
        
        const isSwitchClicked = getState('_isSwitchClicked');
        const cardType = getState('_cardType');

        if (isSwitchClicked) return;

        const target = event.currentTarget;
        const hasStackActive = target.classList.contains('stack-active');
        const hasGridActive = target.classList.contains('grid-active');
        const action = () => {
            target.classList.remove('stack-active', 'grid-active');
            document.body.style.cursor = '';

            if (hasStackActive) {
                setState('_cardType', 'grid');
                target.classList.add('grid-active');
                animateCardMeshSort('grid');
            }

            if (hasGridActive) {
                setState('_cardType', 'stack');
                target.classList.add('stack-active');
                animateCardMeshSort('stack');
            }
        }

        setState('_isSwitchClicked', true);
        setState('_prevScrollY', 0);

        if (window.scrollY > 0 && cardType === 'grid') {
            gsap.to(window, { 
                duration: 0.4,
                scrollTo: { y: 0 },
                ease: 'power2.out', 
                onComplete() {
                    action();
                }
            });
        } else {
            action();
        }
    }

    // 호버 래퍼 애니메이션
    const animatHoverWrapper = (element, eventType) => {
        const hasNextButton = element.classList.contains('next-button');
        const hasShowButton = element.classList.contains('show-button');
        const firstMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];
        const effect = {
            position(target, x, z, duration = 0.6) {
                gsap.to(target.position, { duration, x, z, ease: 'power1.out'})
            },
            rotate(target, y, z, duration = 0.6) {
                gsap.to(target.rotation, { duration, y, z, ease: 'power1.out'});
            },
            background(target, scaleX, scaleY = 1.15, duration = 0.6) {
                gsap.to(target, { duration, scaleX, scaleY, ease: 'power1.out' });
            }
        }
        let targetHover;

        if (eventType === 'mouseenter') {
            if (hasNextButton) {
                dirLight.position.set(-1, 3, 3);
                effect.position(firstMesh, -1.2, 0.4);
                effect.rotate(firstMesh, -Math.PI / 5, Math.PI / 20);

                targetHover = document.querySelector('.next-card .hover-bg');
            } 

            if (hasShowButton) {
                dirLight.position.set(1, 3, 3);
                effect.position(firstMesh, 1.2, 0.4);
                effect.rotate(firstMesh, Math.PI / 5, -Math.PI / 20);

                targetHover = document.querySelector('.show-me .hover-bg-2');
            }
            
            effect.background(targetHover, 0.6);
        }

        if (eventType === 'mouseleave') {
            if (hasNextButton) {
                targetHover = document.querySelector('.next-card .hover-bg');
            }

            if (hasShowButton) {
                targetHover = document.querySelector('.show-me .hover-bg-2');

                setTimeout(() => {
                    dirLight.position.set(-1, 3, 3);
                }, 550);
            }
            
            effect.position(firstMesh, 0, 0);
            effect.rotate(firstMesh, 0, 0);
            effect.background(targetHover, 0);
        }
    }

    // 호버 래퍼 마우스 액션 핸들러
    const handleHoverWrapperAction = event => {
        const isNextClicked = getState('_isNextClicked');
        const isShowClicked = getState('_isShowClicked');
        const cardType = getState('_cardType');

        if (cardType === 'grid' || isShowClicked || isNextClicked) return;
        
        const eventType = event.type;
        const element = event.currentTarget;

        animatHoverWrapper(element, eventType);
    }

    // 다음 버튼 애니메이션
    const animateNextCard = () => {
        const firstCardMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];
        const excludeFirstMeshes = cardMeshes
            .sort((a, b) => b.position.z - a.position.z)
            .filter((v, i) => v !== firstCardMesh);
        const isShowClicked = getState('_isShowClicked');
        const cardType = getState('_cardType');

        excludeFirstMeshes.forEach((v, i) => {
            const cardMesh = v;
            const angle = - Math.PI / 25 * i;

            if (i < 3) {
                gsap.to(cardMesh.rotation, {
                    duration: 0.3, 
                    z: angle,
                    ease: 'power2.out',
                    delay: .5
                });
            }

            gsap.to(cardMesh.scale, {
                duration: 0.4,
                x: '+=.05',
                y: '+=.05',
                ease: 'power1.out'
            });

            gsap.to(cardMesh.scale, {
                duration: 0.8,
                x: 1.3,
                y: 1.3,
                ease: 'elastic.out(7, 0.6)',
                delay: 0.4
            });

            gsap.to(cardMesh.position, {
                duration: 0.5,
                z: cardMeshesZindex[i],
                ease: 'power2.out',
                delay: 0.5
            });
        });
        
        gsap.to(hoverBg, {
            duration: 0.5,
            scaleX: 1.5,
            scaleY: 1.5,
            ease: 'power1.out',
            onComplete() {
                document.body.className = '';
                document.body.className = bodyBgColors[getState('_clickCount')][0];

                gsap.to(hoverBg, {
                    duration: 0,
                    scaleX: 0,
                    scaleY: 1.15,
                });
            }
        });

        gsap.to(firstCardMesh.position, {
            duration: 0.8,
            x: -7,
            z: 3,
            ease: 'sine.out'
        });

        gsap.to(firstCardMesh.rotation, {
            duration: 0.8,
            y: -Math.PI * 0.8,
            ease: 'power1.out',
            onComplete() {
                setState('_isNextClicked', false);
                cardsGallery.removeAttribute('inert');
                cardsGallery.style.pointerEvents = '';

                gsap.to(firstCardMesh.position, {
                    duration: 0,
                    x: 0,
                    z: cardMeshesZindex.slice(-1)[0] + -0.03 
                });
                
                gsap.to(firstCardMesh.rotation, {
                    duration: 0,
                    y: 0,
                    z: 0 
                });
            }
        });

        if (cardType === 'stack' && !isShowClicked) {
            const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

            sortedCardMeshes.forEach((v, i) => {
                const name = v.name;
                const info = cardMeshesInitInfo[name];

                if (i > 2 && info.texture !== null) {
                    info.texture.needsUpdate = false;
                    cancelAnimationFrame(info.animationFrame);
                } else if (info.texture !== null) {
                    info.texture.needsUpdate = true;
                    info.renderVideoToCanvas();
                }
            });
        }
    }

    // 다음 버튼 클릭 핸들러
    const handleNextButton = () => {
        const isNextClicked = getState('_isNextClicked');

        if (isNextClicked) return; 

        setState('_isNextClicked', true);
        cardsGallery.setAttribute('inert', '');
        cardsGallery.style.pointerEvents = 'none';

        if (getState('_clickCount') === 5) {
            setState('_clickCount', 4);
        }
 
        setState('_clickCount', getState('_clickCount') + 1);
        document.body.backgroundColor = bodyBgColors[getState('_clickCount')][1];
        
        animateNextCard();
    }

    // 보기 버튼 애니메이션
    const animateShowBg = () => {
        gsap.to(hoverBg2, { 
            duration: 0.8, 
            scaleX: 1.5, 
            scaleY: 1.5, 
            ease: 'power1.out'
        });
    }

    // 보기 버튼 클릭 핸들러
    const handleShowButton = () => {
        const isNextClicked = getState('_isNextClicked'); 
        if(isNextClicked) return; 
        
        const firstCardMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];

        setState('_isShowClicked', true);
        animateShowBg();
        animateCardMesh(firstCardMesh);
    }

    // 카드 갤러리 스크롤 값 설정
    const updateScrollSpacer = () => {
        const headerHeight = parseInt(window.getComputedStyle(header).height, 10);
        const footerHeight = parseInt(window.getComputedStyle(footer).height, 10);
        // const pixelSizeHeight = currentMeshHeight;
        const pixelSizeHeight = getState('_currentMeshHeight');
        const size = window.innerWidth >= 768 ? 2 : 3;
        const spacer = pixelSizeHeight * size + headerHeight + footerHeight;

        if (window.innerHeight < spacer + headerHeight * 1.1) {
            scrollSpacer.style.height = `${spacer}px`;
        } else {
            scrollSpacer.style.height = `${window.innerHeight - headerHeight}px`;
        }
    }

    // 푸터 스타일 변경
    const updateFooterStyle = isOpen => {
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

    window.addEventListener('scroll', handleWindowScroll);
    window.addEventListener('resize', handleWindowResize);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mousedown', handleDocumentMousedown);
    document.addEventListener('mouseup', handleDocumentMouseup);
    closeButton.addEventListener('click', handleCloseButton);
    votingButtons.addEventListener('click', handleVotingButton);
    switchModeButton.addEventListener('click', handleSwitchButton);
    nextButton.addEventListener('click', handleNextButton);
    nextButton.addEventListener('mouseenter', handleHoverWrapperAction);
    nextButton.addEventListener('mouseleave', handleHoverWrapperAction);
    showButton.addEventListener('click', handleShowButton);
    showButton.addEventListener('mouseenter', handleHoverWrapperAction);
    showButton.addEventListener('mouseleave', handleHoverWrapperAction);

    animateSplash();
    animate();
}
main();