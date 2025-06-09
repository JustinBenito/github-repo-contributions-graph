import { ContributionYear, Repository } from '../types';
import { toBlob } from 'html-to-image';

// This is a simplified version of what would normally be a server-side image generation function
// In a real application, this would use Canvas/SVG to render the graph and convert it to an image
export const generateGraphImage = async (
  element: HTMLElement
): Promise<Blob | null> => {
  // Ensure the element is rendered and ready for snapshotting
  await new Promise(resolve => requestAnimationFrame(resolve));

  if (!element) {
    console.error('Contribution graph element not found');
    return null;
  }

  try {
    // Generate the image as a Blob using html-to-image with improved settings
    const imageBlob = await toBlob(element, {
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

    return imageBlob;
  } catch (error) {
    console.error('Error generating image Blob:', error);
    return null;
  }
};