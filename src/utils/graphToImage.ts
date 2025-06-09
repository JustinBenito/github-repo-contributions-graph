import { ContributionYear, Repository } from '../types';
import { toPng } from 'html-to-image';

// This is a simplified version of what would normally be a server-side image generation function
// In a real application, this would use Canvas/SVG to render the graph and convert it to an image
export const generateGraphImage = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  repository: Repository,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contributionYear: ContributionYear
): Promise<string> => {
  // Wait for the next render cycle to ensure the graph is fully rendered
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Find the contribution graph element
  const graphElement = document.querySelector('.contribution-graph');
  if (!graphElement) {
    throw new Error('Contribution graph element not found');
  }

  try {
    // Generate the image using html-to-image with improved settings
    const dataUrl = await toPng(graphElement as HTMLElement, {
      backgroundColor: '#0d1117',
      pixelRatio: 2, // Higher quality
      quality: 1.0, // Maximum quality
      style: {
        transform: 'none',
        width: 'fit-content',
        height: 'auto',
        display: 'block',
        visibility: 'visible',
        position: 'relative',
        opacity: '1'
      }
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image');
  }
};