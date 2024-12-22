import * as THREE from 'three';

export default async function createCanvasTexture(imagePath, videoPath) {
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