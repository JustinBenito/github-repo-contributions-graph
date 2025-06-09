import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RepoForm from './components/RepoForm';
import ContributionGraph from './components/ContributionGraph';
import ShareableImage from './components/ShareableImage';
import Loading from './components/Loading';
import Stats from './components/Stats';
import { Repository, ContributionYear } from './types';
import { getRepository, getContributions, getContributors } from './services/github';
import { organizeContributionsIntoYear } from './utils/dateUtils';
import { generateGraphImage } from './utils/graphToImage';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [contributionYear, setContributionYear] = useState<ContributionYear | null>(null);
  const [contributorsCount, setContributorsCount] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleRepoSubmit = async (owner: string, repo: string) => {
    setIsLoading(true);
    setRepository(null);
    setContributionYear(null);
    setImageUrl(null);
    setIsGeneratingImage(false);
    
    try {
      // Fetch repository data
      const repoData = await getRepository(`https://github.com/${owner}/${repo}`);
      setRepository(repoData);
      
      // Fetch contribution data
      const contributionData = await getContributions(repoData.fullName);
      
      // Transform contribution data for visualization
      const year = organizeContributionsIntoYear(
        contributionData.contributions,
        contributionData.maxContributions
      );
      setContributionYear(year);
      
      // Fetch contributors
      const contributors = await getContributors(repoData.fullName);
      setContributorsCount(contributors.length);
      
      // Wait for the contribution graph to be rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate image
      setIsGeneratingImage(true);
      try {
        const url = await generateGraphImage(repoData, year);
        if (url) {
          setImageUrl(url);
        } else {
          throw new Error('Failed to generate image URL');
        }
      } catch (error) {
        console.error('Error generating image:', error);
        setImageUrl(null);
      } finally {
        setIsGeneratingImage(false);
      }
    } catch (error) {
      console.error('Error fetching repository data:', error);
      setRepository(null);
      setContributionYear(null);
      setImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#f0f6fc]">
            GitHub Contribution Graph Generator
          </h1>
          <p className="text-[#8b949e] text-lg max-w-2xl mx-auto">
            Generate beautiful, embeddable GitHub-style contribution graphs for any repository.
            Perfect for showcasing your project's activity in README files.
          </p>
        </div>
        
        <RepoForm onSubmit={handleRepoSubmit} isLoading={isLoading} />
        
        {isLoading && (
          <Loading message="Fetching repository data and generating contribution graph..." />
        )}
        
        {repository && contributionYear && !isLoading && (
          <>
            <Stats 
              repository={repository}
              contributionYear={contributionYear}
              contributorsCount={contributorsCount}
            />
            <div className="w-full max-w-4xl mx-auto mt-8 bg-[#161b22] border border-[#30363d] rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
            <div className="w-full max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-[#f0f6fc] mb-4">
                Contribution Graph Preview
              </h2>
              <ContributionGraph 
                contributionYear={contributionYear} 
                onDownload={async () => {
                  if (imageUrl) {
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `${repository.fullName.replace('/', '-')}-contributions.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    setIsGeneratingImage(true);
                    try {
                      const url = await generateGraphImage(repository, contributionYear);
                      if (url) {
                        setImageUrl(url);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${repository.fullName.replace('/', '-')}-contributions.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    } catch (error) {
                      console.error('Error generating image:', error);
                    } finally {
                      setIsGeneratingImage(false);
                    }
                  }
                }}
              />
            </div>
            </div>
            </div>

            {isGeneratingImage && (
              <div className="w-full max-w-3xl mx-auto mt-8">
                <Loading message="Generating shareable image..." />
              </div>
            )}
            
            {imageUrl && !isGeneratingImage && (
              <ShareableImage 
                repository={repository}
                contributionYear={contributionYear}
                imageUrl={imageUrl}
              />
            )}
          </>
        )}
        
        {!isLoading && !repository && (
          <div className="w-full max-w-4xl mx-auto mt-16 text-center">
            <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-lg">
              <p className="text-[#8b949e] text-lg">
                Enter a GitHub repository URL above to generate a contribution graph.
              </p>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;