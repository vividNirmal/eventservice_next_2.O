export const userRole = (role) => {
  switch (role) {
    case "admin":
      return "admin";
    case "superadmin":
      return "superadmin";
    default:
      return 0;
  }
};

export const userCheckRole = () => {
  const userRole = localStorage.getItem("userRole");
  if (userRole === "superadmin") {
    return 1;
  } else if (userRole === "companyadmin") {
    return 2;
  } else {
    return 3;
  }
};

export const Role = [
  { value: "admin", title: "Admin" },
  { value: "manager", title: "Manager" },
  { value: "customer", title: "Customer" },
];

export const sideBarMenu = (role) => {
  const eventMenuList = [
    {
      title: "Registered Event List",
      icon: "fa-solid fa-calendar-days",
      link: "/dashboard/events-list",
    },
    {
      title: "User List",
      icon: "fa-solid fa-users",
      link: "/dashboard/users-list",
    },
    {
      title: "Company List",
      icon: "fa-solid fa-user",
      link: "/dashboard/company-list",
    },
    {
      title: "QR Code List",
      icon: "fa-solid fa-user",
      link: "/dashboard/company-list",
    },
  ];
  switch (role) {
    case "admin":
      return [
        {
          title: "Dashboard",
          icon: "fa-solid fa-gauge",
          link: "/dashboard",
        },
        {
          title: "Users",
          icon: "fa-solid fa-users",
          link: "/dashboard/users",
        },
        {
          title: "Profile",
          icon: "fa-solid fa-user",
          link: "/dashboard/profile",
        },
      ];
    case "superadmin":
      return [
        {
          title: "Dashboard",
          icon: "fa-solid fa-gauge",
          link: "/dashboard",
        },
        {
          title: "Users",
          icon: "fa-solid fa-users",
          link: "/dashboard/users",
        },
        {
          title: "Profile",
          icon: "fa-solid fa-user",
          link: "/dashboard/profile",
        },
      ];
    default:
      return [];
  }
};

// export class errorRedirect {
//   constructor(private tosterserrvice: ToastService, private router: ) {}
//   handleError(error: HttpErrorResponse): Observable<never> {
//     if (error.status === 401 || error.status == 403) {
//       this.tosterserrvice.showError('Session Expired');
//       localStorage.removeItem('token');
//       this.router.navigate(['/dashboard/login']);
//     }

//     return throwError(error);
//   }
// }
// dirctory Constant
export const Address_type = [
  { id: 1, value: "HEAD_OFFICE", title: "HEAD OFFICE" },
  { id: 2, value: "BRANCH_OFFICE", title: "BRANCH OFFICE" },
  { id: 3, value: "FACTORY", title: "FACTORY" },
  { id: 4, value: "REGISTERED_OFFICE", title: "REGISTERED OFFICE" },
];

export const company_type = [
  { id: 1, value: "Partnership", title: "Partnership" },
  {
    id: 2,
    value: "Limited Liability Partnership (LLP)",
    title: "Limited Liability Partnership (LLP)",
  },
  { id: 3, value: "Private Limited Company", title: "Private Limited Company" },
  {
    id: 4,
    value: "One Person Company (OPC)",
    title: "One Person Company (OPC)",
  },
  { id: 4, value: "Joint Venture", title: "Joint Venture" },
];

export const business_nature = [
  { id: 1, value: "Retailers", title: "Retailers" },
  { id: 2, value: "Wholesaler_Agent", title: "Wholesaler Agent" },
  { id: 3, value: "Manufacturers", title: "Manufacturers" },
  // { id: 4, value: 'Importer_Exporter', title: 'Importer/Exporter' },
  // { id: 5, value: 'Coated_Diamonds', title: 'Coated Diamonds' },
  // { id: 6, value: 'Diamond_Jewellery', title: 'Diamond Jewellery' },
  // { id: 7, value: 'Fine_Gold_Jewellery', title: 'Fine Gold Jewellery' },
  // { id: 8, value: 'Platinum_Jewellery', title: 'Platinum Jewellery' },
  // {
  //   id: 9,
  //   value: 'Precious_Stone_Jewellery',
  //   title: 'Precious Stone Jewellery',
  // },
  // { id: 10, value: 'Silver_Jewellery', title: 'Silver Jewellery' },
  // { id: 11, value: 'Loose_Diamonds', title: 'Loose Diamonds' },
];

export const object_of_viditing = [
  { id: 1, value: "Place_Orders", title: "Place Orders" },
  { id: 2, value: "Source_New_Suppliers", title: "Source New Suppliers" },
  { id: 3, value: "Joint_Venture", title: "Joint Venture" },
  // { id: 4, value: 'Marketing_Information', title: 'Marketing Information' },
  // { id: 5, value: 'Technology', title: 'Technology' },
  // { id: 6, value: 'Meet_Regular_Suppliers', title: 'Meet Regular Suppliers' },
  // { id: 7, value: 'Trade_Association', title: 'Trade Association' },
  // { id: 8, value: 'Any_Other_Specify', title: 'Any Other (Specify)' },
];

export const first_learn_about = [
  { id: 1, value: "Publication", title: "Publication" },
  { id: 2, value: "Trade_Fair", title: "Trade Fair" },
  { id: 3, value: "Exhibitors", title: "Exhibitors" },
  // { id: 4, value: 'Website', title: 'Website' },
  // { id: 5, value: 'Newsletter_Emailers', title: 'Newsletter & Emailers' },
  // { id: 6, value: 'Road_Shows', title: 'Road Shows' },
  // { id: 7, value: 'Promotional_Brochures', title: 'Promotional Brochures' },
  // { id: 8, value: 'SMS', title: 'SMS' },
  // { id: 9, value: 'Last_year_visited', title: 'Last year visited' },
  // { id: 10, value: 'Loose_Colourstones', title: 'Loose Colourstones' },
  // { id: 11, value: 'Lab_Grown_Diamond', title: 'Lab Grown Diamond' },
  // { id: 12, value: 'CVD/HPHT', title: 'CVD/HPHT' },
  // { id: 13, value: 'Any_Other_Specify', title: 'Any Other (Specify)' },
];

export const like_to_visit = [
  { path: 1, value: "yes", title: "Yes" },
  { path: 2, value: "no", title: "No" },
];

export const product_dealing = [
  { id: 1, value: "Pearls", title: "Pearls" },
  { id: 2, value: "Coated Diamonds", title: "Coated Diamonds" },
  { id: 3, value: "Diamonds Jewellery", title: "Diamonds Jewellery" },
  // { id: 2, value: 'Gems', title: 'Gems' },
  // { id: 3, value: 'Precious_Stones', title: 'Precious Stones' },
  // { id: 4, value: 'Platinum', title: 'Platinum' },
  // { id: 5, value: 'Silver', title: 'Silver' },
  // { id: 6, value: 'Gold', title: 'Gold' },
  // { id: 7, value: 'Other', title: 'Other' },
  // { id: 8, value: 'Any_Other_Specify', title: 'Any Other (Specify)' },
];

export const SelectGender = [
  { id: 1, value: "Male", title: "Male" },
  { id: 2, value: "Female", title: "Female" },
  { id: 3, value: "Other", title: "Other" },
];

export const Selectorigin = [{ id: 1, value: "India", title: "india" }];

export const visaRecommendations = [
  { id: 1, value: "eventVisitor", title: "Event Visitor Visa Recommendation" },
  { id: 2, value: "exhibitor", title: "Exhibitor Visa Recommendation" },
  { id: 3, value: "speaker", title: "Speaker Visa Recommendation" },
  { id: 4, value: "organizer", title: "Organizer Visa Recommendation" },
  { id: 5, value: "vipGuest", title: "VIP/Guest Visa Recommendation" },
  { id: 6, value: "delegate", title: "Delegate Visa Recommendation" },
  { id: 7, value: "pressMedia", title: "Press/Media Visa Recommendation" },
  { id: 8, value: "participant", title: "Participant Visa Recommendation" },
  { id: 9, value: "staff", title: "Crew/Staff Visa Recommendation" },
  { id: 10, value: "sponsor", title: "Sponsor Visa Recommendation" },
];

export const machineType = [
  {
    value: "0",
    name: "Entry",
  },
  {
    value: "1",
    name: "Exit",
  },
];

export const pathNameMap = {
  dashboard: "Dashboard",
  "registered-event-list": "Registered Event List",
  "event-a": "Event A",
  "user-list": "User List",
  user: "User List",
  "event-company-list": "Event Company List",
  "company-list": "Company List",
  "scanner-machine-list": "Scanner Machine List",
  "machine-list": "Machine List",
  "blog-list": "Blog List",
  blog: "Blog List",
  "participant-user": "Participant User",
  participant: "Participant User",
};

export const textEditormodule = {
  modules: {
    toolbar: [
      [{ font: [] }, { size: [] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
  },
  formats: [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "align",
    "link",
    "image",
    "video",
  ],
};

