import { ImageSourcePropType } from 'react-native';

export interface Category {
  id: string;
  name: string;
  img: string;
}

export const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Manufacturing & Industrial",
    img: "https://www.wallofvox.com/assets/preferences/categories/manufacturing_&_industrial.jpg",
  },
  {
    id: "2",
    name: "Retail & E-commerce",
    img: "https://www.wallofvox.com/assets/preferences/categories/retail_&_e-commerce.jpg",
  },
  {
    id: "3",
    name: "Technology & IT",
    img: "https://www.wallofvox.com/assets/preferences/categories/technology_&_it.jpg",
  },
  {
    id: "4",
    name: "Finance & Banking",
    img: "https://www.wallofvox.com/assets/preferences/categories/finance_&_banking.jpeg",
  },
  {
    id: "5",
    name: "Healthcare & Life Sciences",
    img: "https://www.wallofvox.com/assets/preferences/categories/healthcare_&_life_sciences.jpg",
  },
  {
    id: "6",
    name: "Education & Training",
    img: "https://www.wallofvox.com/assets/preferences/categories/education_&_training.jpg",
  },
  {
    id: "7",
    name: "Hospitality & Tourism",
    img: "https://www.wallofvox.com/assets/preferences/categories/hospitality_&_tourism.jpg",
  },
  {
    id: "8",
    name: "Real Estate & Construction",
    img: "https://www.wallofvox.com/assets/preferences/categories/real_estate_&_construction.jpg",
  },
  {
    id: "9",
    name: "Media & Entertainment",
    img: "https://www.wallofvox.com/assets/preferences/categories/media_&_entertainment.jpg",
  },
  {
    id: "10",
    name: "Agriculture & Environment",
    img: "https://www.wallofvox.com/assets/preferences/categories/agriculture_&_environment.jpg",
  },
  {
    id: "11",
    name: "Logistics & Supply Chain",
    img: "https://www.wallofvox.com/assets/preferences/categories/logistics_&_supply_chain.jpg",
  },
  {
    id: "12",
    name: "Energy & Utilities",
    img: "https://www.wallofvox.com/assets/preferences/categories/energy_&_utilities.jpg",
  },
  {
    id: "13",
    name: "Transportation (Airlines, Railways, Shipping, etc.)",
    img: "https://www.wallofvox.com/assets/preferences/categories/transportation.jpg",
  },
  {
    id: "14",
    name: "Telecommunications",
    img: "https://www.wallofvox.com/assets/preferences/categories/telecommunications.jpg",
  },
  {
    id: "15",
    name: "Sports & Recreation",
    img: "https://www.wallofvox.com/assets/preferences/categories/sports_&_recreation.jpg",
  },
  {
    id: "16",
    name: "Beauty & Personal Care",
    img: "https://www.wallofvox.com/assets/preferences/categories/beauty_&_personal_care.jpeg",
  },
  {
    id: "17",
    name: "Food & Beverage Industry",
    img: "https://www.wallofvox.com/assets/preferences/categories/food_&_beverage_industry.jpeg",
  },
  {
    id: "18",
    name: "Non-Profit & NGOs",
    img: "https://www.wallofvox.com/assets/preferences/categories/non-profit_&_ngos.jpg",
  },
  {
    id: "19",
    name: "Advertising & Marketing Agencies",
    img: "https://www.wallofvox.com/assets/preferences/categories/advertising_&_marketing_agencies.jpg",
  },
  {
    id: "20",
    name: "Security Services",
    img: "https://www.wallofvox.com/assets/preferences/categories/security_services.jpg",
  },
  {
    id: "21",
    name: "Medical Professionals",
    img: "https://www.wallofvox.com/assets/preferences/categories/medical_professionals.jpg",
  },
  {
    id: "22",
    name: "Legal & Compliance",
    img: "https://www.wallofvox.com/assets/preferences/categories/legal_&_compliance.jpg",
  },
  {
    id: "23",
    name: "Engineering & Technical",
    img: "https://www.wallofvox.com/assets/preferences/categories/engineering_&_technical.jpg",
  },
  {
    id: "24",
    name: "Finance & Business",
    img: "https://www.wallofvox.com/assets/preferences/categories/finance_&_business.jpg",
  },
  {
    id: "25",
    name: "Creative & Design",
    img: "https://www.wallofvox.com/assets/preferences/categories/creative_&_design.jpg",
  },
  {
    id: "26",
    name: "Sales & Marketing",
    img: "https://www.wallofvox.com/assets/preferences/categories/sales_&_marketing.jpg",
  },
  {
    id: "27",
    name: "Skilled Trades",
    img: "https://www.wallofvox.com/assets/preferences/categories/skilled_trades.jpg",
  },
  {
    id: "28",
    name: "Government & Public Services",
    img: "https://www.wallofvox.com/assets/preferences/categories/government_&_public_services.jpeg",
  },
  {
    id: "29",
    name: "Freelancers & Independent Professionals",
    img: "https://www.wallofvox.com/assets/preferences/categories/freelancers_&_independent_professionals.jpg",
  },
  {
    id: "30",
    name: "Scientists & Researchers",
    img: "https://www.wallofvox.com/assets/preferences/categories/scientists_&_researchers.jpg",
  },
  {
    id: "31",
    name: "Journalists & Media Professionals",
    img: "https://www.wallofvox.com/assets/preferences/categories/journalists_&_media_professionals.jpg",
  },
  {
    id: "32",
    name: "Actors, Musicians & Performers",
    img: "https://www.wallofvox.com/assets/preferences/categories/actors_musicians_&_performers.jpg",
  },
  {
    id: "33",
    name: "Sports Professionals & Coaches",
    img: "https://www.wallofvox.com/assets/preferences/categories/sports_professionals_&_coaches.jpg",
  },
  {
    id: "34",
    name: "Chefs & Culinary Experts",
    img: "https://www.wallofvox.com/assets/preferences/categories/chefs_&_culinary_experts.jpg",
  },
  {
    id: "35",
    name: "Fashion Designers & Stylists",
    img: "https://www.wallofvox.com/assets/preferences/categories/fashion_designers_&_stylists.jpg",
  },
  {
    id: "36",
    name: "Data Scientists & Analysts",
    img: "https://www.wallofvox.com/assets/preferences/categories/data_scientists_&_analysts.jpg",
  },
  {
    id: "37",
    name: "Project Managers",
    img: "https://www.wallofvox.com/assets/preferences/categories/project_managers.jpg",
  },
  {
    id: "38",
    name: "Human Resource Professionals",
    img: "https://www.wallofvox.com/assets/preferences/categories/human_resource_professionals.jpg",
  },
  {
    id: "39",
    name: "Customer Support & Service Representatives",
    img: "https://www.wallofvox.com/assets/preferences/categories/customer_support_&_service_representatives.jpg",
  },
  {
    id: "40",
    name: "Electronics",
    img: "https://www.wallofvox.com/assets/preferences/categories/electronics.png",
  },
  {
    id: "41",
    name: "Hobbies & Crafts",
    img: "https://www.wallofvox.com/assets/preferences/categories/hobbies_&_crafts.png",
  },
  {
    id: "42",
    name: "Influencer & Creators",
    img: "https://www.wallofvox.com/assets/preferences/categories/influencer_&_creators.png",
  },
]
