"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomCombobox } from "@/components/common/customcombox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getRequest, postRequest } from "@/service/viewService";
import { Label } from "@/components/ui/label";

function UpdateParticipantUserPage({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    designation: "",
    organization: "",
    contact: "",
    country: "",
    state: "",
    city: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    async function fetchCountries() {
      const res = await getRequest("get-country");
      if (res.status === 1 && res.data?.country) {
        setCountries(res.data.country);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchParticipant();
  }, [id, countries.length]);

  const fetchParticipant = async () => {
    setLoading(true);
    try {
      const response = await getRequest(`get-paticipant-user-detail/${id}`);
      if (response.status === 1 && response.data) {
        const found = response.data.user;
        setInitialValues({
          first_name: found.first_name || "",
          last_name: found.last_name || "",
          designation: found.designation || "",
          organization: found.organization || "",
          contact: found.contact || "",
          country: found.country || "",
          state: found.state || "",
          city: found.city || "",
          address: found.address || "",
          email: found.email || "",
        });
        if (found.country) {
          const countryObj = countries.find((c) => c.name === found.country);
          if (countryObj?._id) {
            fetchStates(countryObj._id, found.state);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching participant details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStates = async (countryId, preselectState = "") => {
    const res = await getRequest(`get-state/${countryId}`);
    if (res.status === 1 && res.data?.state) {
      setStates(res.data.state);
      if (preselectState) {
        const stateObj = res.data.state.find((s) => s.name === preselectState);
        if (stateObj?._id) fetchCities(stateObj._id, initialValues.city);
      }
    }
  };

  const fetchCities = async (stateId, preselectCity = "") => {
    const res = await getRequest(`get-city/${stateId}`);
    if (res.status === 1 && res.data?.city) {
      setCities(res.data.city);
    }
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("First Name is required"),
    last_name: Yup.string().required("Last Name is required"),
    designation: Yup.string().required("Designation is required"),
    organization: Yup.string().required("Organization Name is required"),
    contact: Yup.string().required("Contact No. is required"),
    country: Yup.string().required("Country is required"),
    state: Yup.string().required("State is required"),
    city: Yup.string().required("City is required"),
    address: Yup.string().required("Address is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append("participant_user_id", id);
      const response = await postRequest(
        "update-praticipent-user-details",
        formData
      );
      if (response.status === 1) {
        toast.success("Participant updated successfully");
        router.push("/dashboard/participant-list");
      } else {
        toast.error(response.data?.message || "Update failed");
      }
    },
  });

  const handleCountryChange = (value) => {
    formik.setFieldValue("country", value);
    const countryObj = countries.find((c) => c.name === value);
    if (countryObj?._id) {
      fetchStates(countryObj._id);
      formik.setFieldValue("state", "");
      formik.setFieldValue("city", "");
      setCities([]);
    }
  };
  const handleStateChange = (value) => {
    formik.setFieldValue("state", value);
    const stateObj = states.find((s) => s.name === value);
    if (stateObj?._id) {
      fetchCities(stateObj._id);
      formik.setFieldValue("city", "");
    }
  };

  return (
    <div className="flex justify-center items-start">
      <div className="w-full relative">
        <h1 className="text-xl font-bold mb-4">Edit Participant User</h1>
        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <form onSubmit={formik.handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="">First Name</Label>
                    <Input
                      name="first_name"
                      value={formik.values.first_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.first_name && formik.errors.first_name && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.first_name}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="">Last Name</Label>
                    <Input
                      name="last_name"
                      value={formik.values.last_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.last_name && formik.errors.last_name && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.last_name}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="">Designation</Label>
                    <Input
                      name="designation"
                      value={formik.values.designation}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.designation &&
                      formik.errors.designation && (
                        <div className="text-red-500 text-xs">
                          {formik.errors.designation}
                        </div>
                      )}
                  </div>
                  <div>
                    <Label className="">Organization Name</Label>
                    <Input
                      name="organization"
                      value={formik.values.organization}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.organization &&
                      formik.errors.organization && (
                        <div className="text-red-500 text-xs">
                          {formik.errors.organization}
                        </div>
                      )}
                  </div>
                  <div>
                    <Label className="">Contact No.</Label>
                    <Input
                      name="contact"
                      value={formik.values.contact}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.contact && formik.errors.contact && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.contact}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="">Country</Label>
                    <CustomCombobox
                      name="country"
                      value={formik.values.country}
                      onChange={handleCountryChange}
                      onBlur={() => formik.setFieldTouched("country", true)}
                      valueKey="name"
                      labelKey="name"
                      options={countries}
                      placeholder="Select Country"
                      id="country"
                    />
                    {formik.touched.country && formik.errors.country && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.country}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="">State</Label>
                    <CustomCombobox
                      name="state"
                      value={formik.values.state}
                      onChange={handleStateChange}
                      onBlur={() => formik.setFieldTouched("state", true)}
                      valueKey="name"
                      labelKey="name"
                      options={states}
                      placeholder="Select State"
                      id="state"
                    />
                    {formik.touched.state && formik.errors.state && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.state}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="">City</Label>
                    <CustomCombobox
                      name="city"
                      value={formik.values.city}
                      onChange={(value) => formik.setFieldValue("city", value)}
                      onBlur={() => formik.setFieldTouched("city", true)}
                      valueKey="name"
                      labelKey="name"
                      options={cities}
                      placeholder="Select City"
                      id="city"
                    />
                    {formik.touched.city && formik.errors.city && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.city}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="">Address</Label>
                    <Input
                      name="address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.address && formik.errors.address && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.address}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label className="">Email</Label>
                    <Input
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <div className="text-red-500 text-xs">
                        {formik.errors.email}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpdateParticipantUserPage;
