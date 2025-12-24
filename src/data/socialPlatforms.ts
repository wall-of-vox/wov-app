// Social media platforms data
const socialPlatforms = [
  {
    id: 'linkedin',
    name: 'Connect on LinkedIn',
    icon: 'https://www.wallofvox.com/assets/social-icons/linkedin.svg',
    placeholder: 'https://linkedin.com/in/username',
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
    color: 'bg-blue-600'
  },
  {
    id: 'instagram',
    name: 'Me on Instagram',
    icon: 'https://www.wallofvox.com/assets/social-icons/instagram.svg',
    placeholder: 'https://instagram.com/username',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/,
    color: 'bg-pink-600'
  },
  {
    id: 'twitter',
    name: 'Follow me on X',
    icon: 'https://www.wallofvox.com/assets/social-icons/x.svg',
    placeholder: 'https://x.com/username',
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
    color: 'bg-black'
  },
  {
    id: 'facebook',
    name: 'Show me on Facebook',
    icon: 'https://www.wallofvox.com/assets/social-icons/facebook.svg',
    placeholder: 'https://facebook.com/username',
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
    color: 'bg-blue-700'
  },
  {
    id: 'youtube',
    name: 'My YouTube Channel',
    icon: 'https://www.wallofvox.com/assets/social-icons/youtube.svg',
    placeholder: 'https://youtube.com/@username',
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|@)[a-zA-Z0-9_-]+\/?$/,
    color: 'bg-red-600'
  },
  {
    id: 'github',
    name: 'GitHub Profile',
    icon: 'https://www.wallofvox.com/assets/social-icons/github.svg',
    placeholder: 'https://github.com/username',
    urlPattern: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
    color: 'bg-gray-800'
  },
  {
    id: 'dribbble',
    name: 'Dribbble Profile',
    icon: 'https://www.wallofvox.com/assets/social-icons/dribbble.svg',
    placeholder: 'https://dribbble.com/username',
    urlPattern: /^https?:\/\/(www\.)?dribbble\.com\/[a-zA-Z0-9-]+\/?$/,
    color: 'bg-pink-600'
  }
];

const getSocialMeta = (id: string) => (
  Array.isArray(socialPlatforms) ? socialPlatforms.find((p) => p.id === id) : undefined
);

export { socialPlatforms, getSocialMeta };
