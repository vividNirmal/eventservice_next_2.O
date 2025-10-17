import { cn } from "@/lib/utils";

// Get the actual field key to use
export const getFieldKey = (field) => {
  // Use fieldName if it exists and is not empty, otherwise use _id or fieldTitle
  return field.fieldName || field._id || field.fieldTitle;
};

// Parse field options
export const parseFieldOption = (option) => {
  if (typeof option === "string") {
    try {
      const parsed = JSON.parse(option);
      return {
        key: Object.keys(parsed)[0],
        value: Object.values(parsed)[0]
      };
    } catch (e) {
      return { key: option, value: option };
    }
  }
  return { 
    key: option.value || Object.keys(option)[0] || option,
    value: option.label || Object.values(option)[0] || option
  };
};