import React, { useState } from "react";
import FaceScanner from "../../scanner/mediabutton/faceScanner/FaceScanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2, ScanFace, UploadIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function FaceScannerFrom({faceDate}) {
  const [stopScanner, setStopScanner] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [faceScannerPopup, setFaceScannerPopup] = useState(false);  
  const [face,setFace] = useState(null)

  function onCameraError(Data) {
    toast.error(Data);
  }
  
  const onEventImageSelected = (event) => {
    const inputElement = event.target;
    const allowedExtensions = ["image/png", "image/jpeg", "image/jpg"];

    if (inputElement.files && inputElement.files.length > 0) {
      const file = inputElement.files[0];

      if (!allowedExtensions.includes(file.type)) {
        toast.error("Only PNG and JPG files are allowed.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target.result);
        setFace(file)
        setFaceImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const faceScannerData = async (event) => {
    try {
      console.log("🎯 faceScannerData called with event:", event);
      const image = event?.image;
      if (!image) {
        console.log("❌ No image in event");
        return;
      }

      console.log("📸 Face captured, processing image...");
      setFaceImage(image);

      // Trigger face verification immediately when manually captured
      console.log("📸 Image captured, starting verification...");
      await handleScanFace(image);
    } catch (error) {
      console.error(
        "Error processing image:",
        error,
        event.image?.slice?.(0, 60) + "..."
      );
    }
  };

  const handleScanFace = async (imageData = null) => {
    const imageToProcess = imageData || faceImage;

    if (!imageToProcess) {
      setFaceError(true);
      toast.error(
        "Please position your face in the camera to capture an image"
      );
      return;
    }

    let faceImageFile;
    try {
      // Convert image data to File object
      if (
        imageToProcess.startsWith("blob:") ||
        imageToProcess.startsWith("http")
      ) {
        const resp = await fetch(imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", {
          type: blob.type || "image/png",
        });
      } else if (imageToProcess.startsWith("data:")) {
        try {
          const resp = await fetch(imageToProcess);
          const blob = await resp.blob();
          faceImageFile = new File([blob], "faceImage.png", {
            type: blob.type || "image/png",
          });
        } catch (fetchErr) {
          const match = imageToProcess.match(/^data:(.+);base64,(.*)$/);
          if (!match) throw fetchErr;
          const mime = match[1];
          const base64 = match[2].replace(/\s/g, "");
          const binary = atob(base64);
          const u8 = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) u8[i] = binary.charCodeAt(i);
          const blob = new Blob([u8], { type: mime });
          faceImageFile = new File([blob], "faceImage.png", { type: mime });
        }
      } else {
        const resp = await fetch("data:image/png;base64," + imageToProcess);
        const blob = await resp.blob();
        faceImageFile = new File([blob], "faceImage.png", {
          type: "image/png",
        });
      }      
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error("Failed to process image. Please try again.");
      return;
    }
    if (faceImageFile) {
      const url = URL.createObjectURL(faceImageFile); // create temporary preview URL
      setCapturedImage(url);
      setFaceScannerPopup(false);      
      setStopScanner(true); 
      setFace(faceImageFile)
    }
  };

  function handleNextScanner() {
    faceDate(face)
  }
  return (
    <div className="flex flex-wrap gap-y-5 p-4 bg-[#f7f9fc]">
      <div className="w-1/3 relative rounded-2xl max-h-[calc(100svh_-_32px)] overflow-hidden hidden lg:block">
        <img src="/assets/images/login-img.webp" className="max-w-full w-full object-cover h-svh transition-all duration-100 ease-linear" alt="" />
        <div className="absolute bottom-0 left-0 right-0 p-4 m-4 rounded-lg bg-white/10 backdrop-blur-lg border border-solid border-white/15">
          <p className="z-1 text-white text-base 2xl:text-lg font-normal leading-normal">Lorem ipsum dolor sit amet, consectetur adipisicing elit it amet, consectetur adipisicing eli. Laboriosam veritatis nihil repudiandae.</p>
        </div>
      </div>
      <div className="w-2/5 grow px-9 max-h-svh flex flex-col justify-center gap-6">
        <div className="flex flex-col w-full mt-6 p-6 max-w-2xl mx-auto rounded-2xl">
          <h4 className="text-xl font-bold text-slate-800 flex justify-center items-center gap-2 mb-4">
            <Camera className="size-6 text-blue-600" />
            Face Verification
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-5">
            <Button type="button" onClick={() => setFaceScannerPopup(true)} className="!size-48 cursor-pointer px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 !text-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform">
              <Camera className="size-5 mr-2" />
              Capture Face
            </Button>
            <Label htmlFor="event_image" type="button" className="size-48 cursor-pointer flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-md relative shadow-lg hover:shadow-xl transition-all duration-300 transform">
              <UploadIcon className="size-5" />
              Upload Image
              <input type="file" id="event_image" className="opacity-0 absolute left-0 top-0 w-full h-full cursor-pointer" accept=".jpg, .jpeg, .png" onChange={onEventImageSelected} />
            </Label>
          </div>
          {capturedImage && stopScanner && (
            <div className="my-4 p-4 bg-white rounded-xl border border-[]">
              <img src={capturedImage} alt="Captured" className="rounded-lg shadow-lg" />
              <p className="text-base font-medium text-green-600 mt-4 flex items-center gap-2">
                <CheckCircle2 className="size-5" />
                Image captured successfully
              </p>
            </div>
          )}
          <Button type="button" variant={"formBtn"} className={'ml-auto w-20'} onClick={handleNextScanner}>Next</Button>
        </div>
        <Dialog open={faceScannerPopup} onOpenChange={() => setFaceScannerPopup(false)}>
          <DialogTitle className={'sr-only'}>Face Scanner</DialogTitle>
          <DialogContent className="sm:max-w-[425px] p-0 flex-col">
            <FaceScanner
              allowScan={stopScanner}
              onCameraError={onCameraError}
              onManualCapture={faceScannerData}
            />          
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
