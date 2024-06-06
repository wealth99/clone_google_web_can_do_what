import * as THREE from 'three';
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
    let isSwitchClicked = true;
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
        2000
    );
    camera.position.z = 3.3;
    scene.add(camera);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Light
    const ambientLight = new THREE.AmbientLight('white', 1);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('white', 2);
    dirLight.position.set(-1, 3, 3);
    dirLight.target.position.set(0, 0, 0);
    dirLight.target.updateMatrixWorld();
    scene.add(dirLight);

    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 75;
    dirLight.shadow.radius = 8;
    dirLight.shadow.top = 15;
    dirLight.shadow.right = 15;
    dirLight.shadow.bottom = -15;
    dirLight.shadow.left = -15;
    dirLight.shadow.bias = -0.001; // 그림자 경계의 어긋남 방지
    dirLight.shadow.normalBias = 0.001; // 표면의 미세한 디테일 고려

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
            video.crossOrigin = 'anonymous';
            let videoHeight;

            video.addEventListener('canplay', () => {
                videoHeight = (400 / video.videoWidth) * video.videoHeight;
                context.drawImage(video, 0, 250, 400, videoHeight);

                resolve({ video, videoHeight });
            }, false);
        });
    }

    // canvas texture 만들기
    const createCanvasTexture = async (imagePath, videoPath) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        let video, videoHeight

        canvas.width = 400;
        canvas.height = 650;
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await loadImage(context, imagePath);
        if (videoPath) {
            await loadVideo(context, videoPath).then(result => {
                video = result.video;
                videoHeight = result.videoHeight;
            });
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        return { texture, video, videoHeight, canvas, context }
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

    // non indexed BufferGeometry
    const RoundEdgedBoxFlat = (w, h, t, r, s) => { // width, height, thick, radius corner, smoothness
        // helper const's and let's
        const wi = w / 2 - r;		// inner width, half
        const hi = h / 2 - r;		// inner height, half 
        const w2 = w / 2;			// half width
        const h2 = h / 2;			// half height

        let ul = r / w;				// u left front side
        let ur = (w - r) / w;		// u right front side
        const vl = r / h;			// v low
        const vh = (h - r) / h;	// v high
        
        let phia, phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
        
        let positions = [];
        let uvs = [];
        
        // for front side
        let t2 = t / 2;			// +  half thick
        let u0 = ul;
        let u1 = ur;
        let u2 = 0;
        let u3 = 1;
        let sign = 1;
            
        for( let k = 0; k < 2; k ++ ) {  // front and back side
            positions.push(
                -wi, -h2, t2,  wi, -h2, t2,  wi, h2, t2,
                -wi, -h2, t2,  wi,  h2, t2, -wi, h2, t2,
                -w2, -hi, t2, -wi, -hi, t2, -wi, hi, t2,
                -w2, -hi, t2, -wi,  hi, t2, -w2, hi, t2,
                wi, -hi, t2,  w2, -hi, t2,  w2, hi, t2,
                wi, -hi, t2,  w2,  hi, t2,  wi, hi, t2
            );
            
            uvs.push(
                u0,  0, u1,  0, u1,  1,
                u0,  0, u1,  1, u0,  1,
                u2, vl, u0, vl, u0, vh,
                u2, vl, u0, vh, u2, vh,
                u1, vl, u3, vl, u3, vh,
                u1, vl, u3, vh,	u1, vh
            );
                
            phia = 0; 
            
            for (let i = 0; i < s * 4; i ++) {
                phib = Math.PI * 2 * (i + 1) / (4 * s);
                
                cosa = Math.cos(phia);
                sina = Math.sin(phia);
                cosb = Math.cos(phib);
                sinb = Math.sin(phib);
                
                xc = i < s || i >= 3 * s ? wi : -wi;
                yc = i < 2 * s ? hi : -hi;
            
                positions.push(xc, yc, t2,  xc + r * cosa, yc + r * sina, t2,  xc + r * cosb, yc + r * sinb, t2);
                
                uc = i < s || i >= 3 * s ? u1 : u0;
                vc = i < 2 * s ? vh : vl;
                
                uvs.push(uc, vc, uc + sign * ul * cosa, vc + vl * sina, uc + sign * ul * cosb, vc + vl * sinb);
    
                phia = phib;
            }
            
            // for back side
            t2 = -t2;	// - half thick
            u0 = ur;	// right left exchange
            u1 = ul;
            u2 = 1;
            u3 = 0;
            sign = -1;
        }
        
        // framing
        
        t2 = t / 2;	// + half thick (again)
        
        positions.push(
            -wi, -h2,  t2, -wi, -h2, -t2,  wi, -h2, -t2,
            -wi, -h2,  t2,  wi, -h2, -t2,  wi, -h2,  t2,
            w2, -hi,  t2,  w2, -hi, -t2,  w2,  hi, -t2,
            w2, -hi,  t2,  w2,  hi, -t2,  w2,  hi,  t2,
            wi,  h2,  t2,  wi,  h2, -t2, -wi,  h2, -t2,
            wi,  h2,  t2, -wi,  h2, -t2, -wi,  h2,  t2,
            -w2,  hi,  t2, -w2,  hi, -t2, -w2, -hi, -t2,
            -w2,  hi,  t2, -w2, -hi, -t2, -w2, -hi,  t2
        );

        const cf = 2 * ((w + h - 4 * r) + Math.PI * r); // circumference
        const cc4 = Math.PI * r / 2 / cf  // circle-circumference / 4 / circumference
        u0 = 0;
        u1 = 2 * wi / cf;
        u2 = u1 + cc4;
        u3 = u2 + 2 * hi / cf;
        
        const u4 = u3 + cc4;
        const u5 = u4 + 2 * wi / cf;
        const u6 = u5 + cc4;
        const u7 = u6 + 2 * hi / cf;
        
        uvs.push(
            u0, 1,  0, 0, u1, 0,
            u0, 1, u1, 0, u1, 1,
            u2, 1, u2, 0, u3, 0,
            u2, 1, u3, 0, u3, 1,
            u4, 1, u4, 0, u5, 0,
            u4, 1, u5, 0, u5, 1,
            u6, 1, u6, 0, u7, 0, 
            u6, 1, u7, 0, u7, 1
        );
        
        phia = 0; 
        let u, j, j1;
        const ccs = cc4 / s; // partial value according to smoothness
        
        for (let i = 0; i < s * 4; i ++) {
            phib = Math.PI * 2 * ( i + 1 ) / ( 4 * s );
            
            cosa = Math.cos(phia);
            sina = Math.sin(phia);
            cosb = Math.cos(phib);
            sinb = Math.sin(phib);
            
            xc = i < s || i >= 3 * s ? wi : -wi;
            yc = i < 2 * s ? hi : -hi;
            
            positions.push(xc + r * cosa, yc + r * sina, t2,  xc + r * cosa, yc + r * sina, -t2,  xc + r * cosb, yc + r * sinb, -t2);
            positions.push(xc + r * cosa, yc + r * sina, t2,  xc + r * cosb, yc + r * sinb, -t2,  xc + r * cosb, yc + r * sinb,  t2);
            
            u = i < s ? u3 : (i < 2 * s ? u5 : (i < 3 * s ? u7 : u1)); // Attention! different start to front/back
            
            j = i % s;
            j1 = j + 1;
            
            uvs.push(u + j * ccs, 1,  u + j  * ccs, 0,  u + j1 * ccs, 0);
            uvs.push(u + j * ccs, 1,  u + j1 * ccs, 0,  u + j1 * ccs, 1);
            
            phia = phib;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array( positions ), 3));
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array( uvs ), 2));
        
        // add multimaterial groups for front, back, framing
        
        const vtc = (6 + 4 * s) * 3;		// vertex count one side
        geometry.addGroup (0, vtc , 0);
        geometry.addGroup (vtc, vtc , 1);
        geometry.addGroup (2 * vtc, 24 +  2 * 3  *  4 * s, 2);
        
        return geometry;
    }
    
    const boxGeometry = RoundEdgedBoxFlat(1.5, 2.4, 0.2, 0.15, 9);
    boxGeometry.computeVertexNormals();
    const boxMaterial = new THREE.MeshBasicMaterial( { color: '#ebebeb', side: THREE.DoubleSide } );

    const setStyleVariablesCardSize = cardMesh => {
        const { pixelSizeWidth, pixelSizeHeight } = calcPixelSizeFromMesh(cardMesh);
        
        document.documentElement.style.setProperty('--cardPixelWidth', `${pixelSizeWidth}px`);
        document.documentElement.style.setProperty('--cardPixelHeight', `${pixelSizeHeight}px`);
    }

    // card mesh 만들기
    const createCardMesh = async meshInfo => {
        const { name, position, image, video } = meshInfo;
        const { texture, video: videoElement, videoHeight, context, canvas } = await createCanvasTexture(image, video);

        const cardMesh = new THREE.Mesh(
            boxGeometry, [
                new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide  }), 
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

        setStyleVariablesCardSize(cardMesh);
        if(cardMeshes.length === 1) setScrollSpacer();

        // if (videoElement) {
        //     const renderFrame = () => {
        //         context.drawImage(videoElement, 0, 250, 400, videoHeight);
        //         texture.needsUpdate = true;

        //         if (!videoElement.paused && !videoElement.ended) {
        //             requestAnimationFrame(renderFrame);
        //         }
        //     }

        //     renderFrame();
        // }
    }

    Object.values(cardMeshesInitInfo).forEach(createCardMesh);

    // render
    const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // window 리사이즈 핸들러
    const handleWindowResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        setScrollSpacer();
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
        event.preventDefault();
        event.stopPropagation();
        if (mouseMoved || isClicked || cardType === 'stack' || isSwitchClicked) return;

        mouse.x = event.clientX / canvas.clientWidth * 2 - 1;
        mouse.y = -(event.clientY / canvas.clientHeight * 2 - 1);

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(cardMeshes);
        const isIntersect = intersects.length > 0;

        if (isIntersect) {
            const object = intersects[0].object;

            isClicked = true;
            prevScrollY = window.scrollY;

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

    // card mesh 애니메이션
    const animateCardMesh = object =>  {
        const { x, y, z } = object.position;

        enabledMesh = object;
        document.body.classList.add('page-open');
        document.body.style.cursor = '';
        document.body.style.overflow = 'hidden';
        updateFooterStyle(true);
        animateShowBg();

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
        
        if (cardType === 'grid') {
            if (object.name === 'card-2' || object.name === 'card-5') {
                gsap.to(object.position, {
                    duration: 0.8,
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

        gsap.to(object.scale, { 
            duration: 1, 
            x: 1,
            y: 1,
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
                    object.geometry = RoundEdgedBoxFlat(1.5, 2.4, 0.2, 0.1, 9);
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
                    opacity: 1, 
                    display: 'block'
                });
                gsap.to(canvas, {
                    duration: 0,
                    opacity: 0,
                    display: 'none' 
                });
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
                    mesh.geometry = RoundEdgedBoxFlat(1.5, 2.4, 0.2, 0.15, 9);
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
                isClicked = false;
                isShowClicked = false;
                document.body.classList.remove('page-open');
                updateFooterStyle(false);
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

    // switch 버튼 애니메이션
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
        dirLight.position.set(-1, 3, 3);
        dirLight.updateMatrixWorld();

        const gridEffect = (cardMesh, { x, y, z }, index) => {
            if (isLoading) effect.position(cardMesh.position, x, y, z);
            if (!isLoading) updateFooterStyle(true);

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
                                    isSwitchClicked = false;
                                    setScrollSpacer();
                                    updateFooterStyle(false);
                                }
                            });
                    }
                });
        }

        const stackEffect = (cardMesh, index) => {
            const zIndex = -index / 30;

            if (cardMeshesZindex.length <= 5) cardMeshesZindex.push(zIndex);

            animateCircle(false);
            effect.position2(cardMesh.position, 0, 0, zIndex, 'power2.inOut')
                .eventCallback('onUpdate', function() {
                    const progress = this.progress();

                    if (progress > 0.7 && !this.called) {
                        this.called = true;
                        
                        effect.scale(cardMesh.scale, 1.3, 1.3, 0, 'back.out(3)')
                            .eventCallback('onComplete', function() {
                                if (index === 5) {
                                    sortedCardMeshes.forEach((cardMesh, i) => {
                                        if (i > 2) return;
                                        const z = -Math.PI / 25 * i;
                                        effect.rotate(cardMesh.rotation, z);
                                    });

                                    isSwitchClicked = false;
                                    scrollSpacer.style.height = '';
                                    cardsGallery.classList.remove('stack-mode', 'grid-mode');
                                    cardsGallery.classList.add('stack-mode');
                                    updateFooterStyle(false);
                                    setStyleVariablesCardSize(cardMesh);
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
        event.preventDefault();
        event.stopPropagation();

        if (isSwitchClicked) return;

        const target = event.currentTarget;
        const hasStackActive = target.classList.contains('stack-active');
        const hasGridActive = target.classList.contains('grid-active');
        const action = () => {
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

        isSwitchClicked = true;

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

    // hover wrapper 애니메이션
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
            } else if (hasShowButton) {
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
            } else if (hasShowButton) {
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

            if (i < 3) {
                gsap.to(cardMesh.rotation, {
                    duration: .3, 
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
                duration: .5,
                z: cardMeshesZindex[i],
                ease: 'power2.out',
                delay: .5
            });
        });
        
        gsap.to(hoverBg, {
            duration: .5,
            scaleX: 1.5,
            scaleY: 1.5,
            ease: 'power1.out',
            onComplete() {
                document.body.className = '';
                document.body.className = bodyBgColors[clickCount][0];

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
                isNextClicked = false;
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
    }

    // next 버튼 클릭 핸들러
    const handleNextButton = () => {
        if (isNextClicked) return; 

        isNextClicked = true;
        cardsGallery.setAttribute('inert', '');
        cardsGallery.style.pointerEvents = 'none';

        if (clickCount === 5) clickCount = -1;

        clickCount += 1;
        document.body.backgroundColor = bodyBgColors[clickCount][1];
        
        animateNextCard();
    }

    // show 버튼 애니메이션
    const animateShowBg = () => {
        gsap.to(hoverBg2, { 
            duration: 0.8, 
            scaleX: 1.5, 
            scaleY: 1.5, 
            ease: 'power1.out'
        });
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
        
        scrollSpacer.style.height = `${ 
            pixelSizeHeight * 2 
            + parseInt(headerStyle.height, 10) 
            + parseInt(footerStyle.height, 10)
        }px`;
    }

    // footer 스타일 변경
    const updateFooterStyle = isOpen => {
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