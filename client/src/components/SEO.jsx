import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'ICInform - news, info and articles',
  description = 'Latest news and interesting articles',
  url = '',
  image = '',
  type = 'website'
}) => {
  const siteUrl = 'https://icinform.com';
  const fullUrl = `${siteUrl}${url}`;
  

  const displayTitle = title === 'ICInform - news, info and articles' 
    ? title 
    : `${title} | ICInform`;

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />
      
     
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      {image && <meta property="og:image" content={image} />}
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={displayTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;