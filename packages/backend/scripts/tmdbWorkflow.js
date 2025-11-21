
const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require("convex/browser");

// Load environment variables
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          process.env[match[1]] = match[2];
        }
      });
    }
  } catch (e) {
    console.error("Failed to load .env.local", e);
  }
}

loadEnv();

const CONVEX_URL = process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const DATA_DIR = path.join(__dirname, '../sample_data_structures/tmdb_movies');

async function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

async function fetchAndSaveMovie(tmdbId) {
  console.log(`Fetching movie ${tmdbId} via Convex...`);
  try {
    // Call the Convex action to fetch data (using server-side API key)
    const result = await client.action("tmdbLocalFetch:fetchAndSaveMovie", { tmdbId: parseInt(tmdbId) });
    
    if (!result.success) {
      console.error(`Failed to fetch movie: ${result.message}`);
      return;
    }

    await ensureDir();
    const filePath = path.join(DATA_DIR, `${tmdbId}.json`);
    
    // Update status to 'downloaded' locally
    const movieData = result.movieData;
    movieData.import_status = 'downloaded';
    
    fs.writeFileSync(filePath, JSON.stringify(movieData, null, 2));
    console.log(`Successfully saved movie data to ${filePath}`);
    return movieData;
  } catch (error) {
    console.error("Error in fetchAndSaveMovie:", error);
  }
}

async function importLocalMovie(tmdbId) {
  const filePath = path.join(DATA_DIR, `${tmdbId}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}. Run fetch first.`);
    return;
  }

  console.log(`Reading local file for movie ${tmdbId}...`);
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const movieData = JSON.parse(fileContent);
    
    console.log(`Importing movie "${movieData.db_structure_data.title}" to Convex...`);
    
    const result = await client.mutation("dbImporter:createMovieFromTmdbData", movieData.db_structure_data);
    
    if (result.success) {
      console.log(`Successfully imported movie! ID: ${result.movieId} (${result.updated ? 'Updated' : 'Created'})`);
      
      // Update local status
      movieData.import_status = 'imported';
      movieData.convex_id = result.movieId;
      movieData.imported_at = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(movieData, null, 2));
    } else {
      console.error(`Import failed: ${result.message}`);
    }
  } catch (error) {
    console.error("Error in importLocalMovie:", error);
  }
}

async function runWorkflow(importType, ...args) {
  switch (importType) {
    case 'fetch-single':
      if (!args[0]) {
        console.error("Usage: node tmdbWorkflow.js fetch-single <tmdbId>");
        break;
      }
      await fetchAndSaveMovie(args[0]);
      break;
      
    case 'import-single':
       if (!args[0]) {
        console.error("Usage: node tmdbWorkflow.js import-single <tmdbId>");
        break;
      }
      await importLocalMovie(args[0]);
      break;
      
    case 'full-single':
       if (!args[0]) {
        console.error("Usage: node tmdbWorkflow.js full-single <tmdbId>");
        break;
      }
      const data = await fetchAndSaveMovie(args[0]);
      if (data) {
        await importLocalMovie(args[0]);
      }
      break;

    case 'fetch-popular':
      const pages = args[0] ? parseInt(args[0]) : 1;
      console.log(`Fetching ${pages} pages of popular movies...`);
      const popResult = await client.action("tmdbLocalFetch:fetchAndSavePopularMovies", { limit: pages });
      if (popResult.success) {
        console.log(`Fetched ${popResult.successfullyProcessed} movies.`);
        await ensureDir();
        for (const item of popResult.results) {
            // item is the result of fetchAndSaveMovie which wraps the data
            const mData = item.movieData;
            mData.import_status = 'downloaded';
            const fp = path.join(DATA_DIR, `${mData.tmdb_id}.json`);
            fs.writeFileSync(fp, JSON.stringify(mData, null, 2));
        }
        console.log("Saved all movies locally.");
      } else {
        console.error("Failed:", popResult.message);
      }
      break;

    case 'fetch-top-rated':
      const trPages = args[0] ? parseInt(args[0]) : 1;
      console.log(`Fetching ${trPages} pages of top rated movies...`);
      const trResult = await client.action("tmdbLocalFetch:fetchAndSaveTopRatedMovies", { limit: trPages });
      if (trResult.success) {
        console.log(`Fetched ${trResult.successfullyProcessed} movies.`);
        await ensureDir();
        for (const item of trResult.results) {
            const mData = item.movieData;
            mData.import_status = 'downloaded';
            const fp = path.join(DATA_DIR, `${mData.tmdb_id}.json`);
            fs.writeFileSync(fp, JSON.stringify(mData, null, 2));
        }
        console.log("Saved all movies locally.");
      }
      break;

    case 'import-all-local':
      if (!fs.existsSync(DATA_DIR)) {
        console.log("No data directory found.");
        break;
      }
      const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
      console.log(`Found ${files.length} local files.`);
      for (const file of files) {
        const id = file.replace('.json', '');
        await importLocalMovie(id);
      }
      break;

    case 'direct-import':
      if (!args[0]) {
        console.error("Usage: node tmdbWorkflow.js direct-import <tmdbId>");
        break;
      }
      console.log(`Running direct import for movie ${args[0]}...`);
      const directResult = await client.action("execConvexImportTmdbWorkflow:runTmdbDirectImportWorkflow", { 
        importType: 'single',
        tmdbId: parseInt(args[0]) 
      });
      
      if (directResult.success) {
        console.log(`Direct import successful! Movie ID: ${directResult.importResult.movieId} (${directResult.importResult.updated ? 'Updated' : 'Created'})`);
      } else {
        console.error(`Direct import failed: ${directResult.message}`);
        if (directResult.error) console.error(directResult.error);
      }
      break;

    case 'direct-popular':
      const pPages = args[0] ? parseInt(args[0]) : 1;
      console.log(`Running direct import for ${pPages} pages of popular movies...`);
      const popDirResult = await client.action("execConvexImportTmdbWorkflow:runTmdbDirectImportWorkflow", { 
        importType: 'popular',
        limit: pPages 
      });
      
      if (popDirResult.success) {
        const s = popDirResult.stats;
        console.log(`
Popular Import Completed:
-------------------------
Found:    ${s.found}
Skipped:  ${s.skipped_existing} (Already in DB)
Imported: ${s.imported}
Failed:   ${s.failed}
Total Processed Pages: ${s.pages_processed}
`);
      } else {
        console.error(`Direct popular import failed: ${popDirResult.message}`);
        if (popDirResult.error) console.error(popDirResult.error);
      }
      break;

    case 'direct-top-rated':
      const tPages = args[0] ? parseInt(args[0]) : 1;
      console.log(`Running direct import for ${tPages} pages of top rated movies...`);
      const topDirResult = await client.action("execConvexImportTmdbWorkflow:runTmdbDirectImportWorkflow", { 
        importType: 'top_rated',
        limit: tPages 
      });
      
      if (topDirResult.success) {
        const s = topDirResult.stats;
        console.log(`
Top Rated Import Completed:
---------------------------
Found:    ${s.found}
Skipped:  ${s.skipped_existing} (Already in DB)
Imported: ${s.imported}
Failed:   ${s.failed}
Total Processed Pages: ${s.pages_processed}
`);
      } else {
        console.error(`Direct top rated import failed: ${topDirResult.message}`);
        if (topDirResult.error) console.error(topDirResult.error);
      }
      break;

    case 'status':
      if (!fs.existsSync(DATA_DIR)) {
        console.log("No data directory found. 0 movies downloaded.");
        break;
      }
      const allFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
      let importedCount = 0;
      let pendingCount = 0;
      
      for (const file of allFiles) {
        const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        if (content.import_status === 'imported') {
          importedCount++;
        } else {
          pendingCount++;
        }
      }
      
      console.log(`
Local Data Status:
------------------
Total Fetched: ${allFiles.length}
Imported:      ${importedCount}
Pending:       ${pendingCount}
Location:      ${DATA_DIR}
`);
      break;

    default:
      console.log(`
Usage: node tmdbWorkflow.js <command> [args]

Commands:
  fetch-single <tmdbId>    Fetch movie from TMDB (via Convex) and save locally
  fetch-popular [pages]    Fetch popular movies (default 1 page = 20 movies)
  fetch-top-rated [pages]  Fetch top rated movies
  import-single <tmdbId>   Import locally saved movie to Convex
  full-single <tmdbId>     Fetch and immediately import a single movie
  direct-import <tmdbId>   Run direct server-side import (fetching + importing in one go)
  direct-popular [pages]   Run direct server-side import for Popular movies (default 1 page)
  direct-top-rated [pages] Run direct server-side import for Top Rated movies (default 1 page)
  import-all-local         Import all JSON files found in sample_data_structures/tmdb_movies
  status                   Show local data status
`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  runWorkflow('help');
} else {
  runWorkflow(args[0], ...args.slice(1));
}
