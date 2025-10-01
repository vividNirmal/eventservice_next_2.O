"use client";
import React, { useEffect, useState } from "react";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";

const Setting = () => {
  const [Imgurl, setImgurl] = useState(null);
  const [blogImage, setBlogImage] = useState(null);
  const [loader, setLoader] = useState(false);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const companyid = localStorage.getItem("companyId");

    if (companyid) {
      fetchCompany(companyid);
      setLoader(true);
    }
  }, []);

  async function fetchCompany(companyid) {
    setCompanyId(companyid);
    const res = await getRequest(`get-company-details/${companyid}`);

    if (res.status == 1) {
      const logo = res.data?.company?.logo || null;
      setImgurl(logo);
      setLoader(false);

      if (logo) {
        const existingCompany = JSON.parse(
          localStorage.getItem("companyDetails") || "{}"
        );
        const updatedCompany = {
          ...existingCompany,
          logo: logo,
        };
        localStorage.setItem("companyDetails", JSON.stringify(updatedCompany));
      }
    }
  }

  const onEventImageSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImgurl(e.target.result);
      setBlogImage(file);
    };
    reader.readAsDataURL(file);
  };

  const onsubmit = async () => {
    if (!blogImage) {
      toast.error("Please upload a logo.");
      return;
    }

    if (!companyId) {
      toast.error("Company not found.");
      return;
    }

    setLoader(true);
    const formData = new FormData();
    formData.append("company_id", companyId);
    formData.append("logo", blogImage);
    const responce = await postRequest("update-company-logo", formData);

    if (responce.status == 1) {
      setLoader(false);
      toast.success(responce.message);
      //   window.location.reload()
    } else {
      setLoader(false);
      toast.error(responce.message);
    }
  };

  function handleRemoveImage() {
    setImgurl(null); // Clear the preview
  }
  return (
    <>
      <div className="max-h-full flex-grow">
        <div className="w-full bg-white  border-[#F8F9FF] rounded-3xl p-4 md:p-6 md:py-8">
          <div className="flex flex-col max-h-[calc(100vh_-_15.7rem)] overflow-auto pr-5 pb-4">
            <form className="flex-shrink-0">
              <div className="flex flex-wrap gap-5">
                <div className="w-full md:w-1/4 flex-grow flex flex-col">
                  <label className="text-slate-600 pl-1 block mb-1 text-sm md:text-base">
                    Logo
                  </label>

                  <div className="w-full flex-grow">                  
                    <label
                      htmlFor="logo"
                      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 `}
                    >
                      {Imgurl ? (
                        <div className="relative group w-full h-full flex items-center justify-center p-2">
                          <img
                            src={Imgurl || "/placeholder.svg"}
                            alt={`Banner Preview`}
                            className="max-w-full max-h-full object-contain border rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-xs text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            SVG, PNG, JPG or GIF (MAX. 800x400px)
                          </p>
                        </div>
                      )}
                      <input
                        id="logo"
                        type="file"
                        className="hidden"
                        onChange={onEventImageSelected}
                        name="logo"
                      />
                    </label>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      className="px-8 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 transition"
                      onClick={onsubmit}
                      disabled={loader}
                    >
                      {loader ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setting;
