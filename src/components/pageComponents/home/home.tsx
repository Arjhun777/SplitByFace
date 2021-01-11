import React, { useState } from "react";
import { Button, Input } from '@material-ui/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import faceApi from "../../../loadModules";
import { matchFacesBy, singleFaceDetectionWithImage } from "../../../utils/helpers";

interface HomeProps {
    history: History
}

const Home = (props:HomeProps) => {

    const [checkPoint, setCheckPoint] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        faceData: [],
        actualImages: []
    });
    const [submitDisable, setSubmitDisable] = useState(true);
    const [trainComplete, setTrainComplete] = useState(false);
    const [trainedSet, setTrainedSet] = useState([]);
    // const [imageToCheck, setImagesToCheck] = useState([]);
    const [finalResult, setFinalResult] = useState([]);
    const [duplicate, setDuplicate] = useState(false);

    const handleCompareImage = async (event:any) => {
        const { files } = event.target;
        setSubmitDisable(true);
        let actualImages:any = [];
        let faceDetections:any = [];
        for (let index = 0; index < files?.length; index++) {
            const file = files[index];
            const result:any = await singleFaceDetectionWithImage(file)
            if (result.singleFaceDetection) {
                actualImages.push(result.actualImage);
                faceDetections.push(result.singleFaceDetection?.descriptor);
            }
        }
        setFormData({ ...formData, faceData: faceDetections, actualImages: actualImages });
        setSubmitDisable(false);
    }

    const handleNameChange = (event:any) => {
        const { value } = event.target;
        setFormData({ ...formData, name: value });
    }

    const handleSubmit = (event:any) => {
        event.preventDefault();
        checkPoint.push(formData);
        setCheckPoint(checkPoint);
        setFormData({
            name: '',
            faceData: [],
            actualImages: []
        });
    }
    
    const handleTrain = () => {
        setTrainComplete(false);
        new Promise((resolve, reject) => {
            const labeledFaceDescriptors = checkPoint.map((data) => {
                return new faceApi.LabeledFaceDescriptors(data.name, data.faceData);
            });
            resolve(labeledFaceDescriptors);
        }).then((data:any) => {
            setTrainedSet(data);
            setTrainComplete(true);
        }).catch(err => {
            console.error(err);
        })
    }

    
    const handleImageChange = (event:any) => {
        const { files } = event.target;
        handleFiles(files);
    }

    const handleFiles = async (files:FileList) => {
        const faceMatcher:any = new faceApi.FaceMatcher(trainedSet, 0.45);
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const actualImage = await faceApi.bufferToImage(file);
            const allFaceDetection = await faceApi.detectAllFaces(actualImage).withFaceLandmarks().withFaceDescriptors();
            const finalDataSet = matchFacesBy(allFaceDetection, file, faceMatcher, finalResult, duplicate);
            setFinalResult(finalDataSet);
        }
        makeZip();
    }

    const makeZip = () => {
        var zip = new JSZip();
        finalResult.map((result) => {
            Object.keys(result).map((name) => {
                const file = result[name].file;
                if (file) {
                    let imageFolder = zip.folder(name);
                    imageFolder.file(file.name, file);
                }
            })
        })
        zip.generateAsync({type: "blob"}).then((content) => {
            saveAs(content, 'split-images.zip');
        })
    }

    // const matchFacesInImages = () => {
    //     const faceMatcher = new faceApi.FaceMatcher(trainedSet, 0.6);
    //     imageToCheck.map(image => {
    //         const result = faceMatcher.findBestMatch(image.descriptor);
    //         console.log(result)
    //     })
    // }

    return (
        <React.Fragment>
            <div className="form-container">
                <div className="form-title">Upload Known Faces to split</div>
                <form onSubmit={handleSubmit}>
                    <Input type="text" onChange={handleNameChange} placeholder="Enter The Name" value={formData.name} />
                    <Button variant="contained" component="label" onChange={handleCompareImage} >
                        Upload Known Face
                        <input type="file" multiple style={{ display: "none" }}/>
                    </Button>
                    <Button color="primary" type="submit" disabled={submitDisable}>ADD</Button>
                </form>
                <Button color="secondary" type="submit" onClick={() => setDuplicate(!duplicate)}>Allow Duplicates</Button>
                {duplicate ? 
                    <div className="duplicate-warining">Allowing duplicates may increase in size</div> 
                : ''}
            </div>
            {/* Form data display */}
            <div className="check-point-wrapper">
                <div className="form-display-container">
                    {checkPoint.map((imgData, index) => (
                        <div className="image-name-wrapper" key={index}>
                            <img src={imgData?.actualImages[0]?.src ? imgData?.actualImages[0].src : null} />
                            <div>{imgData?.name}</div>
                        </div>
                    ))}
                </div>
                {checkPoint?.length ? 
                    <Button className="start-action" color="primary" variant="contained" onClick={handleTrain}>START</Button>
                : ''}
            </div>
            {/* Image to split upload */}
            {trainComplete ?
                <div className="image-to-split-wrapper">
                    <div>Upload All Your Images That needs to Split</div>
                    <Button color="secondary" variant="contained" component="label" onChange={handleImageChange} >
                        Upload File
                        <input type="file" multiple style={{ display: "none" }}></input>
                    </Button>
                    
                    {/* <button onClick={matchFacesInImages}>check</button> */}
                </div> 
            : ''}
            <div id="display-image"></div>
        </React.Fragment>
    )
}

export default Home;