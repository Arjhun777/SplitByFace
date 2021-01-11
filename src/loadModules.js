import * as faceApi from 'face-api.js';

export const loadModules = () => {
    return Promise.all([
        faceApi.nets.faceRecognitionNet.loadFromUri('/src/models'),
        faceApi.nets.faceLandmark68Net.loadFromUri('/src/models'),
        faceApi.nets.ssdMobilenetv1.loadFromUri('/src/models')
    ])
}

export default faceApi