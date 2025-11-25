import { ConvexHttpClient } from "convex/browser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { api } from "../convex/_generated/api.js";
import * as dotenv from 'dotenv';

// ESM dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const CONVEX_URL = process.env.CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL not found in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const DATA_PATH = path.join(__dirname, '../../../test_data/movies.json');
const CHECKPOINT_FILE = path.join(__dirname, '.import_checkpoint');

// Arguments parsing
const args = process.argv.slice(2);
const ignoreDuplicates = args.includes('--ignore-duplicates');
// Default is to stop on error, unless we are ignoring duplicates (force restart mode) where we might want to try all
const stopOnError = !args.includes('--continue-on-error') && !ignoreDuplicates;

async function importMovies() {
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`File not found: ${DATA_PATH}`);
    process.exit(1);
  }

  console.log(`Running in mode: ${ignoreDuplicates ? 'Ignore Duplicates / Restart' : 'Resume / Stop on Error'}`);
  console.log(`Stop on error: ${stopOnError}`);

  console.log(`Reading movies from ${DATA_PATH}`);
  const movies = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`Found ${movies.length} movies to process.`);

  let startIndex = 0;
  // Only use checkpoint if NOT ignoring duplicates
  if (!ignoreDuplicates && fs.existsSync(CHECKPOINT_FILE)) {
    const savedIndex = parseInt(fs.readFileSync(CHECKPOINT_FILE, 'utf8').trim());
    if (!isNaN(savedIndex)) {
      startIndex = savedIndex;
      console.log(`Resuming from index ${startIndex}...`);
    }
  }

  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (let i = startIndex; i < movies.length; i++) {
    const movie = movies[i];
    
    if (!movie.tmdb_id) {
        console.log(`[${i + 1}/${movies.length}] Skipping "${movie.title}" - No TMDB ID`);
        skippedCount++;
        continue;
    }

    console.log(`[${i + 1}/${movies.length}] Importing "${movie.title}" (TMDB: ${movie.tmdb_id})...`);

    try {
      // Convert string IDs to numbers if necessary, but API expects number
      const tmdbId = parseInt(String(movie.tmdb_id));

      const result = await client.action(api.execConvexImportTmdbWorkflow.importMovieFromLocalJson, {
        tmdbId: tmdbId,
        url: movie.url,
        image_id_list: movie.image_id_list
      });

      if (result.success) {
        console.log(`  ✅ Success: ${result.message}`);
        successCount++;
        // Save checkpoint on success if we are in resume mode
        if (!ignoreDuplicates) {
            fs.writeFileSync(CHECKPOINT_FILE, String(i + 1));
        }
      } else {
        console.error(`  ❌ Failed: ${result.error}`);
        failedCount++;
        if (stopOnError) {
            process.exit(1);
        }
      }

    } catch (error) {
      console.error(`  ❌ Exception: ${error.message}`);
      failedCount++;
      if (stopOnError) {
          process.exit(1);
      }
    }

    // Rate limiting buffer
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log("\n--------------------------------------------------");
  console.log(`Import Completed.`);
  console.log(`Total: ${movies.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log("--------------------------------------------------");
}

importMovies();
