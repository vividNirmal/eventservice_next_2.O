import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Address_type,
  business_nature,
  company_type,
  first_learn_about,
  like_to_visit,
  object_of_viditing,
  product_dealing,
  Role,
} from "@/lib/config";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { PhoneInputWithCountryCode } from "@/components/customComponents/customPhoneNumber/PhoneInputWithCountryCode";
import { getRequest, postRequest } from "@/service/viewService";

function Addcompany({
  isOpen,
  onClose,
  editUser = null,
  refetch,
  loading = false,
}) {
  const [submitLoader, setSubmitLoader] = useState(false);
  const [countries, setCountries] = useState([]);
  const [blogImgPreview, setBlogImgPreview] = useState(null);
  const [blogImage, setBlogImage] = useState(null);
  const [contactNumber, setContactNumber] = useState({
    countryCode: "+91",
    phoneNumber: "",
  });
  const formik = useFormik({
    initialValues: {
      like_to_visit: "",
      company_type: "",
      address_type: "",
      company_name: "",
      company_email: "",
      country_number: "",
      country_code: "",
      business_nature: [],
      address_one: "",
      address_two: "",
      pincode: "",
      country: "",
      city: "",
      company_document: "",
      company_website: "",
      objective_of_visiting: [],
      first_learn_about: [],
      product_dealing: [],
    },

    validationSchema: Yup.object({
      like_to_visit: Yup.string().required("Like to visit is required"),
      company_type: Yup.string().required("Company type is required"),
      address_type: Yup.string().required("Address type is required"),
      company_name: Yup.string().required("Company name is required"),
      company_email: Yup.string()
        .email("Invalid email")
        .required("Company email is required"),
      business_nature: Yup.array()
        .min(1, "At least one business nature is required")
        .required("Business nature is required"),
      address_one: Yup.string().required("Address is required"),
      address_two: Yup.string(),
      pincode: Yup.string().required("Pincode is required"),
      country: Yup.string().required("Country is required"),
      city: Yup.string().required("City is required"),
      company_website: Yup.string()
        .url("Invalid URL")
        .required("Company website is required"),
      objective_of_visiting: Yup.array()
        .min(1, "At least one objective is required")
        .required("Objective of visiting is required"),
      first_learn_about: Yup.array()
        .min(1, "At least one option is required")
        .required("First learn about is required"),
      product_dealing: Yup.array()
        .min(1, "At least one product is required")
        .required("Product dealing is required"),
    }),

    onSubmit: async (values) => {
      setSubmitLoader(true);
      try {
        const formData = new FormData();

        // Handle single dropdown fields (need to be JSON stringified like Angular)
        const singleDropdownFields = ['like_to_visit', 'company_type', 'address_type'];
        singleDropdownFields.forEach(field => {
          formData.append(field, JSON.stringify(values[field]));
        });

        // Handle regular text fields
        const textFields = [
          'company_name', 'company_email', 'address_one', 'address_two', 
          'pincode', 'city', 'company_website'
        ];
        textFields.forEach(field => {
          formData.append(field, values[field] || '');
        });

        // Handle phone number
        formData.append('country_number', contactNumber.phoneNumber);
        formData.append('country_code', contactNumber.countryCode);

        // Handle country (extract name if it's an object)
        const countryValue = typeof values.country === 'object' && values.country.name 
          ? values.country.name 
          : values.country;
        formData.append('country', countryValue);

        // Handle array fields (join with comma like Angular)
        const arrayFields = [
          "business_nature",
          "product_dealing", 
          "first_learn_about",
          "objective_of_visiting"
        ];
        arrayFields.forEach((field) => {
          const joinedValues = Array.isArray(values[field]) 
            ? values[field].map(item => typeof item === 'object' ? item.title : item).join(', ')
            : '';
          formData.append(field, joinedValues);
        });

        // Handle file upload
        if (blogImage instanceof File) {
          formData.append('company_document', blogImage);
        } else if (editUser && values.company_document && typeof values.company_document === 'string') {
          formData.append('company_document', values.company_document);
        }

        let response;
        if (editUser) {
          // Update existing company
          formData.append('admin_company_id', editUser._id);
          response = await postRequest("update-admin-company", formData);
        } else {
          // Create new company
          response = await postRequest("store-admin-company", formData);
        }

        if (response.status == 1) {
          setSubmitLoader(false);
          toast.success(editUser ? "Company updated successfully" : "Company added successfully");
          onClose();
          refetch(true);
          resetForm();
        } else {
          throw new Error(response.message || 'Operation failed');
        }
      } catch (error) {
        setSubmitLoader(false);
        toast.error(error.message || 'An error occurred');
        console.error('Form submission error:', error);
      }
    },
  });

  const resetForm = () => {
    formik.resetForm();
    setBlogImgPreview(null);
    setBlogImage(null);
    setContactNumber({
      countryCode: "+91",
      phoneNumber: "",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBlogImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBlogImgPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const populateEditData = async (editData) => {
    if (!editData) return;

    try {
      // Helper function to find objects from arrays
      const findObjectsFromTitles = (titleString, sourceArray) => {
        if (!titleString || !sourceArray) return [];
        const titles = titleString.split(', ');
        return sourceArray.filter(item => titles.includes(item.title));
      };

      // Helper function to parse JSON safely
      const parseJSONSafely = (jsonString) => {
        try {
          return JSON.parse(jsonString);
        } catch {
          return jsonString;
        }
      };

      // Set form values
      formik.setValues({
        like_to_visit: parseJSONSafely(editData.like_to_visit) || "",
        company_type: parseJSONSafely(editData.company_type) || "",
        address_type: parseJSONSafely(editData.address_type) || "",
        company_name: editData.company_name || "",
        company_email: editData.company_email || "",
        business_nature: findObjectsFromTitles(editData.business_nature, business_nature),
        address_one: editData.address_one || "",
        address_two: editData.address_two || "",
        pincode: editData.pincode || "",
        country: editData.country || "",
        city: editData.city || "",
        company_website: editData.company_website || "",
        objective_of_visiting: findObjectsFromTitles(editData.objective_of_visiting, object_of_viditing),
        first_learn_about: findObjectsFromTitles(editData.first_learn_about, first_learn_about),
        product_dealing: findObjectsFromTitles(editData.product_dealing, product_dealing),
      });

      // Set contact number
      if (editData.country_number && editData.country_code) {
        setContactNumber({
          countryCode: editData.country_code,
          phoneNumber: editData.country_number,
        });
      }

      // Set company document preview
      if (editData.company_document) {
        setBlogImgPreview(editData.company_document);
        setBlogImage(editData.company_document); // Keep reference to existing image
      }

    } catch (error) {
      console.error('Error populating edit data:', error);
      toast.error('Error loading company data');
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await getRequest("get-country");

      if (res.status === 1 && res.data?.country) {
        setCountries(res.data.country);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error("Failed to load countries");
    }
  };

  // Handle sheet open/close and edit data
  useEffect(() => {
    if (isOpen) {
      fetchCountries();
      if (editUser) {
        populateEditData(editUser);
      } else {
        resetForm();
      }
    } else {
      // Reset form when sheet closes
      resetForm();
    }
  }, [isOpen, editUser]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>{editUser ? "Edit Company" : "Add Company"}</SheetTitle>
          <SheetDescription>
            {editUser
              ? "Update company information"
              : "Create a new company account"}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="space-y-4 mt-6 overflow-auto max-h-[calc(100vh-120px)]"
        >
          <div className="space-y-2">
            <Label htmlFor="like_to_visit">
              Would Like To Visit Machinery or Jewellery
            </Label>
            <CustomCombobox
              name="like_to_visit"
              value={formik.values.like_to_visit}
              onChange={(value) => formik.setFieldValue("like_to_visit", value)}
              onBlur={() => formik.setFieldTouched("like_to_visit", true)}
              valueKey="value"
              labelKey="title"
              options={like_to_visit || []}
              placeholder="Select Your Review"
              id="like_to_visit"
            />
            {formik.touched.like_to_visit && formik.errors.like_to_visit && (
              <p className="text-sm text-red-500">
                {formik.errors.like_to_visit}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_type">Company Type</Label>
            <CustomCombobox
              name="company_type"
              value={formik.values.company_type}
              onChange={(value) => formik.setFieldValue("company_type", value)}
              onBlur={() => formik.setFieldTouched("company_type", true)}
              valueKey="value"
              labelKey="title"
              options={company_type || []}
              placeholder="Select Company Type"
              id="company_type"
            />
            {formik.touched.company_type && formik.errors.company_type && (
              <p className="text-sm text-red-500">
                {formik.errors.company_type}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_type">Address Type</Label>
            <CustomCombobox
              name="address_type"
              value={formik.values.address_type}
              onChange={(value) => formik.setFieldValue("address_type", value)}
              onBlur={() => formik.setFieldTouched("address_type", true)}
              valueKey="value"
              labelKey="title"
              options={Address_type || []}
              placeholder="Select Address Type"
              id="address_type"
            />
            {formik.touched.address_type && formik.errors.address_type && (
              <p className="text-sm text-red-500">
                {formik.errors.address_type}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              name="company_name"
              placeholder="Enter Company Name"
              value={formik.values.company_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.company_name && formik.errors.company_name && (
              <p className="text-sm text-red-500">
                {formik.errors.company_name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_email">Company Email</Label>
            <Input
              id="company_email"
              name="company_email"
              type="email"
              placeholder="Enter Company Email"
              value={formik.values.company_email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.company_email && formik.errors.company_email && (
              <p className="text-sm text-red-500">
                {formik.errors.company_email}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country_number">Company Contact</Label>
            <PhoneInputWithCountryCode
              id="country_number"
              name="country_number"
              placeholder="Enter Company Contact"
              value={contactNumber}
              onChange={setContactNumber}
            />
            {formik.touched.country_number && formik.errors.country_number && (
              <p className="text-sm text-red-500">
                {formik.errors.country_number}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_nature">Business Nature</Label>
            <CustomCombobox
              name="business_nature"
              value={formik.values.business_nature}
              onChange={(value) =>
                formik.setFieldValue("business_nature", value)
              }
              onBlur={() => formik.setFieldTouched("business_nature", true)}
              valueKey="value"
              labelKey="title"
              options={business_nature || []}
              multiSelect="true"
              placeholder="Select Business Nature"
              id="business_nature"
            />
            {formik.touched.business_nature &&
              formik.errors.business_nature && (
                <p className="text-sm text-red-500">
                  {formik.errors.business_nature}
                </p>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_one">Address Line 1</Label>
            <Input
              id="address_one"
              name="address_one"
              placeholder="Enter Address"
              value={formik.values.address_one}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.address_one && formik.errors.address_one && (
              <p className="text-sm text-red-500">
                {formik.errors.address_one}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_two">Address Line 2</Label>
            <Input
              id="address_two"
              name="address_two"
              placeholder="Enter Address"
              value={formik.values.address_two}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.address_two && formik.errors.address_two && (
              <p className="text-sm text-red-500">
                {formik.errors.address_two}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              name="pincode"
              type="number"
              placeholder="Enter Pincode"
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.pincode && formik.errors.pincode && (
              <p className="text-sm text-red-500">{formik.errors.pincode}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <CustomCombobox
              name="country"
              value={formik.values.country}
              onChange={(value) => formik.setFieldValue("country", value)}
              onBlur={() => formik.setFieldTouched("country", true)}
              valueKey="name"
              labelKey="name"
              options={countries || []}
              placeholder="Select Country"
              id="country"
            />
            {formik.touched.country && formik.errors.country && (
              <p className="text-sm text-red-500">{formik.errors.country}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              placeholder="Enter City"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.city && formik.errors.city && (
              <p className="text-sm text-red-500">{formik.errors.city}</p>
            )}
          </div>
          <div>
            <Label
              htmlFor="company_document"
              className="text-slate-600 block text-sm mb-1"
            >
              Company Document
            </Label>
            <label
              htmlFor="company_document"
              className="w-fit cursor-pointer flex items-center px-5 py-3 rounded-full bg-slate-100 hover:bg-primary text-primary hover:text-white transition duration-300"
            >
              <svg className="w-6 mr-2 fill-current" viewBox="0 0 32 32">
                <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12z" />
              </svg>
              Upload Company Document
            </label>
            {blogImgPreview && (
              <img
                src={blogImgPreview || "/placeholder.svg"}
                alt="Company Document Preview"
                className="mt-4 rounded-3xl !max-w-sm w-full block border-8 border-solid border-black/10"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            )}
            <input
              id="company_document"
              name="company_document"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_website">Company Website</Label>
            <Input
              id="company_website"
              name="company_website"
              placeholder="Enter Company Website"
              value={formik.values.company_website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="bg-white/50 backdrop-blur-sm border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
            />
            {formik.touched.company_website &&
              formik.errors.company_website && (
                <p className="text-sm text-red-500">
                  {formik.errors.company_website}
                </p>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="product_dealing">Product Dealing</Label>
            <CustomCombobox
              name="product_dealing"
              value={formik.values.product_dealing}
              onChange={(value) =>
                formik.setFieldValue("product_dealing", value)
              }
              onBlur={() => formik.setFieldTouched("product_dealing", true)}
              valueKey="value"
              labelKey="title"
              options={product_dealing || []}
              multiSelect="true"
              placeholder="Select Objective Of Visiting"
              id="product_dealing"
            />
            {formik.touched.product_dealing &&
              formik.errors.product_dealing && (
                <p className="text-sm text-red-500">
                  {formik.errors.product_dealing}
                </p>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="objective_of_visiting">Objective Of Visiting</Label>
            <CustomCombobox
              name="objective_of_visiting"
              value={formik.values.objective_of_visiting}
              onChange={(value) =>
                formik.setFieldValue("objective_of_visiting", value)
              }
              onBlur={() =>
                formik.setFieldTouched("objective_of_visiting", true)
              }
              valueKey="value"
              labelKey="title"
              options={object_of_viditing || []}
              multiSelect="true"
              placeholder="Select Objective Of Visiting"
              id="objective_of_visiting"
            />
            {formik.touched.objective_of_visiting &&
              formik.errors.objective_of_visiting && (
                <p className="text-sm text-red-500">
                  {formik.errors.objective_of_visiting}
                </p>
              )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="first_learn_about">
              How did you First Learn About
            </Label>
            <CustomCombobox
              name="first_learn_about"
              value={formik.values.first_learn_about}
              onChange={(value) =>
                formik.setFieldValue("first_learn_about", value)
              }
              onBlur={() => formik.setFieldTouched("first_learn_about", true)}
              valueKey="value"
              labelKey="title"
              options={first_learn_about || []}
              multiSelect="true"
              placeholder="Select First Learn About"
              id="first_learn_about"
            />
            {formik.touched.first_learn_about &&
              formik.errors.first_learn_about && (
                <p className="text-sm text-red-500">
                  {formik.errors.first_learn_about}
                </p>
              )}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitLoader}>
              {submitLoader && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editUser ? "Update Company" : "Add Company"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default Addcompany;
