import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gsap, ScrollToPlugin } from 'gsap/all';

gsap.registerPlugin(ScrollToPlugin);

export default function main() {
    const clock = new THREE.Clock();
    const cardMeshes = [];
    const cardMeshesInitInfo = {
        'card-0': {
            name: 'card-0',
            position: new THREE.Vector3(-1.8, 0.9, 0),
            image: '/images/1_titlecard.png',
            video: ''
        },
        'card-1': {
            name: 'card-1',
            position: new THREE.Vector3(0, 0.9, 0),
            image: '/images/2.png',
            video: '/videos/2.mp4'
        },
        'card-2': {
            name: 'card-2',
            position: new THREE.Vector3(1.8, 0.9, 0),
            image: '/images/3.png',
            video: '/videos/3.mp4'
        },
        'card-3': {
            name: 'card-3',
            position: new THREE.Vector3(-1.8, -1.8, 0),
            image: '/images/4.png',
            video: '/videos/4.mp4'
        },
        'card-4': {
            name: 'card-4',
            position: new THREE.Vector3(0, -1.8, 0),
            image: '/images/5.png',
            video: '/videos/5.mp4'
        },
        'card-5': {
            name: 'card-5',
            position: new THREE.Vector3(1.8, -1.8, 0),
            image: '/images/6.png',
            video: '/videos/6.mp4'
        }
    }
    let mouseMoved, isClicked = false;
    let enabledMesh;
    let prevScrollY, newScrollY;
    let clickStartX, clickStartY, clickStartTime;
    let cardType = 'grid';

    // Renderer
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
    directionalLight.shadow.camera.far = 40;
    directionalLight.shadow.radius = 7;

    // // LightHelper
    // const lightHelper = new THREE.DirectionalLightHelper(directionalLight);
    // scene.add(lightHelper);

    // // AxesHelper
    // const axesHelper = new THREE.AxesHelper(3);
    // scene.add(axesHelper);

    // // GridHelper
    // const gridHelper = new THREE.GridHelper(5); 
    // scene.add(gridHelper);

    // // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);

    // Mesh
    const floorShadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10), 
        new THREE.ShadowMaterial({ opacity: .15 })
    );
    floorShadowMesh.position.z = -0.05;
    floorShadowMesh.receiveShadow = true;
    scene.add(floorShadowMesh);

    const createCanvasTexture = (imagePath, videoPath) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 650;

        const render = async () => {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await loadImage(imagePath);

            if(videoPath !== '') await loadVideo(videoPath);

            const canvasTexture = new THREE.CanvasTexture(canvas);
            canvasTexture.colorSpace = THREE.SRGBColorSpace;

            return canvasTexture;
        }

        const loadImage = async (url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = url;
                img.onload = () => {
                    const height = (400 / img.width) * img.height;
                    context.drawImage(img, 0, 0, 400, height);

                    resolve();
                };
            });
        }

        const loadVideo = async (url) => {
            return new Promise((resolve, reject) => {
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

        return { render }
    }
    
    const boxGeometry = new RoundedBoxGeometry(1.5, 2.4, .4, 10, 2);
    // const boxMaterial = [
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    //     new THREE.MeshStandardMaterial({ color: 'white' }),
    // ]
    const createCardMesh = async (meshInfo) => {
        const { name, position, image, video } = meshInfo;
        const render = createCanvasTexture(image, video);
        const texture = await render.render();
        const cardMesh = new THREE.Mesh(
            boxGeometry, [
            new THREE.MeshStandardMaterial({ color: 'white' }),
            new THREE.MeshStandardMaterial({ color: 'white' }),
            new THREE.MeshStandardMaterial({ color: 'white' }),
            new THREE.MeshStandardMaterial({ color: 'white' }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ color: 'white' }),
        ]);

        cardMesh.position.copy(position);
        cardMesh.name = name;
        cardMesh.rotation.reorder('YXZ');
        cardMesh.scale.z = 0.08;
        cardMesh.castShadow = true;
        cardMeshes.push(cardMesh);

        scene.add(cardMesh);
    }

    createCardMesh(cardMeshesInitInfo['card-0']);
    createCardMesh(cardMeshesInitInfo['card-1']);
    createCardMesh(cardMeshesInitInfo['card-2']);
    createCardMesh(cardMeshesInitInfo['card-3']);
    createCardMesh(cardMeshesInitInfo['card-4']);
    createCardMesh(cardMeshesInitInfo['card-5']);

    const animate = () => {
        // const delta = clock.getDelta();
        // const time = clock.getElapsedTime();

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
    const handleWindowSrcoll = () => {
        const pageIntroInner = document.querySelector('.page-intro .inner');

        if(pageIntroInner.getBoundingClientRect().y >= 0) {
            newScrollY = window.scrollY * 0.001;
            camera.position.y = - newScrollY;

            pageIntroInner.style.backgroundColor = '';
        } else {
            pageIntroInner.style.backgroundColor = '#ebebeb';
        }
    }

    // documnet 클릭 핸들러
    const handleDocumentClick = event => {
        if(mouseMoved || isClicked) return;

        isClicked = true;
        mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;

        if(isIntersect) {
            const object = intersects[0].object;
            animateCardMesh(object);
        }
    }

    // card mesh 애니메이션
    const animateCardMesh = (object) =>  {
        const position = cardMeshesInitInfo[object.name].position;
        const { x, y , z } = position;

        enabledMesh = object;
        document.body.style.cursor = '';

        prevScrollY = window.scrollY;
        document.body.style.overflow = 'hidden';

        gsap.to(object.rotation, { 
            duration: .8, 
            y: Math.PI, 
            ease: 'power1.out' 
        });
        gsap.to(object.position, {
            duration: .8,
            keyframes: {
                "0%":   { x, y, z, ease: "sine.out"},
                "50%":  { x: x !== 0 ? .4 : .8, y: 0, z: 1.5, ease: "sine.out"},
                "100%": { x: 0, y: -0.52, z: 3, ease: "sine.out" },
            },
            ease: 'sine.out',
        });
        gsap.to(camera.position, { 
            duration: .8, 
            y: 0, 
            z: 4.1, 
            delay: .2, 
            ease: 'power1.out', 
            onComplete: () => {
                const pageIntro = document.querySelector('.page-intro');
                gsap.to(pageIntro, { duration: 0, opacity: 1, display: 'block' });

                window.scrollTo(0, 0);
                document.body.style.overflow = '';
            }
        });

        setTimeout(() => {
            object.geometry.dispose();
            object.geometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, .1);
        }, 300);
    }

    // card mesh 호버 애니메이션
    const animateCardMeshHover = (object = null) => {
        document.body.style.cursor = object ? 'pointer' : '';

        if(cardType === 'grid') {
            for(const mesh of cardMeshes) {
                const position = object === mesh ? .1 : 0;
    
                gsap.to(mesh.position, { 
                    duration: .5,
                    z: position, 
                    ease: 'power1.out'
                });
            } 
        }
    }

    // document 마우스무브 핸들러
    const handleDocumentMousemove = e => {
        if(isClicked) return;

        mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;    

        isIntersect ? animateCardMeshHover(intersects[0].object) : animateCardMeshHover();
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

        if(xDiff > 5 || yDiff > 5 || timeDiff > 500) {
            mouseMoved = true;
        } else {
            mouseMoved = false;
        }
    }

    // mesh 리셋 애니메이션
    const animateResetMesh = (mesh, position) => {
        const { x, y, z } = position;

        const pageIntro = document.querySelector('.page-intro');
        pageIntro.style.transition = 'opacity 100ms ease';
        pageIntro.style.opacity = '0';

        setTimeout(() => {
            mesh.geometry.dispose();
            mesh.geometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, 2);

            pageIntro.style.transition = '';
            pageIntro.style.opacity = '';
            pageIntro.style.display = '';
        }, 300);

        gsap.to(mesh.rotation, {
            duration: .8, 
            y: 0, 
            ease: 'power1.out' 
        });
        gsap.to(mesh.position, { 
            duration: .8,
            x, y, z, 
            ease: 'power1.out' 
        });
        gsap.to(camera.position, { 
            duration: .8, 
            z: 3.3, 
            delay: '+0.2', 
            ease: 'power1.out', 
            onComplete: () => {
                isClicked = false;
            }
        });

        if(window.scrollY > 0) {
            gsap.to(camera.position, { 
                    duration: .8,
                    y: - newScrollY,
                    delay: '+0.2',
                    ease: 'power1.out' 
                }
            );
        }
    }

    // close 버튼 클릭 핸들러
    const handleCloseButton = () => {
        if(!isClicked) return;
        
        const enabledMeshName = enabledMesh.name;
        const position = cardMeshesInitInfo[enabledMeshName].position;

        if(window.scrollY > 0) {
            gsap.to(window, { 
                duration: .5,
                scrollTo: { y: 0 },
                ease: 'sine.out', 
                onComplete: () => {
                    animateResetMesh(enabledMesh, position);
                }
            });
            return;
        }

        animateResetMesh(enabledMesh, position);
    }

    // voting 버튼 클릭 핸들러
    const handleVotingButton = event => {
        const target = event.target;
        const parent = target.closest('button');
        const className = parent?.getAttribute('class');
        const container = parent?.closest('.voting');
        
        container?.classList.remove('voted-up', 'voted-down');
        if(className.includes('button-vote-up')) {
            container.classList.add('voted-up');
        }
        if(className.includes('button-vote-down')) {
            container.classList.add('voted-down');
        }
    }

    // loadding splash 애니메이션
    const animateloadding = () => {
        const pageSplash = document.querySelector('.page-splash');
        const inner = document.querySelector('.page-splash .inner');
        const tl = gsap.timeline();

        tl.to(inner, { 
                duration: .5,
                rotation: -45,
                ease: 'power3.out' 
            })
        .to(inner, { 
                duration: .5,
                rotation: 90,
                opacity: 0,
                scale: 0.5, 
                ease: 'power3.out', 
                onComplete: () => {
                    pageSplash.style.display = 'none';
                    animateCircle(true);
                    animateCardMeshSort('grid');
                }
            }
        );
    }

    // switch 버튼 애니메이션
    const animateCircle = active => {
        const switchCircles = document.querySelectorAll('.switch-circle');
        
        if(active) {
            gsap.fromTo(switchCircles,
                { scale: .12 },
                { 
                    duration: .8,
                    scale: 14,
                    ease: 'cubic-bezier(0.475, 0.175, 0.515, 0.805)', 
                    stagger: { each: .08, from: 'start' },
                }
            );
        } else {
            gsap.fromTo(switchCircles,
                { scale: 14 },
                { 
                    duration: .4,
                    scale: .12,
                    ease: 'cubic-bezier(0.185, 0.390, 0.745, 0.535)', 
                    stagger: { each: .08, from: 'end' },
                })
            ;
        }
    }

    // card mesh grid/stack 정렬 애니메이션
    const animateCardMeshSort = type => {
        const sortedCardMeshes = cardMeshes.sort((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        });

        if(type === 'grid') {
            sortedCardMeshes.forEach((v, i) => {
                const cardMesh = v;
                const { x, y, z } = cardMeshesInitInfo[v.name].position;

                gsap.to(cardMesh.rotation, { duration: 0, z: 0, overwrite: true });
                gsap.to(cardMesh.scale, { duration: 0, x: 1, y: 1, overwrite: true });
                gsap.fromTo(cardMesh.position, { 
                    x: 0, 
                    y: 0, 
                    z: 0
                }, { 
                    duration: .5,
                    x, y, z,
                    ease: 'power1.out',
                    overwrite: true,
                    onComplete: () => {
                        isClicked = false;
                    }
                });
            });
        } 

        if(type === 'stack') {
            let step
            sortedCardMeshes.forEach((v, i) => {
                const cardMesh = v;
                const zIndex = - i / 30;

                step = gsap.to(cardMesh.position, { 
                    duration: .5,
                    x: 0,
                    y: 0,
                    z: zIndex,
                    ease: 'power1.out',
                });
            });
      
            step.eventCallback('onComplete', () => {
                sortedCardMeshes.forEach((v, i) => {
                    const cardMesh = v;

                    gsap.to(cardMesh.scale, {
                        duration: .6,
                        x: 1.3,
                        y: 1.3,
                        ease: "back.out(3)",
                        onComplete: () => {
                            sortedCardMeshes.some((v, i) => {
                                const cardMesh = v;
                                const angle = - Math.PI / 25;

                                gsap.to(cardMesh.rotation, {
                                    duration: .5, 
                                    z: angle * i,
                                    ease: 'power3.out',
                                });
                                
                                if (i === 2) return true;
                                return false;
                            });
                        }
                    });
                });
            }); 
        }
    }

    // switch 버튼 클릭 핸들러
    const handleSwitchButton = event => {
        event.stopPropagation();
        const target = event.currentTarget;
        const hasStackActive = target.classList.contains('stack-active');
        const hasGridActive = target.classList.contains('grid-active');

        target.classList.remove('stack-active', 'grid-active');
        isClicked = true;

        if (hasStackActive) {
            cardType = 'grid';
            target.classList.add('grid-active');
            animateCircle(true);
            animateCardMeshSort('grid');
        }

        if (hasGridActive) {
            cardType = 'stack';
            target.classList.add('stack-active');
            animateCircle(false);
            animateCardMeshSort('stack');
        }
    }

    // hover wrapper 애니메이션
    const animatHoverWrapper = (element, eventType) => {
        const hasNextButton = element.classList.contains('next-button');
        const hasShowButton = element.classList.contains('show-button');
        const firstCardMesh = (() => {
            return cardMeshes.sort((a, b) => b.position.z - a.position.z)[0]
        })();
        let target;

        if(eventType === 'mouseenter') {
            if(hasNextButton) {
                target = document.querySelector('.next-card .hover-bg');
    
                gsap.to(firstCardMesh.position, {
                    duration: .8,
                    x: -1,
                    z: .5,
                    ease: 'power1.out'
                });
                gsap.to(firstCardMesh.rotation, {
                    duration: .8,
                    y: -Math.PI / 5,
                    ease: 'power1.out'
                });
            }
    
            if(hasShowButton) {
                target = document.querySelector('.show-me .hover-bg');
    
                gsap.to(firstCardMesh.position, {
                    duration: .8,
                    x: 1,
                    z: .5,
                    ease: 'power1.out'
                });
                gsap.to(firstCardMesh.rotation, {
                    duration: .8,
                    y: Math.PI / 5,
                    ease: 'power1.out'
                });
            }

            gsap.to(target, {
                duration: .8,
                scaleX: .6,
                scaleY: 1.15,
                ease: 'power1.out',
            });
        }

        if(eventType === 'mouseleave') {
            if(hasNextButton) {
                target = document.querySelector('.next-card .hover-bg');
    
                gsap.to(firstCardMesh.position, {
                    duration: .8,
                    x: 0,
                    z: 0,
                    ease: 'power1.out'
                });
                gsap.to(firstCardMesh.rotation, {
                    duration: .8,
                    y: 0,
                    ease: 'power1.out'
                });
            }
    
            if(hasShowButton) {
                target = document.querySelector('.show-me .hover-bg');
    
                gsap.to(firstCardMesh.position, {
                    duration: .8,
                    x: 0,
                    z: 0,
                    ease: 'power1.out'
                });
                gsap.to(firstCardMesh.rotation, {
                    duration: .8,
                    y: 0,
                    ease: 'power1.out'
                });
            }

            gsap.to(target, {
                duration: .8,
                scaleX: 0,
                scaleY: 1.15,
                ease: 'power1.out',
            });
        }
    }

    // hover wrapper 마우스 액션 핸들러
    const handleHoverWrapperAction = event => {
        if(cardType === 'grid') return;
        
        const eventType = event.type;
        const element = event.currentTarget;

        animatHoverWrapper(element, eventType);
    }

    window.addEventListener('scroll', handleWindowSrcoll);
    window.addEventListener('resize', handleWindowResize);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mousedown', handleDocumentMousedown);
    document.addEventListener('mouseup', handleDocumentMouseup);
    document.addEventListener('DOMContentLoaded', () => {
        const closeButton = document.querySelector('.close-button');
        const votingButtons = document.querySelector('.voting-buttons');
        const switchModeButton = document.querySelector('.switch-mode-button');
        const nextButton = document.querySelector('.next-button');
        const showButton = document.querySelector('.show-button');

        closeButton.addEventListener('click', handleCloseButton);
        votingButtons.addEventListener('click', handleVotingButton);
        switchModeButton.addEventListener('click', handleSwitchButton);
        nextButton.addEventListener('mouseenter', handleHoverWrapperAction);
        nextButton.addEventListener('mouseleave', handleHoverWrapperAction);
        showButton.addEventListener('mouseenter', handleHoverWrapperAction);
        showButton.addEventListener('mouseleave', handleHoverWrapperAction);
        
        animateloadding();
    });

    animate();
}

main();