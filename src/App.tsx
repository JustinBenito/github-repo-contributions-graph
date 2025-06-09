import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import RepoForm from './components/RepoForm';
import ContributionGraph from './components/ContributionGraph';
import ShareableImage from './components/ShareableImage';
import Loading from './components/Loading';
import Stats from './components/Stats';
import { Repository, ContributionYear, ContributionData } from './types';
import { getRepository, getContributions, getContributors, uploadImageToSupabase } from './services/github';
import { organizeContributionsIntoYear } from './utils/dateUtils';
import { generateGraphImage } from './utils/graphToImage';
import { supabase } from './lib/supabaseClient';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [contributionYear, setContributionYear] = useState<ContributionYear | null>(null);
  const [contributorsCount, setContributorsCount] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  const graphRef = useRef<HTMLDivElement>(null);

  // Effect to generate and upload image once the graph is rendered
  useEffect(() => {
    const generateAndUpload = async () => {
      if (repository && contributionYear && graphRef.current && !imageUrl && !isGeneratingImage && !hasAttemptedGeneration) {
        console.log("useEffect: Starting image generation...");
        setIsGeneratingImage(true);
        setHasAttemptedGeneration(true);
        
        try {
          await new Promise(resolve => setTimeout(resolve, 50));
          const imageBlob = await generateGraphImage(graphRef.current);
          
          if (imageBlob) {
            const url = await uploadImageToSupabase(imageBlob, repository.owner, repository.name);
            if (url) {
              setImageUrl(url);
            }
          }
        } catch (error) {
          console.error('Error generating or uploading image:', error);
        } finally {
          setIsGeneratingImage(false);
        }
      }
    };

    generateAndUpload();
  }, [repository, contributionYear]); // Only depend on these two values

  const handleRepoSubmit = async (owner: string, repo: string) => {
    setIsLoading(true);
    setRepository(null);
    setContributionYear(null);
    setImageUrl(null);
    setIsGeneratingImage(false);
    setHasAttemptedGeneration(false); // Reset the generation flag
    
    const repoId = `${owner}-${repo}`;
    const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

    try {
      let fetchedRepository: Repository | null = null;
      let fetchedContributionData: ContributionData | null = null;
      let fetchedContributorsCount = 0;
      let isDataFresh = false;

      // 1. Try to fetch from Supabase cache
      const { data: cachedData, error: cacheError } = await supabase
        .from('contribution_graphs')
        .select('repository_data, contribution_data, contributors_count, updated_at')
        .eq('id', repoId)
        .single();

      if (cachedData && !cacheError) {
        const updatedAt = new Date(cachedData.updated_at);
        const now = new Date();
        if (now.getTime() - updatedAt.getTime() < ONE_DAY_IN_MS) {
          // Data is fresh
          fetchedRepository = cachedData.repository_data;
          fetchedContributionData = cachedData.contribution_data;
          fetchedContributorsCount = cachedData.contributors_count;
          isDataFresh = true;
          console.log('Using cached data from Supabase.');
        }
      }

      if (!isDataFresh) {
        // 2. Fetch from GitHub API if cache is stale or not found
        console.log('Fetching data from GitHub API...');
        fetchedRepository = await getRepository(`https://github.com/${owner}/${repo}`);
        const contributionResponse = await getContributions(fetchedRepository.fullName);
        fetchedContributionData = contributionResponse;
        const contributors = await getContributors(fetchedRepository.fullName);
        fetchedContributorsCount = contributors.length;

        // 3. Save to Supabase
        if (fetchedRepository && fetchedContributionData) {
          await supabase
            .from('contribution_graphs')
            .upsert({
              id: repoId,
              owner,
              repo,
              repository_data: fetchedRepository,
              contribution_data: fetchedContributionData,
              contributors_count: fetchedContributorsCount,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          console.log('Data saved/updated in Supabase.');
        }
      }

      if (fetchedRepository && fetchedContributionData) {
        setRepository(fetchedRepository);
        const year = organizeContributionsIntoYear(
          fetchedContributionData.contributions,
          fetchedContributionData.maxContributions
        );
        setContributionYear(year);
        setContributorsCount(fetchedContributorsCount);

        // The image generation will now be handled by the useEffect hook

      } else {
        throw new Error('Failed to retrieve repository or contribution data.');
      }
    } catch (error) {
      console.error('Error in handleRepoSubmit:', error);
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
            
            <div className="w-full max-w-3xl mx-auto mt-8">
              <h2 className="text-xl font-bold text-[#f0f6fc] mb-4">
                Contribution Graph Preview
              </h2>
              <ContributionGraph 
                contributionYear={contributionYear} 
                ref={graphRef} // Attach the ref here
                onDownload={async () => {
                  if (imageUrl) {
                    console.log("Using existing image URL for download:", imageUrl);
                    const link = document.createElement('a');
                    link.href = imageUrl;
                    link.download = `${repository.fullName.replace('/', '-')}-contributions.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } else {
                    console.warn('Cannot download: Image URL not available in state and no fallback generation.');
                  }
                }}
              />
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