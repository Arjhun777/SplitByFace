import faceApi from "../loadModules";

export function singleFaceDetectionWithImage(file:Blob) {
    return new Promise(async (resolve, reject) => {
        const actualImage = await faceApi.bufferToImage(file);
        const singleFaceDetection = await faceApi.detectSingleFace(actualImage).withFaceLandmarks().withFaceDescriptor();
        resolve({ actualImage, singleFaceDetection });
    })
}

export async function renderSingleImageWithFaceCanvas(trainedSet: any, actualImage: any) {
    const faceMatcher = new faceApi.FaceMatcher(trainedSet, 0.6);
    const displaySize = {width: actualImage.width, height: actualImage.height};
    const container = document.getElementById('display-image');
    container.append(actualImage);
    const canvas = faceApi.createCanvasFromMedia(actualImage);
    container.append(canvas);
    faceApi.matchDimensions(canvas, displaySize);
    const allFaceDetection = await faceApi.detectAllFaces(actualImage).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceApi.resizeResults(allFaceDetection, displaySize);
    const results = resizedDetections.map(d => {
        return faceMatcher.findBestMatch(d.descriptor)
    })
    results.map((result:any, i:number) => {
        if (result) {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceApi.draw.DrawBox(box, { label: result.label });
            drawBox.draw(canvas);
        }
    })
}

export const matchFacesBy = (allFaceDetection:any, file:File, faceMatcher:any, finalResult: any, duplicate:Boolean) => {
    const localFinalResult:any = {};
    for (let index = 0; index < allFaceDetection.length; index++) {
        const faceDetection = allFaceDetection[index];
        const result = faceMatcher.findBestMatch(faceDetection?.descriptor);
        localFinalResult[result.label] = {
            result,
            file
        }
        if (result.label !== 'unknown') {
            localFinalResult['unknown'] = {};
            if (!duplicate) break;
        }
        
    }
    finalResult.push(localFinalResult);
    // setFinalResult(finalResult);
    console.log(finalResult);
    return finalResult;
}

export function detectAllFaceFromFiles(file:File, faceMatcher:any, finalResult:any, duplicate:Boolean) {
    return new Promise(async (resolve, reject) => {
        const actualImage = await faceApi.bufferToImage(file);
        const allFaceDetection = await faceApi.detectAllFaces(actualImage).withFaceLandmarks().withFaceDescriptors();
        resolve(matchFacesBy(allFaceDetection, file, faceMatcher, finalResult, duplicate));
    })
}