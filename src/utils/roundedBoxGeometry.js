import * as THREE from 'three';

/**
 * 주어진 너비, 높이, 두께, 코너 반경 및 매끄러움을 기반으로 한 라운드 박스 기하학을 생성하여 반환합니다
 *
 * @param {number} w - 박스의 전체 너비
 * @param {number} h - 박스의 전체 높이
 * @param {number} t - 박스의 두께
 * @param {number} r - 박스의 코너 반경
 * @param {number} s - 코너의 매끄러움을 정의하는 세그먼트 수
 * @return {THREE.BufferGeometry} 라운드 박스 기하학을 나타내는 THREE.BufferGeometry 객체를 반환합니다
 */
export default function roundedBoxGeometry(w, h, t, r, s) {
    const wi = w / 2 - r;		// 내부 너비, 절반
    const hi = h / 2 - r;		// 내부 높이, 절반 
    const w2 = w / 2;			// 너비의 절반
    const h2 = h / 2;			// 높이의 절반

    let ul = r / w;				// 앞면 왼쪽 u 좌표
    let ur = (w - r) / w;		// 앞면 오른쪽 u 좌표
    const vl = r / h;			// 낮은 v 좌표
    const vh = (h - r) / h;	    // 높은 v 좌표
    
    // 각도 및 위치 계산을 위한 변수들
    let phia, phib, xc, yc, uc, vc, cosa, sina, cosb, sinb;
    
    let positions = [];         // 정점 위치 배열
    let uvs = [];               // UV 좌표 배열
    
    // 앞면 및 뒷면 생성
    let t2 = t / 2;			    // 두께의 절반
    let u0 = ul;
    let u1 = ur;
    let u2 = 0;
    let u3 = 1;
    let sign = 1;
        
    for( let k = 0; k < 2; k ++ ) {  // 앞면과 뒷면 생성 루프
         // 앞면 정점 및 UV 좌표 추가
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
            
        // 둥근 코너 정점 및 UV 좌표 추가
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
        
        // 뒷면 정점 및 UV 좌표 추가
        t2 = -t2;       // 두께의 절반을 음수로 변환
        u0 = ur;	    // 앞면과 뒷면의 u 좌표 교환
        u1 = ul;
        u2 = 1;
        u3 = 0;
        sign = -1;
    }
    
    // 프레임 생성
    
    t2 = t / 2;         // 두께의 절반을 다시 양수로 변환
    
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

    // UV 좌표 계산을 위한 원주의 비율
    const cf = 2 * ((w + h - 4 * r) + Math.PI * r); // 원주
    const cc4 = Math.PI * r / 2 / cf  // 원의 원주 / 4 / 전체 원주
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
    const ccs = cc4 / s; // 매끄러움에 따른 부분 값
    
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
        
        u = i < s ? u3 : (i < 2 * s ? u5 : (i < 3 * s ? u7 : u1)); // 앞면과 뒷면의 시작 u 좌표 다름
        
        j = i % s;
        j1 = j + 1;
        
        uvs.push(u + j * ccs, 1,  u + j  * ccs, 0,  u + j1 * ccs, 0);
        uvs.push(u + j * ccs, 1,  u + j1 * ccs, 0,  u + j1 * ccs, 1);
        
        phia = phib;
    }
    
    // BufferGeometry 생성
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array( positions ), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array( uvs ), 2));
    
    // 앞면, 뒷면, 프레임을 위한 멀티 재질 그룹 추가
    const vtc = (6 + 4 * s) * 3;		// 한 면당 정점 수
    geometry.addGroup (0, vtc , 0);
    geometry.addGroup (vtc, vtc , 1);
    geometry.addGroup (2 * vtc, 24 +  2 * 3  *  4 * s, 2);
    
    return geometry;
}