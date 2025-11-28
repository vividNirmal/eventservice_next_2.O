"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getRequest, postRequest } from "@/service/viewService";
import { UploadCloud, X, Trash2, Plus, GripVertical } from "lucide-react";

export default function HeroSectionForm() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [heroes, setHeroes] = useState([]);
  const [newHero, setNewHero] = useState({
    image: "",
    title: "",
    description: "",
    imagePreview: "",
  });
  const [heroErrors, setHeroErrors] = useState({});

  const fetchHeroSection = async () => {
    setLoading(true);
    try {
      const companyId = localStorage.getItem("companyId");
      if (!companyId) {
        toast.error("Company ID not found");
        return;
      }

      const response = await getRequest(`get-hero-section-admin/${companyId}`);

      if (response.status === 1) {
        const section = response.data.heroSection;

        if (section) {
          const heroesWithPreviews = (section.hero || []).map(hero => ({
            ...hero,
            imagePreview: hero.imageUrl || hero.image,
            imageFile: undefined
          }));
          setHeroes(heroesWithPreviews);
        } else {
          setHeroes([]);
        }
      } else {
        toast.error(response.message || "Failed to fetch hero section");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch hero section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const handleSave = async () => {
    if (heroes.length === 0) {
      toast.error("Please add at least one hero section");
      return;
    }

    setSaving(true);
    try {
      const companyId = localStorage.getItem("companyId") || "";

      const formData = new FormData();
      formData.append("companyId", companyId);

      // Append existing heroes (without files)
      const existingHeroes = heroes.map(hero => ({
        image: hero.image,
        title: hero.title,
        description: hero.description,
        _id: hero._id
      }));
      formData.append("existingHeroes", JSON.stringify(existingHeroes));

      // Append hero images
      heroes.forEach((hero, index) => {
        if (hero.imageFile) {
          formData.append(`heroImages`, hero.imageFile);
          formData.append(`heroImageIndexes`, index.toString());
        }
      });

      const response = await postRequest("save-hero-section", formData);

      if (response.status === 1) {
        toast.success(response.message || "Hero section saved successfully!");
        await fetchHeroSection();
      } else {
        toast.error(response.message || "Failed to save hero section");
      }
    } catch (error) {
      console.error("Failed to save hero section:", error);
      toast.error("Failed to save hero section.");
    } finally {
      setSaving(false);
    }
  };

  const handleHeroImageUpload = (file, isNewHero = false, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isNewHero) {
        setNewHero(prev => ({
          ...prev,
          imagePreview: reader.result,
          imageFile: file,
        }));
      } else if (index !== undefined) {
        const updatedHeroes = [...heroes];
        updatedHeroes[index] = {
          ...updatedHeroes[index],
          imagePreview: reader.result,
          imageFile: file,
        };
        setHeroes(updatedHeroes);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateNewHero = () => {
    const errors = {};
    
    if (!newHero.imagePreview && !newHero.image) {
      errors.image = "Image is required";
    }
    if (!newHero.title || newHero.title.trim() === "") {
      errors.title = "Title is required";
    }
    if (!newHero.description || newHero.description.trim() === "") {
      errors.description = "Description is required";
    }

    setHeroErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddHero = () => {
    if (!validateNewHero()) {
      toast.error("Please fill all hero fields");
      return;
    }

    setHeroes([...heroes, newHero]);
    setNewHero({ image: "", title: "", description: "", imagePreview: "" });
    setHeroErrors({});
    // toast.success("Hero section added");
  };

  const handleRemoveHero = (index) => {
    const updatedHeroes = heroes.filter((_, i) => i !== index);
    setHeroes(updatedHeroes);
    // toast.success("Hero section removed");
  };

  const handleRemoveNewHeroImage = () => {
    setNewHero(prev => ({
      ...prev,
      imagePreview: "",
      imageFile: undefined,
    }));
  };

  const handleRemoveHeroImage = (index) => {
    const updatedHeroes = [...heroes];
    updatedHeroes[index] = {
      ...updatedHeroes[index],
      imagePreview: "",
      imageFile: undefined,
      image: "",
    };
    setHeroes(updatedHeroes);
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
        <CardTitle>Hero Sections</CardTitle>
        <CardDescription className={"hidden"}>
          Manage your company's hero sections with images, titles, and descriptions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Heroes Section */}
          <div className="space-y-2">
            <Label>Hero Sections {heroes.length > 0 && `(${heroes.length})`}</Label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Existing Heroes */}
              {heroes.map((hero, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 z-10"
                      onClick={() => handleRemoveHero(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-3">
                      {/* Hero Image */}
                      <div>
                        <Label className="text-xs">Image</Label>
                        <label
                          htmlFor={`hero-image-${index}`}
                          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                        >
                          {hero.imagePreview || hero.imageUrl || hero.image ? (
                            <div className="relative group w-full h-full flex items-center justify-center p-2">
                              <img
                                src={hero.imagePreview || hero.imageUrl || hero.image}
                                alt={hero.title}
                                className="max-h-full max-w-full object-contain rounded-md"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveHeroImage(index);
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                              <p className="text-xs text-gray-500">Upload image</p>
                            </div>
                          )}
                          <input
                            id={`hero-image-${index}`}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroImageUpload(file, false, index);
                            }}
                          />
                        </label>
                      </div>

                      {/* Hero Title */}
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          placeholder="Enter title"
                          value={hero.title}
                          onChange={(e) => {
                            const updatedHeroes = [...heroes];
                            updatedHeroes[index] = { ...hero, title: e.target.value };
                            setHeroes(updatedHeroes);
                          }}
                        />
                      </div>

                      {/* Hero Description */}
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          placeholder="Enter description"
                          rows={3}
                          value={hero.description}
                          onChange={(e) => {
                            const updatedHeroes = [...heroes];
                            updatedHeroes[index] = { ...hero, description: e.target.value };
                            setHeroes(updatedHeroes);
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Hero Card */}
              <Card className="border-dashed border-2 hover:border-gray-400 transition-colors">
                <CardContent className="p-4 h-full">
                  <div className="space-y-3">
                    {/* New Hero Image */}
                    <div>
                      <Label className="text-xs">Image *</Label>
                      <label
                        htmlFor="new-hero-image"
                        className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        {newHero.imagePreview ? (
                          <div className="relative group w-full h-full flex items-center justify-center p-2">
                            <img
                              src={newHero.imagePreview}
                              alt="New hero"
                              className="max-h-full max-w-full object-contain rounded-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveNewHeroImage();
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <UploadCloud className="w-6 h-6 mb-2 text-gray-500" />
                            <p className="text-xs text-gray-500">Upload image</p>
                          </div>
                        )}
                        <input
                          id="new-hero-image"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleHeroImageUpload(file, true);
                          }}
                        />
                      </label>
                      {heroErrors.image && (
                        <p className="text-red-500 text-xs mt-1">{heroErrors.image}</p>
                      )}
                    </div>

                    {/* New Hero Title */}
                    <div>
                      <Label htmlFor="new-hero-title" className="text-xs">Title *</Label>
                      <Input
                        id="new-hero-title"
                        placeholder="Enter hero title"
                        value={newHero.title || ""}
                        onChange={(e) => setNewHero({ ...newHero, title: e.target.value })}
                        className={heroErrors.title ? "border-red-500" : ""}
                      />
                      {heroErrors.title && (
                        <p className="text-red-500 text-xs mt-1">{heroErrors.title}</p>
                      )}
                    </div>

                    {/* New Hero Description */}
                    <div>
                      <Label htmlFor="new-hero-description" className="text-xs">Description *</Label>
                      <Textarea
                        id="new-hero-description"
                        placeholder="Enter hero description"
                        rows={3}
                        value={newHero.description || ""}
                        onChange={(e) => setNewHero({ ...newHero, description: e.target.value })}
                        className={heroErrors.description ? "border-red-500" : ""}
                      />
                      {heroErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{heroErrors.description}</p>
                      )}
                    </div>

                    {/* Add Hero Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddHero}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hero Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || heroes.length === 0}
              className="min-w-32"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                "Save Hero Sections"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}