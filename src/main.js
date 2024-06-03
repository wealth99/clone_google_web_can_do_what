import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap, ScrollToPlugin } from 'gsap/all';
gsap.registerPlugin(ScrollToPlugin);

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
    const cardMeshes = [];
    const cardMeshesZindex = [];
    const cardMeshesInitInfo = {
        'card-0': { name: 'card-0', position: new THREE.Vector3(-1.8, 0.9, 0), image: '/images/1_titlecard.png', video: '' },
        'card-1': { name: 'card-1', position: new THREE.Vector3(0, 0.9, 0), image: '/images/2.png', video: '/videos/2.mp4' },
        'card-2': { name: 'card-2', position: new THREE.Vector3(1.8, 0.9, 0), image: '/images/3.png', video: '/videos/3.mp4' },
        'card-3': { name: 'card-3', position: new THREE.Vector3(-1.8, -1.8, 0), image: '/images/4.png', video: '/videos/4.mp4' },
        'card-4': { name: 'card-4', position: new THREE.Vector3(0, -1.8, 0), image: '/images/5.png', video: '/videos/5.mp4' },
        'card-5': { name: 'card-5', position: new THREE.Vector3(1.8, -1.8, 0), image: '/images/6.png', video: '/videos/6.mp4' }
    }
    const bodyBgColors = [
        ['blue-mode', '#0073e6'],
        ['yellow-mode', '#ffbb25'],
        ['red-mode', '#e42616'],
        ['blue-mode-2', '#0073e6'],
        ['green-mode', '#1fb254'],
        ['red-mode', '#e42616']
    ];
    let clickCount = 0;
    let mouseMoved;
    let isClicked = false;
    let isNextClicked = false;
    let isShowClicked = false;
    let enabledMesh;
    let prevScrollY, newScrollY;
    let clickStartX, clickStartY, clickStartTime;
    let cardType = 'grid';

    const canvas = document.querySelector('#three-canvas');
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight, 
        0.1,
        1000
    );
    camera.position.z = 3.3;
    scene.add(camera);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Light
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight('white', 2);
    directionalLight.position.x = -1;
    directionalLight.position.y = 2;
    directionalLight.position.z = 3;
    scene.add(directionalLight);

    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 75;
    directionalLight.shadow.radius = 7;
    directionalLight.shadow.top = 15;
    directionalLight.shadow.right = 15;
    directionalLight.shadow.bottom = -15;
    directionalLight.shadow.left = -15;

    // Mesh
    const floorShadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10), 
        new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    floorShadowMesh.position.z = -0.05;
    floorShadowMesh.receiveShadow = true;
    scene.add(floorShadowMesh);

    // 이미지 로딩 
    const loadImage = (context, url) => {
        return new Promise(resolve => {
            const img = new Image();
            img.src = url;
            img.onload = () => {
                const height = (400 / img.width) * img.height;
                context.drawImage(img, 0, 0, 400, height);
                
                resolve();
            };
        });
    }

    // 비디오 로딩
    const loadVideo = (context, url) => {
        return new Promise(resolve => {
            const video = document.createElement('video');
            video.src = url;
            video.loop = true;
            video.muted = true;
            video.autoplay = true;
            let videoHeight;

            const renderFrame = () => {
                videoHeight = (400 / video.videoWidth) * video.videoHeight;
                context.drawImage(video, 0, 250, 400, videoHeight);

                if (!video.paused && !video.ended) {
                    video.requestVideoFrameCallback(renderFrame);
                } else {
                    video.remove();
                    resolve();
                }
            };

            video.requestVideoFrameCallback(renderFrame);
        });
    }

    // canvas texture 만들기
    const createCanvasTexture = async (imagePath, videoPath) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 650;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await loadImage(context, imagePath);
        if (videoPath) await loadVideo(context, videoPath);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        // texture.generateMipmaps = true;
        // texture.minFilter = THREE.LinearMipmapLinearFilter;
        // texture.magFilter = THREE.LinearFilter;

        return texture;
    }

    // 픽셀 크기로 메쉬 크기 계산하기
    const calcMeshSizeFromPixels = (pxWidth, pxHeight) => {
        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * camera.position.z;
        const aspect = window.innerWidth / window.innerHeight;
        const width = height * aspect;
        const meshWidth = (pxWidth / window.innerWidth) * width;
        const meshHeight = (pxHeight / window.innerHeight) * height;

        return { meshWidth, meshHeight }
    }

    // 메쉬 크기로 픽셀 크기 계산하기
    const calcPixelSizeFromMesh = cardMesh => {
        let boundingBox = new THREE.Box3().setFromObject(cardMesh);
        let size = new THREE.Vector3(0,0,0);
        size = boundingBox.getSize(size);

        const vFov = (camera.fov * Math.PI) / 180;
        const height = 2 * Math.tan(vFov / 2) * camera.position.z;
        const aspect = window.innerWidth / window.innerHeight;
        const width = height * aspect;

        const pixelSizeWidth = window.innerWidth * ((1 / width) * size.x);
        const pixelSizeHeight = window.innerHeight * ((1 / height) * size.y);

        return { pixelSizeWidth, pixelSizeHeight }
    };
    
    // const { meshWidth, meshHeight } = calcMeshSizeFromPixels(400, 640);
    const boxGeometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, 2);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
    const setStyleVariablesCardSize = cardMesh => {
        const { pixelSizeWidth, pixelSizeHeight } = calcPixelSizeFromMesh(cardMesh);
        
        document.documentElement.style.setProperty('--cardPixelWidth', `${pixelSizeWidth}px`);
        document.documentElement.style.setProperty('--cardPixelHeight', `${pixelSizeHeight}px`);
    }

    // card mesh 만들기
    const createCardMesh = async meshInfo => {
        const { name, position, image, video } = meshInfo;
        const texture = await createCanvasTexture(image, video);
        const cardMesh = new THREE.Mesh(
            boxGeometry, [
                boxMaterial,
                boxMaterial,
                boxMaterial,
                boxMaterial,
                new THREE.MeshStandardMaterial({ map: texture }),
                boxMaterial,
            ]
        );
        
        cardMesh.position.copy(position);
        cardMesh.name = name;
        cardMesh.rotation.reorder('YXZ');
        cardMesh.scale.z = 0.08;
        cardMesh.castShadow = true;
        cardMeshes.push(cardMesh);

        scene.add(cardMesh);

        setStyleVariablesCardSize(cardMesh);
        if(cardMeshes.length === 1) setScrollSpacer();
    }

    Object.values(cardMeshesInitInfo).forEach(createCardMesh);

    // render
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // window 리사이즈 핸들러
    const handleWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // window 스크롤 핸들러
    const handleWindowScroll = () => {
        if (pageIntroInner.getBoundingClientRect().y >= 0) {
            newScrollY = window.scrollY * 0.004;
            camera.position.y = - newScrollY;
        }
    }

    // documnet 클릭 핸들러
    const handleDocumentClick = event => {
        if (mouseMoved || isClicked || cardType === 'stack') return;

        mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;

        if (isIntersect) {
            const object = intersects[0].object;

            isClicked = true;
            footer.style.opacity = 0;
            animateCardMesh(object);
        }
    }

    // card mesh 애니메이션
    const animateCardMesh = object =>  {
        const { x, y, z } = object.position;

        enabledMesh = object;
        prevScrollY = window.scrollY;
        document.body.classList.add('page-open');
        document.body.style.cursor = '';
        document.body.style.overflow = 'hidden';

        if(cardType === 'stack') {
            const excludeFirstMeshes = cardMeshes
                .sort((a, b) => b.position.z - a.position.z)
                .filter((v, i) => i !== 0);

            for (const excludeFirstMesh of excludeFirstMeshes) {
                gsap.to(excludeFirstMesh.rotation, {
                    duration: 0.5,
                    x: 0,
                    y: 0,
                    z: 0,
                    delay: .1,
                    ease: 'power1.out',
                });
            }

            gsap.to(object.rotation, {
                duration: 0.2,
                y: 0,
                ease: 'sine.out',
            });

            gsap.to(object.position, {
                duration: 1,
                keyframes: {
                    '0%':   { x, y, z },
                    '100%': { x: 0, y: -0.52, z: 3 },
                    easeEach: 'sine.out'
                },
                ease: 'sine.out',
            });
        }

        animateShowBg();
        gsap.to(object.scale, { 
            duration: 1, 
            x: 1,
            y: 1,
            ease: 'power1.out',
        }); 
        gsap.to(object.rotation, { 
            duration: 0.2,
            z: 0,
            ease: 'power1.out' 
        });
        gsap.to(object.rotation, { 
            duration: 1, 
            y: Math.PI,
            ease: 'power1.out',
            onUpdate() {
                const progress = this.progress();
                if (progress > 0.3 && !this.called) {
                    this.called = true;
                
                    object.geometry.dispose();
                    object.geometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, .1);
                } 
            }
        });
        if (cardType === 'grid') {
            if (object.name === 'card-2' || object.name === 'card-5') {
                gsap.to(object.position, {
                    duration: .8,
                    x: 0,
                    y: -.52,
                    z: 3,
                    ease: 'sine.out'
                });
            } else {
                gsap.to(object.position, {
                    duration: 1,
                    keyframes: {
                        '0%':   { x, y, z, },
                        '50%':  { x: 1, y: 0, z: 1.5 },
                        '100%': { x: 0, y: -0.52, z: 3 },
                        easeEach: 'sine.out'
                    },
                    ease: 'sine.out',
                });
            }
        }
        gsap.to(camera.position, { 
            duration: 1, 
            y: 0, 
            z: 4.1, 
            delay: 0.2, 
            ease: 'power1.out', 
            onComplete() {
                gsap.to(pageIntro, { duration: 0, opacity: 1, display: 'block' });
                gsap.to(canvas, { duration: 0, opacity: 0, display: 'none' });

                window.scrollTo(0, 0);
                document.body.style.overflow = '';
                footer.style.opacity = 1;
                footer.style.position = 'absolute';
                footer.style.top = `${document.body.clientHeight}px`;
            }
        });
    }

    // card mesh 호버 애니메이션
    const animateCardMeshHover = (object = null) => {
        document.body.style.cursor = object ? 'pointer' : '';

        if (cardType === 'grid') {
            for (const mesh of cardMeshes) {
                const position = object === mesh ? 0.1 : 0;
    
                gsap.to(mesh.position, { 
                    duration: 0.5,
                    z: position, 
                    ease: 'power1.out'
                });
            } 
        }
    }

    // document 마우스무브 핸들러
    const handleDocumentMousemove = e => {
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
            mouseMoved = true;
        } else {
            mouseMoved = false;
        }
    }

    // mesh 리셋 애니메이션
    const animateResetMesh = (mesh, position) => {
        const { x, y, z } = position;
        
        gsap.to(pageIntro, { duration: 0, opacity: 0, display: 'none' });
        gsap.to(canvas, { duration: 0, opacity: 1, display: 'block' });
        
        if (window.scrollY > 0) {
            gsap.to(camera.position, { 
                    duration: 1,
                    y: - newScrollY,
                    ease: 'power1.out' 
                }
            );
        }

        if (cardType === 'stack') {
            const sortedCardMeshes = cardMeshes.sort((a, b) => b.position.z - a.position.z);

            gsap.to(mesh.scale, { 
                duration: 1, 
                x: 1.3,
                y: 1.3,
                ease: 'power1.out' 
            });

            for(let i = 0; i < sortedCardMeshes.length; i++) {
                const cardMesh = sortedCardMeshes[i];
                const angle = - Math.PI / 25 * i;

                gsap.to(cardMesh.rotation, {
                    duration: 0.3,
                    z: angle,
                    ease: 'power3.out'
                });

                if(i === 2) break;
            }
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
                    mesh.geometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, 2);
                } 
            }
        });
        gsap.to(camera.position, { 
            duration: 1, 
            z: 3.3, 
            delay: 0.3, 
            ease: 'power2.out', 
            onComplete() {
                isClicked = false;
                isShowClicked = false;
                document.body.classList.remove('page-open');
                footer.setAttribute('style', '');
            }
        });
    }

    // close 버튼 클릭 핸들러
    const handleCloseButton = () => {
        const enabledMeshName = enabledMesh.name;
        let position;

        if (cardType === 'grid') {
            position = cardMeshesInitInfo[enabledMeshName].position;
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

    // loadding splash 애니메이션
    const animateSplash = () => {
        const tl = gsap.timeline();

        tl.to(splashInner, { 
                duration: 0.5,
                rotation: -45,
                ease: 'power3.out' 
            })
        .to(splashInner, { 
                duration: 0.5,
                rotation: 90,
                opacity: 0,
                scale: 0.5, 
                ease: 'power3.out', 
                onComplete() {
                    gsap.to(pageSplash, { duration: 0, display: 'none' });

                    animateCircle(true);
                    animateCardMeshSort('grid', true);
                }
            }
        );
    }

    // switch 버튼 애니메이션
    const animateCircle = active => {
        if (active) {
            cardsGallery.classList.remove('stack-mode', 'grid-mode');
            cardsGallery.classList.add('grid-mode');
            
            gsap.fromTo(switchCircles,
                { scale: 0.12 },
                {
                    duration: 0.8,
                    scale: 14,
                    ease: 'cubic-bezier(0.475, 0.175, 0.515, 0.805)', 
                    stagger: { each: .08, from: 'start' },
                }
            );
        } else {
            gsap.fromTo(switchCircles,
                { scale: 14 },
                {
                    duration: 0.5,
                    scale: 0.12,
                    ease: 'cubic-bezier(0.185, 0.390, 0.745, 0.535)', 
                    stagger: { each: .08, from: 'end' },
                })
            ;
        }
    }

    // card mesh grid/stack 정렬 애니메이션
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

        const gridEffect = (cardMesh, { x, y, z }, index) => {
            if (isLoading) effect.position(cardMesh.position, x, y, z);

            effect.rotate(cardMesh.rotation, 0);
            effect.scale(cardMesh.scale, 1, 1, 0.1, 'back.in(2)', true).eventCallback('onUpdate', function() {
                const progress = this.progress();
                if (progress > 0.9 && !this.called) {
                    this.called = true;

                    if (!isLoading) animateCircle(true);

                    effect.position2(cardMesh.position, x, y, z, 'sine.out', true).eventCallback('onComplete', function() {
                        if (index === 5) {
                            switchModeButton.style.pointerEvents = '';
                        }
                    });
                }
            });
        }

        const stackEffect = (cardMesh, index) => {
            const zIndex = -index / 30;

            if (cardMeshesZindex.length <= 5) cardMeshesZindex.push(zIndex);

            animateCircle(false);
            effect.position2(cardMesh.position, 0, 0, zIndex, 'power2.inOut').eventCallback('onUpdate', function() {
                const progress = this.progress();
                if (progress > 0.7 && !this.called) {
                    this.called = true;

                    effect.scale(cardMesh.scale, 1.3, 1.3, 0, 'back.out(3)').eventCallback('onComplete', function() {
                        if (index === 5) {
                            sortedCardMeshes.forEach((cardMesh, i) => {
                                if (i > 2) return;
                                const z = -Math.PI / 25 * i;
                                effect.rotate(cardMesh.rotation, z);
                            });

                            setStyleVariablesCardSize(cardMesh);
                
                            switchModeButton.style.pointerEvents = '';
                            cardsGallery.classList.remove('stack-mode', 'grid-mode');
                            cardsGallery.classList.add('stack-mode');
                        }
                    });
                }
            });
        }

        sortedCardMeshes.forEach((cardMesh ,i) => {
            const { x, y, z } = cardMeshesInitInfo[cardMesh.name].position;

            if (type === 'grid') gridEffect(cardMesh, { x, y, z }, i);
            if (type === 'stack') stackEffect(cardMesh, i);
        });
    }

    // switch 버튼 클릭 핸들러
    const handleSwitchButton = event => {
        event.stopPropagation();
        const target = event.currentTarget;
        const hasStackActive = target.classList.contains('stack-active');
        const hasGridActive = target.classList.contains('grid-active');

        target.style.pointerEvents = 'none';
        target.classList.remove('stack-active', 'grid-active');
        document.body.style.cursor = '';
 
        if (hasStackActive) {
            cardType = 'grid';
            target.classList.add('grid-active');
            animateCardMeshSort('grid');
        }

        if (hasGridActive) {
            cardType = 'stack';
            target.classList.add('stack-active');
            animateCardMeshSort('stack');
        }
    }

    // hover wrapper 애니메이션
    const animatHoverWrapper = (element, eventType) => {
        const hasNextButton = element.classList.contains('next-button');
        const hasShowButton = element.classList.contains('show-button');
        const firstMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];
        const effect = {
            position(target, x, z, duration = 0.5) {
                gsap.to(target.position, { duration, x, z, ease: 'sine.out'})
            },
            rotate(target, y, z, duration = 0.5) {
                gsap.to(target.rotation, { duration, y, z, ease: 'power1.out'});
            },
            background(target, scaleX, scaleY = 1.15, duration = 0.5) {
                gsap.to(target, { duration, scaleX, scaleY, ease: 'power1.out' });
            }
        }
        let targetHover;

        if (eventType === 'mouseenter') {
            if (hasNextButton) {
                targetHover = document.querySelector('.next-card .hover-bg');
                effect.position(firstMesh, -1.2, 0.4);
                effect.rotate(firstMesh, -Math.PI / 5, Math.PI / 20);
            } else if (hasShowButton) {
                targetHover = document.querySelector('.show-me .hover-bg-2');
                effect.position(firstMesh, 1.2, 0.4);
                effect.rotate(firstMesh, Math.PI / 5, -Math.PI / 20);
            }
            
            effect.background(targetHover, 0.6);
        }

        if (eventType === 'mouseleave') {
            if (hasNextButton) {
                targetHover = document.querySelector('.next-card .hover-bg');
            } else if (hasShowButton) {
                targetHover = document.querySelector('.show-me .hover-bg-2');
            }

            effect.position(firstMesh, 0, 0);
            effect.rotate(firstMesh, 0, 0);
            effect.background(targetHover, 0);
        }
    }

    // hover wrapper 마우스 액션 핸들러
    const handleHoverWrapperAction = event => {
        if (cardType === 'grid' || isShowClicked || isNextClicked) return;
        
        const eventType = event.type;
        const element = event.currentTarget;

        animatHoverWrapper(element, eventType);
    }

    // next 버튼 애니메이션
    const animateNextCard = () => {
        const firstCardMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];
        const excludeFirstMeshes = cardMeshes
            .sort((a, b) => b.position.z - a.position.z)
            .filter((v, i) => v !== firstCardMesh);

        excludeFirstMeshes.forEach((v, i) => {
            const cardMesh = v;
            const angle = - Math.PI / 25 * i;

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
                duration: .5,
                z: cardMeshesZindex[i],
                ease: 'power2.out',
                delay: .5
            });

            if (i < 3) {
                gsap.to(cardMesh.rotation, {
                    duration: .3, 
                    z: angle,
                    ease: 'power2.out',
                    delay: .5
                });
            }
        });

        gsap.to(hoverBg, {
            duration: .5,
            scaleX: 1.5,
            scaleY: 1.5,
            ease: 'power1.out',
            onComplete() {
                gsap.to(hoverBg, {
                    duration: 0,
                    scaleX: 0,
                    scaleY: 1.15,
                });
                
                document.body.className = '';
                document.body.className = bodyBgColors[clickCount][0];
            }
        });
        
        gsap.to(firstCardMesh.position, {
            duration: 0.8,
            x: -7,
            ease: 'power1.out'
        });
        gsap.to(firstCardMesh.rotation, {
            duration: 0.8,
            y: -Math.PI * 0.8,
            ease: 'power1.out',
            onComplete() {
                const zIndex = cardMeshesZindex.slice(-1)[0] + -0.03;

                isNextClicked = false;
                cardsGallery.removeAttribute('inert');
                cardsGallery.style.pointerEvents = '';

                gsap.to(firstCardMesh.position, {
                    duration: 0,
                    x: 0,
                    z: zIndex
                });
                gsap.to(firstCardMesh.rotation, {
                    duration: 0,
                    y: 0,
                    z: 0,
                });
            }
        });
    }

    // next 버튼 클릭 핸들러
    const handleNextButton = () => {
        if(isNextClicked) return; 

        isNextClicked = true;
        cardsGallery.setAttribute('inert', '');
        cardsGallery.style.pointerEvents = 'none';

        if(clickCount === 5) clickCount = -1;

        clickCount += 1;
        document.body.backgroundColor = bodyBgColors[clickCount][1];
        
        animateNextCard();
    }

    // show 버튼 애니메이션
    const animateShowBg = () => {
        gsap.to(hoverBg2, { duration: 0.8, scaleX: 1.5, scaleY: 1.5, ease: 'power1.out' });
    }

    // show 버튼 클릭 핸들러
    const handleShowButton = () => {
        if(isNextClicked) return; 
        const firstCardMesh = cardMeshes.sort((a, b) => b.position.z - a.position.z)[0];

        isShowClicked = true;

        animateShowBg();
        animateCardMesh(firstCardMesh);
    }

    // cards gallery 스크롤 값 설정
    const setScrollSpacer = () => {
        const headerStyle = window.getComputedStyle(header);
        const footerStyle = window.getComputedStyle(footer);
        const { pixelSizeHeight } = calcPixelSizeFromMesh(cardMeshes[0]);
        
        scrollSpacer.style.height = `${ pixelSizeHeight * 2 + parseInt(headerStyle.height, 10) + parseInt(footerStyle.height, 10)}px`;
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