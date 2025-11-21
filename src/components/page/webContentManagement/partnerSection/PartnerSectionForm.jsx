"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { UploadCloud, X, Trash2, Plus } from "lucide-react";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
});

export default function PartnerSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({
    image: "",
    name: "",
    imagePreview: "",
  });
  const [partnerErrors, setPartnerErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setSaving(true);
      try {
        const companyId = localStorage.getItem("companyId") || "";

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("companyId", companyId);

        // Append existing partners (without files)
        const existingPartners = partners.map(partner => ({
          image: partner.image,
          name: partner.name,
          _id: partner._id
        }));
        formData.append("existingPartners", JSON.stringify(existingPartners));

        // Append partner images
        partners.forEach((partner, index) => {
          if (partner.imageFile) {
            formData.append(`partnerImages`, partner.imageFile);
            formData.append(`partnerImageIndexes`, index.toString());
          }
        });

        const response = await postRequest("save-partner-section", formData);

        if (response.status === 1) {
          toast.success(response.message || "Partner section saved successfully!");
          await fetchPartnerSection();
        } else {
          toast.error(response.message || "Failed to save partner section");
        }
      } catch (error) {
        console.error("Failed to save partner section:", error);
        toast.error("Failed to save partner section.");
      } finally {
        setSaving(false);
      }
    },
  });

  const fetchPartnerSection = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      const response = await getRequest(`get-partner-section/${companyId}`);

      if (response.status === 1) {
        const section = response.data.partnerSection;

        if (section) {
          formik.setValues({
            title: section.title || "",
          });
        
          const partnersWithPreviews = (section.partners || []).map(partner => ({
            ...partner,
            imagePreview: partner.imageUrl || partner.image,
            imageFile: undefined
          }));
        
          setPartners(partnersWithPreviews);
        } else {
          formik.resetForm();
          setPartners([]);
        }
      } else {
        toast.error(response.message || "Failed to fetch partner section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch partner section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerSection();
  }, []);

  const handlePartnerImageUpload = (file, isNewPartner = false, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isNewPartner) {
        setNewPartner(prev => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file,
        }));
      } else if (index !== undefined) {
        const updatedPartners = [...partners];
        updatedPartners[index] = {
          ...updatedPartners[index],
          imagePreview: reader.result,
          imageFile: file,
        };
        setPartners(updatedPartners);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateNewPartner = () => {
    const errors = {};
    
    if (!newPartner.imagePreview && !newPartner.image) {
      errors.image = "Image is required";
    }
    if (!newPartner.name || newPartner.name.trim() === "") {
      errors.name = "Partner name is required";
    }

    setPartnerErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPartner = () => {
    if (!validateNewPartner()) {
      toast.error("Please fill all partner fields");
      return;
    }

    setPartners([...partners, newPartner]);
    setNewPartner({ image: "", name: "", imagePreview: "" });
    setPartnerErrors({});
    formik.setFieldTouched("title", true);
    toast.success("Partner added");
  };

  const handleRemovePartner = (index) => {
    const updatedPartners = partners.filter((_, i) => i !== index);
    setPartners(updatedPartners);
    formik.setFieldTouched("title", true);
    toast.success("Partner removed");
  };

  const handleRemoveNewPartnerImage = () => {
    setNewPartner(prev => ({
      ...prev,
      imagePreview: "",
      imageFile: undefined,
    }));
  };

  const handleRemovePartnerImage = (index) => {
    const updatedPartners = [...partners];
    updatedPartners[index] = {
      ...updatedPartners[index],
      imagePreview: "",
      imageFile: undefined,
      image: "",
    };
    setPartners(updatedPartners);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="px-0">
        <CardTitle>Partner Section</CardTitle>
        <CardDescription className={"hidden"}>
          Manage your company's partner section with title and partner logos.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <div className="relative">
                <Input
                  id="title"
                  name="title"
                  type="text"
                  maxLength={250}
                  placeholder="Enter partner section title (e.g., Our Trusted Partners)"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={formik.touched.title && formik.errors.title ? "border-red-500" : ""}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-red-500 text-sm absolute">{formik.errors.title}</p>
                )}
              </div>
            </div>

            {/* Partners Section */}
            <div className="space-y-2">
              <Label>Partners {partners.length > 0 && `(${partners.length})`}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Existing Partners */}
                {partners.map((partner, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="p-4">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 z-10"
                        onClick={() => handleRemovePartner(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="space-y-3">
                        {/* Partner Image */}
                        <div>
                          <Label className="text-xs">Logo</Label>
                          <label
                            htmlFor={`partner-image-${index}`}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                          >
                            {partner.imagePreview || partner.imageUrl || partner.image ? (
                              <div className="relative group w-full h-full flex items-center justify-center p-2">
                                <img
                                  src={partner.imagePreview || partner.imageUrl || partner.image}
                                  alt={partner.name}
                                  className="max-h-full max-w-full object-contain rounded-md"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemovePartnerImage(index);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center">
                                <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                                <p className="text-xs text-gray-500">Upload logo</p>
                              </div>
                            )}
                            <input
                              id={`partner-image-${index}`}
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePartnerImageUpload(file, false, index);
                              }}
                            />
                          </label>
                        </div>

                        {/* Partner Name */}
                        <div>
                          <Label className="text-xs">Partner Name</Label>
                          <Input
                            placeholder="Enter partner name"
                            value={partner.name}
                            onChange={(e) => {
                              const updatedPartners = [...partners];
                              updatedPartners[index] = { ...partner, name: e.target.value };
                              setPartners(updatedPartners);
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Partner Card */}
                <Card className="border-dashed border-2 hover:border-gray-400 transition-colors">
                  <CardContent className="p-4 h-full">
                    <div className="space-y-3">
                      {/* New Partner Image */}
                      <div>
                        <Label className="text-xs">Logo *</Label>
                        <label
                          htmlFor="new-partner-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          {newPartner.imagePreview ? (
                            <div className="relative group w-full h-full flex items-center justify-center p-2">
                              <img
                                src={newPartner.imagePreview}
                                alt="New partner"
                                className="max-h-full max-w-full object-contain rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveNewPartnerImage();
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                              <p className="text-xs text-gray-500">Upload logo</p>
                            </div>
                          )}
                          <input
                            id="new-partner-image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePartnerImageUpload(file, true);
                            }}
                          />
                        </label>
                        {partnerErrors.image && (
                          <p className="text-red-500 text-xs mt-1">{partnerErrors.image}</p>
                        )}
                      </div>

                      {/* New Partner Name */}
                      <div>
                        <Label htmlFor="new-partner-name" className="text-xs">Partner Name *</Label>
                        <Input
                          id="new-partner-name"
                          placeholder="Enter partner name"
                          value={newPartner.name || ""}
                          onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                          className={partnerErrors.name ? "border-red-500" : ""}
                        />
                        {partnerErrors.name && (
                          <p className="text-red-500 text-xs mt-1">{partnerErrors.name}</p>
                        )}
                      </div>

                      {/* Add Partner Button */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddPartner}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Partner
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !formik.dirty}
                className="min-w-32"
                size="lg"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Partner Section"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}