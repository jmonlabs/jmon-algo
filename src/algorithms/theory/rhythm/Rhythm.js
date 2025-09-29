/**
 * A class used to represent a Rhythm generator with various algorithmic methods
 */
export class Rhythm {
    /**
     * Constructs all the necessary attributes for the Rhythm object
     * @param {number} measureLength - The length of the measure
     * @param {Array} durations - The durations of the notes
     */
    constructor(measureLength, durations) {
        this.measureLength = measureLength;
        this.durations = durations;
    }

    /**
     * Generate a random rhythm as a list of (duration, offset) tuples
     * @param {number} seed - Random seed for reproducibility
     * @param {number} restProbability - Probability of a rest (0-1)
     * @param {number} maxIter - Maximum number of iterations
     * @returns {Array} Array of [duration, offset] tuples representing the rhythm
     */
    random(seed = null, restProbability = 0, maxIter = 100) {
        if (seed !== null) {
            Math.seedrandom = seed; // Note: requires seedrandom library
        }
        
        const rhythm = [];
        let totalLength = 0;
        let nIter = 0;
        
        while (totalLength < this.measureLength && nIter < maxIter) {
            const duration = this.durations[Math.floor(Math.random() * this.durations.length)];
            
            if (totalLength + duration > this.measureLength) {
                nIter++;
                continue;
            }
            
            if (Math.random() < restProbability) {
                nIter++;
                continue;
            }
            
            rhythm.push([duration, totalLength]);
            totalLength += duration;
            nIter++;
        }
        
        if (nIter >= maxIter) {
            console.warn('Max iterations reached. The sum of the durations may not equal the measure length.');
        }
        
        return rhythm;
    }

    /**
     * Executes the Darwinian evolution algorithm to generate the best rhythm
     * @param {number} seed - Random seed for reproducibility
     * @param {number} populationSize - Number of rhythms in each generation
     * @param {number} maxGenerations - Maximum number of generations
     * @param {number} mutationRate - Probability of mutation (0-1)
     * @returns {Array} The best rhythm found after evolution
     */
    darwin(seed = null, populationSize = 10, maxGenerations = 50, mutationRate = 0.1) {
        const ga = new GeneticRhythm(
            seed,
            populationSize,
            this.measureLength,
            maxGenerations,
            mutationRate,
            this.durations
        );
        return ga.generate();
    }
}

/**
 * Genetic Algorithm for rhythm generation
 */
class GeneticRhythm {
    constructor(seed, populationSize, measureLength, maxGenerations, mutationRate, durations) {
        if (seed !== null) {
            Math.seedrandom = seed;
        }
        
        this.populationSize = populationSize;
        this.measureLength = measureLength;
        this.maxGenerations = maxGenerations;
        this.mutationRate = mutationRate;
        this.durations = durations;
        this.population = this.initializePopulation();
    }

    /**
     * Initialize a population of random rhythms
     */
    initializePopulation() {
        const population = [];
        for (let i = 0; i < this.populationSize; i++) {
            population.push(this.createRandomRhythm());
        }
        return population;
    }

    /**
     * Create a random rhythm ensuring it respects the measure length
     * @returns {Array} Array of [duration, offset] tuples
     */
    createRandomRhythm() {
        const rhythm = [];
        let totalLength = 0;
        
        while (totalLength < this.measureLength) {
            const remaining = this.measureLength - totalLength;
            const noteLength = this.durations[Math.floor(Math.random() * this.durations.length)];
            
            if (noteLength <= remaining) {
                rhythm.push([noteLength, totalLength]);
                totalLength += noteLength;
            } else {
                break;
            }
        }
        
        return rhythm;
    }

    /**
     * Evaluate the fitness of a rhythm
     * @param {Array} rhythm - The rhythm to evaluate
     * @returns {number} Fitness score (lower is better)
     */
    evaluateFitness(rhythm) {
        const totalLength = rhythm.reduce((sum, note) => sum + note[0], 0);
        return Math.abs(this.measureLength - totalLength);
    }

    /**
     * Select a parent using simple random selection with fitness bias
     * @returns {Array} Selected parent rhythm
     */
    selectParent() {
        const parent1 = this.population[Math.floor(Math.random() * this.population.length)];
        const parent2 = this.population[Math.floor(Math.random() * this.population.length)];
        
        return this.evaluateFitness(parent1) < this.evaluateFitness(parent2) ? parent1 : parent2;
    }

    /**
     * Perform crossover between two parents
     * @param {Array} parent1 - First parent rhythm
     * @param {Array} parent2 - Second parent rhythm
     * @returns {Array} Child rhythm
     */
    crossover(parent1, parent2) {
        if (parent1.length === 0 || parent2.length === 0) {
            return parent1.length > 0 ? [...parent1] : [...parent2];
        }
        
        const crossoverPoint = Math.floor(Math.random() * (parent1.length - 1)) + 1;
        const child = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
        
        return this.ensureMeasureLength(child);
    }

    /**
     * Ensure rhythm respects measure length
     * @param {Array} rhythm - The rhythm to adjust
     * @returns {Array} Adjusted rhythm
     */
    ensureMeasureLength(rhythm) {
        const totalLength = rhythm.reduce((sum, note) => sum + note[0], 0);
        
        if (totalLength > this.measureLength && rhythm.length > 0) {
            rhythm.pop(); // Remove last note if exceeds measure length
        }
        
        return rhythm;
    }

    /**
     * Mutate a rhythm with certain probability
     * @param {Array} rhythm - The rhythm to mutate
     * @returns {Array} Mutated rhythm
     */
    mutate(rhythm) {
        if (Math.random() < this.mutationRate && rhythm.length > 1) {
            const index = Math.floor(Math.random() * (rhythm.length - 1));
            const [duration, offset] = rhythm[index];
            const nextOffset = index === rhythm.length - 1 ? 
                this.measureLength : rhythm[index + 1][1];
            const maxNewDuration = nextOffset - offset;
            const validDurations = this.durations.filter(d => d <= maxNewDuration);
            
            if (validDurations.length > 0) {
                const newDuration = validDurations[Math.floor(Math.random() * validDurations.length)];
                rhythm[index] = [newDuration, offset];
            }
        }
        
        return rhythm;
    }

    /**
     * Execute the genetic algorithm
     * @returns {Array} Best rhythm found, sorted by offset
     */
    generate() {
        for (let generation = 0; generation < this.maxGenerations; generation++) {
            const newPopulation = [];
            
            for (let i = 0; i < this.populationSize; i++) {
                const parent1 = this.selectParent();
                const parent2 = this.selectParent();
                let child = this.crossover(parent1, parent2);
                child = this.mutate(child);
                
                // Sort child by offset
                child.sort((a, b) => a[1] - b[1]);
                newPopulation.push(child);
            }
            
            this.population = newPopulation;
        }

        // Return best rhythm sorted by offset
        const bestRhythm = this.population.reduce((best, current) => 
            this.evaluateFitness(current) < this.evaluateFitness(best) ? current : best
        );
        
        return bestRhythm.sort((a, b) => a[1] - b[1]);
    }
}
