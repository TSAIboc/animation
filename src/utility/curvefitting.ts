import * as THREE from 'three';

type Curve = {
    vector3D: THREE.Vector3[];
    distance: number;
}

export const curvefit = (features: THREE.Vector3[], numbers: number = 1000, power: number = 3): Curve => {
    let order = power + 1;
    let numbers_control = features.length - 1;
    let points = new Array(features.length).fill([]);
    points.forEach((el, index) => {
        points[index] = [features[index].x, features[index].y, features[index].z];
    });

    let U = new Array(order).fill(0);
    for (let i = 1; i <= numbers_control - power; i++)
        U.push(i);
    let Ul = U[U.length - 1];
    for (let i = 0; i < order; i++)
        U.push(Ul + 1);

    let T = new Array(U.length).fill(0);
    T.forEach((el, index) => {
        T[index] = U[index] / U[numbers_control + power];
    })

    let total = 0;
    for (let i = 1; i <= power; ++i)
        total += i;

    let buffers: number[][] | undefined = [];
    for (let i = 0; i < numbers + 1; ++i) {
        buffers.push([]);
    }

    let P: number[][][] | undefined = [];
    for (let i = 0; i < order; i++) {
        P.push([]);
        for (let j = 0; j < order; ++j) {
            P[i].push([]);
        }
    }

    let count = 0;
    let buffersi = 0;
    let curvePoints: THREE.Vector3[] = [];
    let distance = 0;
    for (let u = 0; u <= 1; u += 1 / numbers) {
        for (let i = 0; i < T.length; ++i) {
            if (T[i] <= u && u < T[i + 1]) {
                let l = i;
                let k = power;
                for (let m = l; m >= l - order + 1; m--) {
                    for (let n = 0; n < 3; n++) {
                        P[0][k].push(points[m][n]);
                    }
                    k--;
                }
            }
        }
        let pf = 1, ps = 1;
        for (let i = 0; i < T.length; ++i) {
            if (T[i] <= u && u < T[i + 1]) {
                let l = i;
                for (let j = 1; j <= power; ++j) {
                    for (let k = j; k <= power; ++k) {
                        let ti = l + k - power;
                        let _a = (u - T[ti]);
                        let _b = (T[ti + order - j] - T[ti]);
                        let _alpha = _a / _b;

                        P[pf][ps].push(_alpha * P[j - 1][k][0] + (1 - _alpha) * P[j - 1][k - 1][0]);
                        P[pf][ps].push(_alpha * P[j - 1][k][1] + (1 - _alpha) * P[j - 1][k - 1][1]);
                        P[pf][ps].push(_alpha * P[j - 1][k][2] + (1 - _alpha) * P[j - 1][k - 1][2]);

                        buffers[buffersi].push(P[pf][ps][0]);
                        buffers[buffersi].push(P[pf][ps][1]);
                        buffers[buffersi].push(P[pf][ps][2]);
                        ++ps;
                    }
                    ps = j + 1;
                    ++pf;
                }
                ++buffersi;
            }
        }
        curvePoints.push(new THREE.Vector3(
            buffers[count][total * 3 - 3],
            buffers[count][total * 3 - 2],
            buffers[count][total * 3 - 1]
        ));
        if (curvePoints.length > 1) {
            let v1 = curvePoints[count - 1] as THREE.Vector3;
            let v2 = curvePoints[count] as THREE.Vector3;
            distance += v1.distanceTo(v2);
        }
        count++;
        for (let i = 0; i < order; ++i) {
            for (let j = 0; j < order; ++j) {
                P[i][j] = [];
            }
        }
    }
    curvePoints.push(features[features.length - 1]);
    buffers = undefined, P = undefined;
    let samples = sampleAverage(curvePoints);
    return {
        vector3D: samples,
        distance: distance
    };
}

const _findShortest = (points: THREE.Vector3[]) => {
    let distance = Infinity;
    for (let i = 0; i < points.length - 1; i++) {
        let d = points[i].distanceTo(points[i + 1]);
        if (d < distance) {
            distance = d;
        }
    }
    return distance;
}
  
const sampleAverage = (points: THREE.Vector3[]) => {
    let shortest = _findShortest(points);
    let newPoints: THREE.Vector3[] = [];
    for (let i = 0; i < points.length - 1; i++) {
        let start = points[i];
        let end = points[i + 1];
        newPoints.push(start);
        let distance = start.distanceTo(end);
        if (distance > shortest) {
            let interval = (Math.round(distance / shortest));
            if (interval == 1) ++interval;
            let alpha = 1 / interval;
            for (let j = alpha; j < 1; j += alpha) {
                let point = new THREE.Vector3().lerpVectors(start, end, j);
                newPoints.push(point);
            }
        }
    }
    newPoints.push(points[points.length - 1]);
    return newPoints;
} 