"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { getRequest } from "@/service/viewService";
import { Skeleton } from "@/components/ui/skeleton";

const ChooseCompany = ({ value, onChange, error, touched }) => {
  const [search, setSearch] = useState("");
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCompanies(search);
    }, 800);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    fetchCompanies("");
  }, []);

  const fetchCompanies = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await getRequest(
        `get-admin-company-list?search=${searchTerm}&pageSize=10&page=1`
      );
      if (res.status === 1) {
        setCompanyList(res.data.companies || []);
      }
    } catch (error) {
      console.error("Company fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-h-full overflow-auto">
      <div className="flex flex-col pb-5">
        <form className="h-2/4 flex-grow pb-16">
          <div className="flex flex-wrap gap-6 mb-5">
            <div className="w-full md:w-[45%] flex-grow flex flex-col">
              <div className="relative mb-4">
                <Search className="size-5 absolute top-3 left-2 text-gray-500" />
                <Input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-0 pl-8 w-full outline-none py-2.5"
                  placeholder="Search by Name, PAN, Email, Contact no."
                  aria-label="Search companies"
                />
              </div>

              {loading ? (
                <div className="mt-20 flex flex-col gap-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : companyList.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {companyList.map((item) => (
                    <li key={item._id}>
                      <Label
                        htmlFor={item._id}
                        className="relative flex items-center gap-2 w-full border border-solid border-gray-300 rounded-lg p-2.5 cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <input
                          type="radio"
                          id={item._id}
                          name="admin_company_id"
                          value={item._id}
                          checked={value === item._id}
                          onChange={() => onChange(item._id)}
                          className="absolute top-0 opacity-0 peer"
                        />

                        <span
                          className={`rounded-full border border-solid w-5 h-5 block relative after:block after:w-2.5 after:h-2.5 after:rounded-full after:absolute after:top-2/4 after:left-2/4 after:-translate-x-2/4 after:-translate-y-2/4 transition-all duration-200 ease-linear
                          ${
                            value === item._id
                              ? "border-blue-500 after:bg-blue-500"
                              : "border-gray-500"
                          }`}
                        ></span>
                        <span
                          className={`${
                            value === item._id ? "text-blue-500" : "text-gray-500"
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-6"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span
                          className={`text-sm ${
                            value === item._id ? "text-blue-500" : "text-gray-500"
                          } w-2/4 grow`}
                        >
                          {item.company_name}
                        </span>
                      </Label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No companies found
                </p>
              )}

              {touched && error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChooseCompany;