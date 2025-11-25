export function parseScreenshotData(url: string, imageIdList: string[]): { screenshot_url: string, screenshot_id_list: string[] } {
  // screenshot_id_list is just the image_id_list
  const screenshot_id_list = imageIdList;

  // Logic for screenshot_url:
  // Input: https://screenmusings.org/movie/blu-ray/1917/most-viewed-stills.htm
  // Expected: /blu-ray/1917/images/1917-{screenshot_id}.jpg
  
  // 1. Remove the domain prefix
  let path = url.replace('https://screenmusings.org/movie', '');
  
  // 2. Remove /most-viewed-stills.htm
  path = path.replace('/most-viewed-stills.htm', '');
  
  // 3. Extract the movie slug (last part of the remaining path)
  // e.g. /blu-ray/1917 -> 1917
  const parts = path.split('/').filter(p => p.length > 0);
  const slug = parts[parts.length - 1];
  
  // 4. Construct the final template
  const screenshot_url = `${path}/images/${slug}-{screenshot_id}.jpg`;

  return {
    screenshot_url,
    screenshot_id_list
  };
}
