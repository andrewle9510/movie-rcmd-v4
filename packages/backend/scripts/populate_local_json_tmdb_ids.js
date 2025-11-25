const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load Env
const envPath = path.join(__dirname, '../.env.local');
let TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY && fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^TMDB_API_KEY=(.*)$/);
      if (match) {
        TMDB_API_KEY = match[1].trim();
        break;
      }
    }
  } catch (e) {
    console.error("Failed to read .env.local", e);
  }
}

if (!TMDB_API_KEY) {
  console.error("Error: TMDB_API_KEY not found in environment or .env.local");
  process.exit(1);
}

const DATA_PATH = path.join(__dirname, '../../../test_data/movies_filtered.json');

function fetchTmdbId(title, year) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(title);
    // TMDB API sometimes is picky about year. If strict year search fails, we might want to try without, but per spec "based on title & year"
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&year=${year}`;

    https.get(url, (res) => {
      if (res.statusCode === 429) {
        resolve({ rateLimited: true });
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
             resolve({ error: `Status ${res.statusCode}: ${data}` });
             return;
        }
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const searchTitle = decodeURIComponent(query).toLowerCase().trim();
            const searchYear = String(year);
            
            // 1. Strict Match: Title + Year (parsed from release_date YYYY-MM-DD)
            // Special case: some titles have special chars that decode/encode differently or are slightly different in TMDB
            // Let's try to normalize a bit more (remove special chars, etc) if strict fail? 
            // For now, just standard trim/lower.
            
            const strictMatches = json.results.filter(m => {
                const mTitle = m.title.toLowerCase().trim();
                const mYear = m.release_date ? m.release_date.split('-')[0] : '';
                return mTitle === searchTitle && mYear === searchYear;
            });

            if (strictMatches.length > 0) {
                // If multiple exact matches, pick most popular
                strictMatches.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                resolve({ id: strictMatches[0].id, title: strictMatches[0].title });
            } else {
                 // 2. Lenient Year Match (±1 year) but EXACT Title
                 const lenientMatches = json.results.filter(m => {
                    const mTitle = m.title.toLowerCase().trim();
                    const mYear = m.release_date ? parseInt(m.release_date.split('-')[0]) : 0;
                    const targetYear = parseInt(searchYear);
                    return mTitle === searchTitle && Math.abs(mYear - targetYear) <= 1;
                });

                if (lenientMatches.length > 0) {
                     lenientMatches.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                     resolve({ id: lenientMatches[0].id, title: lenientMatches[0].title });
                } else {
                    // 3. Fallback: check for title alias or slightly different punctuation?
                    // "WALL-E" in TMDB is "WALL·E" (middle dot). 
                    // "9 1/2 Weeks" might be "9½ Weeks".
                    // Let's try a normalized comparison (remove non-alphanumeric)
                    
                    const normalize = (s) => s.replace(/[^a-z0-9]/g, '');
                    const normalizedSearch = normalize(searchTitle);
                    
                    const fuzzyMatches = json.results.filter(m => {
                         const mNorm = normalize(m.title.toLowerCase());
                         const mYear = m.release_date ? m.release_date.split('-')[0] : '';
                         return mNorm === normalizedSearch && mYear === searchYear;
                    });
                    
                    if (fuzzyMatches.length > 0) {
                         fuzzyMatches.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                         resolve({ id: fuzzyMatches[0].id, title: fuzzyMatches[0].title });
                    } else {
                         resolve({ id: null, error: "No strict match found" });
                    }
                }
            }
          } else {
            resolve({ id: null });
          }
        } catch (e) {
          resolve({ error: e.message });
        }
      });
    }).on('error', (e) => resolve({ error: e.message }));
  });
}

async function processMovies() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`File not found: ${DATA_PATH}`);
    process.exit(1);
  }

  console.log(`Reading movies from ${DATA_PATH}`);
  const movies = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`Found ${movies.length} movies to process.`);

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  // Create a backup
  fs.copyFileSync(DATA_PATH, DATA_PATH + '.bak');
  console.log("Created backup at " + DATA_PATH + '.bak');

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    
    // Skip if already has tmdb_id
    if (movie.tmdb_id) {
      skipped++;
      // Uncomment to see skipped output, but keeping it clean for now
      // process.stdout.write(`[${i + 1}/${movies.length}] Skipping "${movie.title}" (already has ID)\n`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${movies.length}] Searching for "${movie.title}" (${movie.year})... `);

    let result = await fetchTmdbId(movie.title, movie.year);
    
    // Handle Rate Limiting
    while (result.rateLimited) {
       process.stdout.write(' (Rate Limit 429, waiting 2s)...');
       await new Promise(r => setTimeout(r, 2000));
       result = await fetchTmdbId(movie.title, movie.year);
    }

    if (result.id) {
      movie.tmdb_id = result.id;
      updated++;
      console.log(`Found ID: ${result.id}`);
    } else if (result.error) {
      failed++;
      console.log(`Error: ${result.error}`);
    } else {
      failed++; 
      console.log(`Not found.`);
    }

    // Rate limiting buffer (TMDB allows ~40-50 requests/10s usually, so 250ms is safe)
    await new Promise(r => setTimeout(r, 250));
    
    // Periodic save
    if (updated > 0 && updated % 20 === 0) {
       fs.writeFileSync(DATA_PATH, JSON.stringify(movies, null, 2));
    }
  }

  // Final save
  fs.writeFileSync(DATA_PATH, JSON.stringify(movies, null, 2));
  console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}, Failed/Not Found: ${failed}`);
}

processMovies();
