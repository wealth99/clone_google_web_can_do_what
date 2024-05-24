import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import gsap from 'gsap/all';

export default function main() {
    const clock = new THREE.Clock();
    const bgColor = '#0073e6';
    const initMeshPositions = [];
    let isClicked = false;
    let enabledMesh;
    let prevScrollY, newScrollY;
    let mouseMoved;
    let clickStartX, clickStartY, clickStartTime;

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
    // scene.background = new THREE.Color(bgColor);

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

    // Controls
    // const controls = new OrbitControls(camera, renderer.domElement);

    // Mesh
    const floorMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10), 
        new THREE.MeshBasicMaterial({ color: bgColor })
    );
    floorMesh.position.z = -0.05;
    scene.add(floorMesh);

    const floorShadowMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10), 
        new THREE.ShadowMaterial({ opacity: .15 })
    );
    floorShadowMesh.position.z = -0.05;
    floorShadowMesh.receiveShadow = true;
    scene.add(floorShadowMesh);

    const createCanvasTexture = (imgUrl, videoUrl) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 650;

        const render = async () => {
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            await loadImage(imgUrl);

            if(videoUrl !== null) await loadVideo(videoUrl);

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

    const cardMeshes = [];
    const createCardMesh = async (position, imgUrl, videoUrl = null) => {
        const render = createCanvasTexture(imgUrl, videoUrl);
        const texture = await render.render();
        const boxGeometry = new RoundedBoxGeometry(1.5, 2.4, .4, 10, 2);
        const cardMesh = new THREE.Mesh(
            boxGeometry, [
                new THREE.MeshPhongMaterial({ color: 'white' }),
                new THREE.MeshPhongMaterial({ color: 'white' }),
                new THREE.MeshPhongMaterial({ color: 'white' }),
                new THREE.MeshPhongMaterial({ color: 'white' }),
                new THREE.MeshPhongMaterial({ map: texture }),
                new THREE.MeshPhongMaterial({ color: 'white' }),
            ]
        );

        cardMesh.position.copy(position);
        cardMesh.name = `card-${cardMeshes.length}`;
        cardMesh.rotation.reorder('YXZ');
        cardMesh.scale.z = 0.08;
        cardMesh.castShadow = true;
        // cardMesh.renderOrder = 1;
        cardMeshes.push(cardMesh);

        scene.add(cardMesh);

        initMeshPositions.push({
            name: `${cardMesh.name}`,
            position: cardMesh.position.clone()
        }); 
    }

    createCardMesh(new THREE.Vector3(-1.8, 0.9, 0), '/images/1_titlecard.png');
    createCardMesh(new THREE.Vector3(0, 0.9, 0), '/images/2.png', '/videos/02.mp4');
    createCardMesh(new THREE.Vector3(1.8, 0.9, 0), '/images/3.png', '/videos/03.mp4');
    createCardMesh(new THREE.Vector3(-1.8, -1.8, 0), '/images/4.png', '/videos/04.mp4');
    createCardMesh(new THREE.Vector3(0, -1.8, 0), '/images/5.png', '/videos/05.mp4');
    createCardMesh(new THREE.Vector3(1.8, -1.8, 0), '/images/6.png', '/videos/06.mp4');

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

    // document body cursor 수정
    const updateBodyCursor = type => {
        document.body.style.cursor = type;
    }

    // documnet 클릭 핸들러
    const handleDocumentClick = event => {
        mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

        if(mouseMoved || isClicked) return;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;

        if(isIntersect) {
            const object = intersects[0].object;
            updateCardMeshAnimation(object);
        }
    }

    // card mesh 애니메이션
    const updateCardMeshAnimation = (object) =>  {
        const position = getInitMeshPosition(object.name);
        const { x, y , z } = position;

        isClicked = true;
        enabledMesh = object;
        updateBodyCursor('');

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
                pageIntro.style.opacity = '1';
                pageIntro.style.display= 'block';

                window.scrollTo(0, 0);
                document.body.style.overflow = '';
            }
        });

        setTimeout(() => {
            object.geometry.dispose();
            object.geometry = new RoundedBoxGeometry(1.5, 2.4, 0.4, 10, .1);
        }, 300);
    }

    // document 마우스무브 핸들러
    const handleDocumentMousemove = e => {
        mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);

        if(isClicked) return;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;     

        isIntersect ? updateHoverAnimation(isIntersect ? intersects[0].object : null) : updateHoverAnimation();
    }

    // mesh 호버 애니메이션
    const updateHoverAnimation = (object = null) => {
        updateBodyCursor(object ? 'pointer' : '');

        for(const mesh of cardMeshes) {
            const position = object === mesh ? .1 : 0;
            gsap.to(mesh.position, { 
                duration: .5, 
                z: position, 
                ease: 'power1.out'
            });
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

        if(xDiff > 5 || yDiff > 5 || timeDiff > 500) {
            mouseMoved = true;
        } else {
            mouseMoved = false;
        }
    }

    // 초기화 할 mesh position 값 가져오기
    const getInitMeshPosition = name => {
        return initMeshPositions.filter(cardMeshesPosition => {
            return cardMeshesPosition.name === `${name}`;
        })[0].position;
    }

    // mesh 리셋 애니메이션
    const resetMeshAnimation = (mesh, position) => {
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
        const position = getInitMeshPosition(enabledMeshName);

        // gsap.to(window, { 
        //     duration: .8,
        //     scrollTo: { y: 0 },
        //     ease: 'sine.out', 
        //     onComplete: () => {
        //         resetMeshAnimation(enabledMesh, position);
        //     }
        // });

        resetMeshAnimation(enabledMesh, position);
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

    // splash 애니메이션
    const splashAnimation = () => {
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
                    switchAnimation(true);
                }
            }
        );
            
    }

    // 바닥 mesh 투명 토글
    const toggleFloorMeshTransparent = active => {
        floorMesh.material.opacity = active ? 0 : 1;
        floorMesh.material.transparent = active ? true : false;
        floorMesh.material.needsUpdate = true;

        floorShadowMesh.material.opacity = active ? 0 : .15;
        floorShadowMesh.material.transparent = active ? true : false;
        floorShadowMesh.material.needsUpdate = true;
    }

    // switch 버튼 애니메이션
    const switchAnimation = active => {
        const switchCircles = document.querySelectorAll('.switch-circle');
        
        toggleFloorMeshTransparent(true);
        if(active) {
            gsap.fromTo(switchCircles,
                { scale: 1.2 },
                { 
                    duration: .8,
                    scale: 14,
                    ease: 'cubic-bezier(0.475, 0.175, 0.515, 0.805)', 
                    stagger: { each: .08, from: 'start' },
                    onComplete: () => {
                        toggleFloorMeshTransparent(false);
                    }
                }
            );
        } else {
            gsap.fromTo(switchCircles,
                { scale: 14 },
                { 
                    duration: .4,
                    scale: 1.2,
                    ease: 'cubic-bezier(0.185, 0.390, 0.745, 0.535)', 
                    stagger: { each: .08, from: 'end' },
                    onComplete: () => {
                        toggleFloorMeshTransparent(false);
                    }
                })
            ;
        }
    }

    // switch 버튼 클릭 핸들러
    const handleSwitchButton = event => {
        event.stopPropagation();
        const target = event.currentTarget;
        const className = target.getAttribute('class');

        target.classList.remove('stack-active', 'grid-active');
        if(className.includes('stack-active')) {
            target.classList.add('grid-active');
            switchAnimation(true);
        }
        if(className.includes('grid-active')) {
            target.classList.add('stack-active');
            switchAnimation(false);
        }
    }

    window.addEventListener('scroll', handleWindowSrcoll);
    window.addEventListener('resize', handleWindowResize);
    document.addEventListener('DOMContentLoaded', () => {
        const closeButton = document.querySelector('.close-button');
        const votingButtons = document.querySelector('.voting-buttons');
        const switchModeButton = document.querySelector('.switch-mode-button');

        closeButton.addEventListener('click', handleCloseButton);
        votingButtons.addEventListener('click', handleVotingButton);
        switchModeButton.addEventListener('click', handleSwitchButton);

        splashAnimation();
    });
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('mousemove', handleDocumentMousemove);
    document.addEventListener('mousedown', handleDocumentMousedown);
    document.addEventListener('mouseup', handleDocumentMouseup);

    animate();
}

main();