"use client"

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import ChooseCompany from "./ChooseCompany";
import AddMemberFirst from "./AddMemberFirst";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import AddMemberSecond from "./AddmemberSecond";
import { getRequest, postRequest } from "@/service/viewService";
import { toast } from "sonner";

const AddCompanyMember = ({ editUser, onClose, isOpen }) => {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Step validation schemas
  const step1Schema = Yup.object({
    admin_company_id: Yup.string().required("Company is required"),
  });

  const step2Schema = Yup.object({
    first_name: Yup.string().required("First name is required"),
    last_name: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    contact_no: Yup.object().shape({
      countryCode: Yup.string().optional("Country code is required"),
      phoneNumber: Yup.string().optional("Phone number is required"),
    }),
    ownership: Yup.string().required("Ownership is required"),
    birth_date: Yup.string().required("Birth date is required"),
    gender: Yup.mixed().required("Gender is required"),
    address_one: Yup.string().required("Address line 1 is required"),
    address_two: Yup.string().required("Address line 2 is required"),
    pincode: Yup.string().required("Pincode is required"),
    country: Yup.mixed().required("Country is required"),
    city: Yup.string().required("City is required"),
    profile_picture: Yup.mixed().required("Profile picture is required"),
  });

  const step3Schema = Yup.object({
    passport_no: Yup.string().required("Passport number is required"),
    valid_upto: Yup.string().required("Expiry date is required"),
    origin: Yup.mixed().required("Origin country is required"),
    visa_recommendation: Yup.mixed().required("Visa recommendation is required"),
    passport_image: Yup.mixed().required("Passport image is required"),
    business_card: Yup.mixed().required("Business card is required"),
  });

  const formik = useFormik({
    initialValues: {
      fromstep1: {
        admin_company_id: "",
      },
      fromstep2: {
        first_name: "",
        last_name: "",
        email: "",
        contact_no: null,
        ownership: "",
        birth_date: "",
        gender: "",
        address_one: "",
        address_two: "",
        pincode: "",
        country: "",
        city: "",
        profile_picture: "",
      },
      fromstep3: {
        passport_no: "",
        valid_upto: "",
        origin: "",
        visa_recommendation: "",
        passport_image: "",
        business_card: "",
      },
    },
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        const step1 = values.fromstep1;
        const step2 = values.fromstep2;
        const step3 = values.fromstep3;

        if (!editUser) {
          formData.append("admin_company_id", step1.admin_company_id);
        }

        formData.append("first_name", step2.first_name);
        formData.append("last_name", step2.last_name);
        formData.append("email", step2.email);
        formData.append(
          "contact_no",
          step2.contact_no?.phoneNumber || ""
        );
        formData.append(
          "country_code",
          step2.contact_no?.countryCode || ""
        );
        formData.append("ownership", step2.ownership);
        formData.append("birth_date", step2.birth_date);
        formData.append("address_one", step2.address_one);
        formData.append("address_two", step2.address_two);
        formData.append("pincode", step2.pincode);
        formData.append("city", step2.city);
        formData.append("passport_no", step3.passport_no);
        formData.append("valid_upto", step3.valid_upto);

        // Handle object/string values
        const getValue = (field) => {
          if (typeof field === "string") return field;
          return field?.name || field?.value || "";
        };

        formData.append("origin", getValue(step3.origin));
        formData.append("visa_recommendation", getValue(step3.visa_recommendation));
        formData.append("gender", getValue(step2.gender));
        formData.append("country", getValue(step2.country));

        // Handle files
        if (typeof step2.profile_picture !== "string") {
          formData.append("profile_picture", step2.profile_picture);
        }
        if (typeof step3.passport_image !== "string") {
          formData.append("passport_image", step3.passport_image);
        }
        if (typeof step3.business_card !== "string") {
          formData.append("business_card", step3.business_card);
        }

        setIsLoading(true);
        let res;
        const endpoint = editUser 
          ? `update-company-team`
          : "store-company-team";

        if (editUser) {
          formData.append("team_id", editUser._id);
          res = await postRequest(endpoint, formData);
        } else {
          res = await postRequest(endpoint, formData);
        }

        if (res.status === 1) {
          toast.success(res.message);
          onClose(true);
          // formik.resetForm();
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error(error.response?.data?.message || "An error occurred 22");
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await getRequest("get-country");
        if (res?.data?.country) setCountries(res.data.country);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // Populate edit data
  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (editUser && editUser._id) {
        try {
          const res = await getRequest(`get-company-team-details/${editUser._id}`);
          if (res.status === 1) {
            const details = res.data.team_details;
            formik.setValues({
              fromstep1: {
                admin_company_id: details.admin_company_id,
              },
              fromstep2: {
                first_name: details.first_name,
                last_name: details.last_name,
                email: details.email,
                contact_no: {
                  phoneNumber: details.contact_no,
                  countryCode: details.country_code,
                },
                ownership: details.ownership,
                birth_date: details.birth_date,
                gender: details.gender,
                address_one: details.address_one,
                address_two: details.address_two,
                pincode: details.pincode,
                country: details.country,
                city: details.city,
                profile_picture: details.profile_picture,
              },
              fromstep3: {
                passport_no: details.passport_no,
                valid_upto: details.valid_upto,
                origin: details.origin,
                visa_recommendation: details.visa_recommendation,
                passport_image: details.passport_image,
                business_card: details.business_card,
              },
            });
          }
        } catch (error) {
          toast.error("Failed to load member details");
        }
      }
    };
    fetchMemberDetails();
  }, [editUser]);

   // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      formik.resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !editUser) {
      formik.resetForm();
      setStep(1);
    }
  }, [isOpen, editUser]);

  const validateCurrentStep = async () => {
    let schema;
    switch (step) {
      case 1:
        schema = step1Schema;
        break;
      case 2:
        console.log("Validating step 2");
        console.log("Current values:", formik.values.fromstep2);
        schema = step2Schema;
        break;
      case 3:
        schema = step3Schema;
        break;
      default:
        return false;
    }

    try {
      await schema.validate(formik.values[`fromstep${step}`], {
        abortEarly: false,
      });
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      formik.setErrors({
        ...formik.errors,
        [`fromstep${step}`]: errors,
      });
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    console.log("Step validation result:", isValid);
    if (!isValid) return;

    if (step === 3) {
      formik.submitForm();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => setStep(step - 1);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px] px-4">
        <SheetHeader>
          <SheetTitle>{editUser ? "Edit Member" : "Add Member"}</SheetTitle>
          <SheetDescription>
            {editUser
              ? "Update member information"
              : "Add a new member to your company"}
          </SheetDescription>
        </SheetHeader>
        <div>
          {step === 1 && (
            <ChooseCompany
              value={formik.values.fromstep1.admin_company_id}
              onChange={(value) =>
                formik.setFieldValue("fromstep1.admin_company_id", value)
              }
              error={formik.errors.fromstep1?.admin_company_id}
              touched={formik.touched.fromstep1?.admin_company_id}
            />
          )}
          {step === 2 && (
          <AddMemberFirst
            values={formik.values.fromstep2}
            setFieldValue={(field, value) =>
              formik.setFieldValue(`fromstep2.${field}`, value)
            }
            errors={formik.errors.fromstep2 || {}}
            setFieldTouched={(field, touched) => 
              formik.setFieldTouched(`fromstep2.${field}`, touched)
            }
            touched={formik.touched.fromstep2 || {}}
            countries={countries}
          />
          )}
          {step === 3 && (
            <AddMemberSecond
              values={formik.values.fromstep3}
              setFieldValue={(field, value) =>
                formik.setFieldValue(`fromstep3.${field}`, value)
              }
              errors={formik.errors.fromstep3 || {}}
              touched={formik.touched.fromstep3 || {}}
              countries={countries}
            />
          )}

          <div className="absolute right-0 bottom-0 w-full bg-white py-4 px-6 shadow-[-4px_0_4px_0_rgba(0,0,0,12%)] flex justify-between z-10">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <span className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              ) : step === 3 ? (
                editUser ? "Update" : "Save"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddCompanyMember;