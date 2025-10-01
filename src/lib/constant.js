export const sidebarmenu = [
  {
    id: 1,
    title: "Dashboard",
    icon: "Home",
    link: "dashboard",
  },
  {
    Menu_id: 1,
    heading: "QUOTATION",
    items: [
      {
        id: 33,
        title: "OTP",
        icon: "MessageCircleDashed Dashed   ",
        link: "dashboard/otp",
      },
      {
        id: 35,
        title: " Quotation",
        icon: "MessageCircleDashed Dashed",
        link: "dashboard/general-quotation",
      },
      {
        id: 36,
        title: "Premium Request ",
        icon: "MessageCircleDashed Dashed",
        link: "dashboard/premium-request",
      },
      {
        id: 37,
        title: "Listing Banner Image ",
        icon: "MessageCircleDashed Dashed ",
        link: "dashboard/listing-banner-image",
      },
    ],
  },
  {
    Menu_id: 2,
    heading: "LOCATION & LISTING",
    items: [
      {
        id: 4,
        title: "Location",
        icon: "MapPin",
        submenu: [
          {
            _id: 1,
            title: "Countries",
            icon: "Lock",
            link: "dashboard/countries",
          },
          {
            _id: 2,
            title: "States",
            icon: "Lock",
            link: "dashboard/states",
          },
          {
            _id: 3,
            title: "City",
            icon: "Lock",
            subofsub: [
              {
                subid: 1,
                title: "Top City",
                icon: "Lock",
                link: "dashboard/manage-city/top-city",
              },
              {
                subid: 2,
                title: "Manage City",
                icon: "Lock",
                link: "dashboard/manage-city",
              },
            ],
          },

          {
            _id: 4,
            title: "Area",
            icon: "Lock",
            link: "dashboard/manage-area",
            // subofsub: [
            //   // {
            //   //   subid: 1,
            //   //   title: 'Unapproved Area',
            //   //   icon: 'mdi-account-lock',
            //   //   link: 'dashboard/unapproved-area',
            //   // },
            //   {
            //     subid: 2,
            //     title: 'Manage Area',
            //     icon: 'mdi-account-lock',
            //     link: 'dashboard/manage-area',
            //   },
            // ],
          },
        ],
      },
      {
        id: 2,
        title: "Categories",
        icon: "List",
        submenu: [
          {
            _id: 1,
            title: "Add Categories",
            icon: "Lock",
            link: "dashboard/add-category",
          },
          {
            _id: 2,
            title: "Manage Categories",
            icon: "Lock",
            link: "dashboard/manage-category",
          },
          {
            _id: 3,
            title: "Categories Sorting",
            icon: "Lock",
            link: "dashboard/sorting-category",
          },
          {
            _id: 4,
            title: "Category Views",
            icon: "Lock",
            link: "dashboard/category-view-count",
          },
        ],
      },
      {
        id: 6,
        title: "Listing",
        icon: "Layers",
        submenu: [
          {
            _id: 1,
            title: "Add Listing",
            icon: "Lock",
            link: "dashboard/add-listing",
          },
          {
            _id: 2,
            title: "Manage Listing",
            icon: "Lock",
            link: "dashboard/manage-listing",
          },
          {
            _id: 6,
            title: "Email Premium Listing",
            icon: "Lock",
            link: "dashboard/premium-listing",
          },
          {
            _id: 3,
            title: "Chatbot",
            icon: "Lock",
            subofsub: [
              {
                subid: 1,
                title: "Chatbot Listing",
                icon: "Lock",
                link: "dashboard/chatbot-listing",
              },
              {
                subid: 2,
                title: "User Chatbot",
                icon: "Lock",
                link: "dashboard/chatbot-user",
              },
            ],
          },
          {
            _id: 4,
            title: "Featured Listing",
            icon: "Lock",
            subofsub: [
              {
                subid: 1,
                title: "Featured Listing",
                icon: "Lock",
                link: "dashboard/featured-listing",
              },
              {
                subid: 2,
                title: "Add Featured",
                icon: "Lock",
                link: "dashboard/featured-listing/add-featured",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    Menu_id: 3,
    heading: "PRODUCTS",
    items: [
      {
        id: 5,
        title: "Product",
        icon: "Package",
        submenu: [
          {
            _id: 1,
            title: "Add Product",
            icon: "Lock",
            link: "dashboard/manage-product/add-product",
          },
          {
            _id: 2,
            title: "Manage Product",
            icon: "Lock",
            link: "dashboard/manage-product",
          },
        ],
      },
      {
        id: 8,
        title: "Advertising",
        icon: "Megaphone",
        submenu: [
          {
            _id: 1,
            title: "Banners Type",
            icon: "Lock",
            link: "dashboard/banner-types",
          },
          {
            _id: 2,
            title: "Banners",
            icon: "Lock",
            link: "dashboard/banners",
          },
          {
            _id: 3,
            title: "Embedding in theme",
            icon: "Lock",
            link: "dashboard/banner-theme",
          },
        ],
      },
    ],
  },
  {
    Menu_id: 13,
    heading: "JOBS",
    items: [
      {
        id: 65,
        title: "Job Category",
        icon: "Briefcase",
        link: "dashboard/job-category",
      },
      {
        id: 66,
        title: "Job Category Sorting",
        icon: "Circle",
        link: "dashboard/job-sorting",
      },
      {
        id: 67,
        title: "Job ",
        icon: "User",
        link: "dashboard/job",
      },
      {
        id: 67,
        title: "Job Application",
        icon: "ClipboardList",
        link: "dashboard/job-application",
      },
    ],
  },
  {
    Menu_id: 4,
    heading: "ADS ",
    items: [
      {
        id: 13,
        title: "Mange Redirect",
        icon: "ArrowRight",
        link: "dashboard/manage-redirects",
      },
    ],
  },
  {
    Menu_id: 5,
    heading: "REVIEWS ",
    items: [
      {
        id: 14,
        title: "Listing Review",
        icon: "Star",
        link: "dashboard/listing-review",
      },
      {
        id: 15,
        title: "Blog Review",
        icon: "Star",
        link: "dashboard/blog-review",
      },
    ],
  },
  {
    Menu_id: 6,
    heading: "STATIC PAGES ",
    items: [
      {
        id: 10,
        title: "Static Page",
        icon: "Clipboard",
        link: "dashboard/static-pages",
      },
      {
        id: 11,
        title: "Blog Page",
        icon: "BookOpen",
        submenu: [
          {
            _id: 1,
            title: " Blog Category",
            icon: "Lock",
            link: "dashboard/blog-category",
          },
          {
            _id: 2,
            title: "Blog",
            icon: "Lock",
            link: "dashboard/blog-list",
          },
        ],
      },
      {
        id: 12,
        title: "Home Page",
        icon: "Home",
        submenu: [
          {
            _id: 1,
            title: "Description Section",
            icon: "Lock",
            link: "dashboard/description-section",
          },
          {
            _id: 2,
            title: "Footer Section",
            icon: "Lock",
            link: "dashboard/footer-section",
          },
        ],
      },
    ],
  },
  {
    Menu_id: 7,
    heading: "SEO",
    items: [
      {
        id: 19,
        title: "Home Page",
        icon: "Circle",
        link: "dashboard/homepage-seo",
      },
      // {
      //   id: 20,
      //   title: 'All Category wise',
      //   icon: 'dot',
      //   link: 'all-category-wise-seo',
      // },
      // {
      //   id: 21,
      //   title: 'All Category',
      //   icon: 'dot',
      //   link: 'all-category-seo',
      // },
      {
        id: 22,
        title: "Category",
        icon: "Circle",
        link: "dashboard/category-seo",
      },
      {
        id: 23,
        title: "Sub Domain category",
        icon: "Circle",
        link: "dashboard/sub-domain-category",
      },
      {
        id: 24,
        title: "Listing",
        icon: "Circle",
        link: "dashboard/seo-listing",
      },
    ],
  },
  {
    Menu_id: 8,
    heading: "USERS",
    items: [
      {
        id: 25,
        title: "Manage Users",
        icon: "Settings",
        link: "dashboard/manage-users",
      },
      {
        id: 26,
        title: "Manage Admin Users",
        icon: "Settings",
        link: "dashboard/manage-admin-users",
      },
      {
        id: 27,
        title: "Live User",
        icon: "User",
        link: "dashboard/manage-live-users",
      },
    ],
  },
  {
    Menu_id: 9,
    heading: "ACTIVITY",
    items: [
      {
        id: 28,
        title: "Admin Activity",
        icon: "Settings",
        link: "dashboard/manage-admin-activity",
      },
      {
        id: 29,
        title: "Seller Activity",
        icon: "Settings",
        link: "dashboard/manage-seller-activity",
      },
      {
        id: 30,
        title: "Manage User Ip Activity",
        icon: "Settings",
        link: "dashboard/manage-user-ip-address",
      },
    ],
  },
  {
    Menu_id: 10,
    heading: "NEWSLETTER",
    items: [
      {
        id: 38,
        title: "Newsletter Content",
        icon: "Circle",
        link: "dashboard/newsletter-content",
      },
      {
        id: 39,
        title: "Marketing Content ",
        icon: "Circle",
        link: "dashboard/marketing-content",
      },
      {
        id: 40,
        title: "Subscribers",
        icon: "Circle",
        link: "dashboard/subscribers-list",
      },
    ],
  },
  {
    Menu_id: 11,
    heading: "BLACKLIST KEYWORDS",
    items: [
      {
        id: 42,
        title: "Keywords",
        icon: "Settings",
        link: "dashboard/manage-blacklist-keywords",
      },
    ],
  },
  {
    Menu_id: 12,
    heading: "SITEMAP",
    items: [
      {
        id: 43,
        title: "Category Sitemap",
        icon: "Route",
        link: "dashboard/manage-category-sitepmap",
      },
      {
        id: 44,
        title: "Listing Sitemap",
        icon: "Route",
        link: "dashboard/manage-listing-sitepmap",
      },
      {
        id: 45,
        title: "Featured Listing Sitemap",
        icon: "Route",
        link: "dashboard/featured-sitemap-gen",
      },
      {
        id: 46,
        title: "Product Sitemap",
        icon: "Route",
        link: "dashboard/manage-product-sitepmap",
      },
      {
        id: 47,
        title: "Blog Sitemap",
        icon: "Route",
        link: "dashboard/manage-blog-sitepmap",
      },
      {
        id: 48,
        title: "Searched Sitemap Listing",
        icon: "Route",
        link: "dashboard/manage-search-sitemap",
      },
      {
        id: 101,
        title: "Job Category Sitemap Listing",
        icon: "Route",
        link: "dashboard/manage-job-category-sitemap",
      },
      {
        id: 102,
        title: "Job Sitemap Listing",
        icon: "Route",
        link: "dashboard/manage-job-listing-sitemap",
      },
      {
        id: 49,
        title: "Custom Sitemap Listing",
        icon: "Route",
        link: "dashboard/manage-custom-links",
      },
    ],
  },
  {
    id: 54,
    title: "Background Processes",
    icon: "Settings",
    link: "dashboard/background-processes",
  },
  {
    id: 2,
    title: "Setting",
    icon: "Settings",
    link: "dashboard/manage-setting",
  },
  {
    id: 3,
    title: "Change Password",
    icon: "Lock",
    link: "dashboard/change-password-admin",
  },
  {
    id: 4,
    title: "Logout From All Websites",
    icon: "LogOut",
    link: "dashboard",
  },
];

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
    table: true,
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
