"use client";

import { cn } from "@/lib/utils";
import { CustomCombobox } from "../common/customcombox";
import { useEffect, useMemo, useState } from "react";

const useDynamicOptions = (element, dependentValue) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {      
      if (!element.optionUrl || !element.optionPath) {
        return;
      }

      // If field has dependency and dependent value is not set, don't fetch
      if (element.optionDepending && !dependentValue) {
        setOptions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construct the full API URL with dependent value if exists
        let apiUrl = element.optionUrl;
        if (element.optionDepending && dependentValue) {
          apiUrl = `${apiUrl}/${dependentValue}`;
        }
        
        // Make the API request based on request type
        let response;
        if (element.optionRequestType === "GET") {
          response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
        } else if (element.optionRequestType === "POST") {
          response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          });
        }

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract the data array from response
        const dataArray = data.data[element.optionPath] || data.result[element.optionPath] || data[element.optionPath];
        
        if (Array.isArray(dataArray)) {
          // Transform API data to option format
          const transformedOptions = dataArray.map((item) => ({
            value: item[element.optionValue || "_id"] || item.id || item.value,
            title: item[element.optionName || "name"] || item.label || item.title,
          }));
          
          setOptions(transformedOptions);
        } else {
          console.error("API response is not an array:", dataArray);
          setOptions([]);
        }
      } catch (err) {
        console.error("Error fetching dynamic options:", err);
        setError(err.message);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [element.optionUrl, element.optionPath, element.optionValue, element.optionName, element.optionRequestType, element.optionDepending, dependentValue]);

  return { options, loading, error };
};

/**
 * Dynamic Select Component with API support and dependency handling
 */
export const DynamicSelect = ({ element, value, onChange, onBlur, error, formValues }) => {
  // Get dependent field value if this field depends on another
  const dependentValue = element.optionDepending ? formValues[element.optionDepending] : null;
  
  const { options: apiOptions, loading, error: apiError } = useDynamicOptions(element, dependentValue);

  // Use API options if available, otherwise use static fieldOptions
  const options = useMemo(() => {
    if (element.optionUrl && element.optionPath) {
      return apiOptions;
    }

    // Transform static options
    return (element.fieldOptions || []).map((option) => {
      let parsedOption = option;
      if (typeof option === "string") {
        try {
          parsedOption = JSON.parse(option);
        } catch (e) {
          parsedOption = option;
        }
      }

      const optionValue =
        parsedOption.value ||
        Object.keys(parsedOption)[0] ||
        parsedOption;
      const optionLabel =
        parsedOption.label ||
        Object.values(parsedOption)[0] ||
        parsedOption;

      return {
        value: optionValue,
        title: optionLabel,
      };
    });
  }, [element.fieldOptions, element.optionUrl, element.optionPath, apiOptions]);

  // Show message if dependent field is not selected
  if (element.optionDepending && !dependentValue) {
    return (
      <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
        <span className="text-sm text-muted-foreground">
          Please select {element.optionDepending} first
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-md">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-muted-foreground">Loading options...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="p-2 border border-red-300 rounded-md bg-red-50">
        <span className="text-sm text-red-600">Error loading options: {apiError}</span>
      </div>
    );
  }

  return (
    <CustomCombobox
      name={element.fieldName}
      id={element.fieldName}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      valueKey="value"
      labelKey="title"
      search={options.length > 10}
      options={options}
      placeholder={element.placeHolder || "Select an option"}
      className={error ? "border-red-500" : ""}
    />
  );
};