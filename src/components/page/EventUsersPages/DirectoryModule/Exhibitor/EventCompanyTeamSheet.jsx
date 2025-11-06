"use client";
import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { getRequest, postRequest, updateRequest } from "@/service/viewService";

const EventCompanyTeamSheet = ({
  open,
  onOpenChange,
  member,
  isCreating,
  onSuccess,
}) => {
  const initialFormData = {
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    pan_no: "",
    ownership: "",
    birth_date: "",
    gender: "",
    address_line1: "",
    address_line2: "",
    pincode: "",
    country: "", // Will store country ID
    state: "",   // Will store state ID
    city: "",    // Will store city ID
  };

  const [formData, setFormData] = useState(initialFormData);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [panCardFile, setPanCardFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  // Location data states
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Get exhibitor ID from localStorage
  const getExhibitorId = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('loginuser');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed._id;
      }
    }
    return null;
  };

  // Fetch countries on component mount
  useEffect(() => {
    if (open) {
      fetchCountries();
    }
  }, [open]);

  // Initialize form data when sheet opens
  useEffect(() => {
    if (open && countries.length > 0) {
      initializeFormData();
    }
  }, [member, isCreating, open, countries.length]);

  const fetchCountries = async () => {
    try {
      const response = await getRequest("get-country");
      if (response.status === 1 && response.data?.country) {
        setCountries(response.data.country);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
    }
  };

  const fetchStates = async (countryId, shouldSetValue = true) => {
    try {
      setLoadingLocations(true);
      const response = await getRequest(`get-state/${countryId}`);
      if (response.status === 1 && response.data?.state) {
        setStates(response.data.state);
        if (!shouldSetValue) {
          // Clear state and city when country changes
          setFormData(prev => ({ ...prev, state: "", city: "" }));
          setCities([]);
        }
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error("Failed to load states");
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchCities = async (stateId, shouldSetValue = true) => {
    try {
      setLoadingLocations(true);
      const response = await getRequest(`get-city/${stateId}`);
      if (response.status === 1 && response.data?.city) {
        setCities(response.data.city);
        if (!shouldSetValue) {
          // Clear city when state changes
          setFormData(prev => ({ ...prev, city: "" }));
        }
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error("Failed to load cities");
    } finally {
      setLoadingLocations(false);
    }
  };

  const initializeFormData = async () => {
    if (member && !isCreating) {
      // Edit mode - populate with existing data
      const newFormData = {
        first_name: member.first_name || "",
        last_name: member.last_name || "",
        email: member.email || "",
        contact_no: member.contact_no || "",
        pan_no: member.pan_no || "",
        ownership: member.ownership || "",
        birth_date: member.birth_date ? member.birth_date.split('T')[0] : "",
        gender: member.gender || "",
        address_line1: member.address_line1 || "",
        address_line2: member.address_line2 || "",
        pincode: member.pincode || "",
        country: member.country?._id || "", // Use _id for country
        state: member.state?._id || "",     // Use _id for state
        city: member.city?._id || "",  
      };

      setFormData(newFormData);
      // FIX: Use profilePictureUrl if available, fallback to profile_picture
      const profilePicUrl = member.profilePictureUrl || member.profile_picture;
      setPreviewUrl(profilePicUrl || null);

      // Load states and cities if country and state are already set
      if (member.country?._id) {
        await fetchStates(member.country._id, true);
        if (member.state?._id) {
          await fetchCities(member.state._id, true);
        }
      }
    } else {
      // Create mode - reset form
      setFormData(initialFormData);
      setPreviewUrl(null);
      setStates([]);
      setCities([]);
    }
    setProfilePictureFile(null);
    setPanCardFile(null);
    setErrors({});
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (value) => {
    handleFieldChange("country", value);
    if (value) {
      fetchStates(value, false);
    } else {
      setStates([]);
      setCities([]);
      setFormData(prev => ({ ...prev, state: "", city: "" }));
    }
  };

  const handleStateChange = (value) => {
    handleFieldChange("state", value);
    if (value) {
      fetchCities(value, false);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: "" }));
    }
  };

  const handleFileChange = (type, file) => {
    if (!file) return;

    const allowedImageTypes = ["image/png", "image/jpeg", "image/jpg"];
    const allowedDocTypes = [...allowedImageTypes, "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      toast.error("File size should not exceed 5MB");
      return;
    }

    if (type === "profile_picture") {
      if (!allowedImageTypes.includes(file.type)) {
        toast.error("Profile picture must be PNG or JPG");
        return;
      }
      setProfilePictureFile(file);
      // Create preview URL for image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (type === "pan_card") {
      if (!allowedDocTypes.includes(file.type)) {
        toast.error("PAN card must be PNG, JPG or PDF");
        return;
      }
      setPanCardFile(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.first_name) newErrors.first_name = "First name is required";
    if (!formData.last_name) newErrors.last_name = "Last name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.contact_no) {
      newErrors.contact_no = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_no.replace(/[\s-]/g, ""))) {
      newErrors.contact_no = "Contact number must be 10 digits";
    }
    if (!formData.ownership) newErrors.ownership = "Role is required";
    if (!formData.birth_date) newErrors.birth_date = "Birth date is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.address_line1) newErrors.address_line1 = "Address is required";
    if (!formData.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";

    // PAN validation if provided
    if (formData.pan_no && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_no)) {
      newErrors.pan_no = "Invalid PAN format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const exhibitorId = getExhibitorId();
    if (!exhibitorId) {
      toast.error("Exhibitor ID not found");
      return;
    }

    setSaving(true);
    try {
      const formDataToSend = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      // Add exhibitor ID
      formDataToSend.append('eventUser', exhibitorId);

      // Add files if present
      if (profilePictureFile) {
        formDataToSend.append("profile_picture", profilePictureFile);
      }
      if (panCardFile) {
        formDataToSend.append("pan_card", panCardFile);
      }

      const url = isCreating
        ? "event-company-teams"
        : `event-company-teams/${member._id}`;

      const response = isCreating
        ? await postRequest(url, formDataToSend)
        : await updateRequest(url, formDataToSend);

      if (response.status === 1) {
        toast.success(
          isCreating
            ? "Team member created successfully"
            : "Team member updated successfully"
        );
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.message || "Failed to save team member");
      }
    } catch (error) {
      console.error("Error saving team member:", error);
      toast.error("Failed to save team member");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    return `${formData.first_name?.charAt(0) || ""}${formData.last_name?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {isCreating ? "Add Team Member" : "Edit Team Member"}
          </SheetTitle>
          <SheetDescription>
            {isCreating
              ? "Add a new member to your company team"
              : "Update team member information"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-6 py-4">
            {/* Profile Picture Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                {previewUrl && 
                  <AvatarImage
                    src={previewUrl}
                    alt={`${member.first_name} ${member.last_name}`}
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.target.style.display = 'none';
                    }}
                  />}
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profile-picture" className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 border rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </div>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={(e) => handleFileChange("profile_picture", e.target.files?.[0])}
                    className="hidden"
                  />
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG or JPG (max. 5MB)
                </p>
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleFieldChange("first_name", e.target.value)}
                    className={errors.first_name ? "border-red-500" : ""}
                  />
                  {errors.first_name && (
                    <p className="text-xs text-red-500">{errors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleFieldChange("last_name", e.target.value)}
                    className={errors.last_name ? "border-red-500" : ""}
                  />
                  {errors.last_name && (
                    <p className="text-xs text-red-500">{errors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Birth Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleFieldChange("birth_date", e.target.value)}
                    className={errors.birth_date ? "border-red-500" : ""}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.birth_date && (
                    <p className="text-xs text-red-500">{errors.birth_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleFieldChange("gender", value)}
                  >
                    <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs text-red-500">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.ownership}
                  onValueChange={(value) => handleFieldChange("ownership", value)}
                >
                  <SelectTrigger className={errors.ownership ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
                {errors.ownership && (
                  <p className="text-xs text-red-500">{errors.ownership}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Contact Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_no">
                  Contact Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contact_no"
                  value={formData.contact_no}
                  onChange={(e) => handleFieldChange("contact_no", e.target.value)}
                  className={errors.contact_no ? "border-red-500" : ""}
                  placeholder="10-digit mobile number"
                />
                {errors.contact_no && (
                  <p className="text-xs text-red-500">{errors.contact_no}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Address Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="address_line1">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address_line1"
                  value={formData.address_line1}
                  onChange={(e) => handleFieldChange("address_line1", e.target.value)}
                  className={errors.address_line1 ? "border-red-500" : ""}
                />
                {errors.address_line1 && (
                  <p className="text-xs text-red-500">{errors.address_line1}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={formData.address_line2}
                  onChange={(e) => handleFieldChange("address_line2", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    onBlur={() => {}}
                    valueKey="_id"
                    labelKey="name"
                    options={countries}
                    placeholder="Select Country"
                    id="country"
                    disabled={loadingLocations}
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    name="state"
                    value={formData.state}
                    onChange={handleStateChange}
                    onBlur={() => {}}
                    valueKey="_id"
                    labelKey="name"
                    options={states}
                    placeholder={formData.country ? "Select State" : "Select Country First"}
                    id="state"
                    disabled={!formData.country || loadingLocations}
                    className={errors.state ? "border-red-500" : ""}
                  />
                  {errors.state && (
                    <p className="text-xs text-red-500">{errors.state}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <CustomCombobox
                    name="city"
                    value={formData.city}
                    onChange={(value) => handleFieldChange("city", value)}
                    onBlur={() => {}}
                    valueKey="_id"
                    labelKey="name"
                    options={cities}
                    placeholder={formData.state ? "Select City" : "Select State First"}
                    id="city"
                    disabled={!formData.state || loadingLocations}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => handleFieldChange("pincode", e.target.value)}
                    className={errors.pincode ? "border-red-500" : ""}
                    placeholder="6-digit pincode"
                  />
                  {errors.pincode && (
                    <p className="text-xs text-red-500">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* PAN Information */}
            <div className="space-y-4">
              <h3 className="font-medium">PAN Information (Optional)</h3>
              
              <div className="space-y-2">
                <Label htmlFor="pan_no">PAN Number</Label>
                <Input
                  id="pan_no"
                  value={formData.pan_no}
                  onChange={(e) => handleFieldChange("pan_no", e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className={errors.pan_no ? "border-red-500" : ""}
                />
                {errors.pan_no && (
                  <p className="text-xs text-red-500">{errors.pan_no}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan_card">PAN Card Document</Label>
                <div>
                  {/* FIX: Use panCardUrl if available, fallback to pan_card */}
                  {(member?.panCardUrl || member?.pan_card) && !panCardFile && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground">Current document:</p>
                      <a 
                        href={member.panCardUrl || member.pan_card} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => {
                          if ((member.panCardUrl || member.pan_card)?.toLowerCase().endsWith('.pdf')) {
                            e.preventDefault();
                            window.open(member.panCardUrl || member.pan_card, '_blank');
                          }
                        }}
                      >
                        View current PAN card
                        {((member.panCardUrl || member.pan_card)?.toLowerCase().endsWith('.pdf')) && 
                          ' (PDF)'}
                      </a>
                    </div>
                  )}
                  <Input
                    id="pan_card"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={(e) => handleFileChange("pan_card", e.target.files?.[0])}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG or PDF (max. 5MB)
                  </p>
                  {panCardFile && (
                    <p className="text-xs text-green-600 mt-1">
                      New file selected: {panCardFile.name}
                      {panCardFile.type === 'application/pdf' && ' (PDF)'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="flex flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loadingLocations}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              isCreating ? "Create Member" : "Save Changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default EventCompanyTeamSheet;