document.addEventListener('DOMContentLoaded', function() {
    const problemTypeSelect = document.getElementById('problem-type');
    const minRatingInput = document.getElementById('min-rating');
    const maxRatingInput = document.getElementById('max-rating');
    const generateBtn = document.getElementById('generate-btn');
    const nextBtn = document.getElementById('next-btn');
    const loadingElement = document.getElementById('loading');
    const problemDisplay = document.getElementById('problem-display');
    const problemTitle = document.getElementById('problem-title');
    const problemContest = document.getElementById('problem-contest');
    const problemRating = document.getElementById('problem-rating');
    const problemTags = document.getElementById('problem-tags');
    const problemLink = document.getElementById('problem-link');
    const totalProblemsElement = document.getElementById('total-problems');
    const filteredProblemsElement = document.getElementById('filtered-problems');

    let problems = [];
    let filteredProblems = [];

    // Initialize default values
    minRatingInput.value = '800';
    maxRatingInput.value = '2000';

    // Fetch problems from Codeforces API
    async function fetchProblems() {
        try {
            loadingElement.textContent = 'Loading problem database...';
            
            // First get all problems
            const response = await fetch('https://codeforces.com/api/problemset.problems');
            const data = await response.json();
            
            if (data.status !== 'OK') {
                throw new Error('Failed to fetch problems');
            }
            
            // Process problems - filter for Div 2 A/B/C
            problems = data.result.problems.filter(problem => {
                // Check if it's a Div 2 contest (approximate)
                const isDiv2 = problem.contestId >= 1000; // Most Div 2 contests have ID >= 1000
                
                // Check problem index (A, B, or C)
                const isABC = ['A', 'B', 'C'].includes(problem.index);
                
                return isDiv2 && isABC;
            });
            
            totalProblemsElement.textContent = problems.length;
            updateFilteredProblems();
            
            // Hide loading and show controls
            loadingElement.classList.add('hidden');
            problemDisplay.classList.remove('hidden');
            
            // Generate first problem
            generateProblem();
        } catch (error) {
            loadingElement.textContent = `Error: ${error.message}. Please try again later.`;
            console.error('Error fetching problems:', error);
        }
    }

    // Update filtered problems based on current filters
    function updateFilteredProblems() {
        const minRating = parseInt(minRatingInput.value) || 800;
        const maxRating = parseInt(maxRatingInput.value) || 2000;
        
        filteredProblems = problems.filter(problem => {
            // Rating filter
            if (!problem.rating || problem.rating < minRating || problem.rating > maxRating) {
                return false;
            }
            return true;
        });
        
        filteredProblemsElement.textContent = filteredProblems.length;
    }

    // Generate a random problem based on filters
    function generateProblem() {
        if (filteredProblems.length === 0) {
            problemTitle.textContent = 'No problems match your filters';
            problemContest.textContent = '';
            problemRating.textContent = '';
            problemTags.innerHTML = '';
            problemLink.href = '#';
            problemLink.classList.add('hidden');
            return;
        }
        
        // Get problem type filter
        const problemType = problemTypeSelect.value;
        
        // Filter by problem type if not random
        let eligibleProblems = filteredProblems;
        if (problemType !== 'random') {
            eligibleProblems = filteredProblems.filter(p => p.index === problemType);
            
            // If no problems of selected type, use all filtered problems
            if (eligibleProblems.length === 0) {
                eligibleProblems = filteredProblems;
            }
        }
        
        // Select random problem
        const randomIndex = Math.floor(Math.random() * eligibleProblems.length);
        const problem = eligibleProblems[randomIndex];
        
        // Display problem
        problemTitle.textContent = `${problem.index}. ${problem.name}`;
        problemContest.textContent = `Contest ${problem.contestId}`;
        problemRating.textContent = `Rating: ${problem.rating || '?'}`;
        
        // Display tags
        problemTags.innerHTML = '';
        if (problem.tags && problem.tags.length > 0) {
            problem.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag;
                problemTags.appendChild(tagElement);
            });
        } else {
            const noTags = document.createElement('span');
            noTags.textContent = 'No tags available';
            noTags.style.color = '#6b7280';
            problemTags.appendChild(noTags);
        }
        
        // Set problem link
        problemLink.href = `https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`;
        problemLink.classList.remove('hidden');
    }

    // Event listeners
    generateBtn.addEventListener('click', function() {
        updateFilteredProblems();
        generateProblem();
    });
    
    nextBtn.addEventListener('click', generateProblem);
    
    minRatingInput.addEventListener('change', updateFilteredProblems);
    maxRatingInput.addEventListener('change', updateFilteredProblems);
    problemTypeSelect.addEventListener('change', updateFilteredProblems);

    // Initial fetch
    fetchProblems();
});